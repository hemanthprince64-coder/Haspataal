import { PrismaClient, OrderStatus, OrderPriority, ClinicalContext } from '@prisma/client';

export interface CreateOrderDto {
  hospitalId: string;
  patientId: string;
  clinicalContext: ClinicalContext;
  contextId?: string;
  orderedBy: string;
  priority?: OrderPriority;
  clinicalNotes?: string;
  items: {
    catalogVersionId: string;
    quantity?: number;
    clinicalNotes?: string;
    departmentId?: string;
  }[];
}

export interface AmendOrderDto {
  orderId: string;
  actorId: string;
  reasonForChange: string;
  priority?: OrderPriority;
  clinicalNotes?: string;
  items: {
    catalogVersionId: string;
    quantity?: number;
    clinicalNotes?: string;
    departmentId?: string;
  }[];
}

export class OrderStateService {
  constructor(private prisma: PrismaClient) {}

  async createOrder(dto: CreateOrderDto) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Create the base order
      const order = await tx.order.create({
        data: {
          hospitalId: dto.hospitalId,
          patientId: dto.patientId,
          clinicalContext: dto.clinicalContext,
          contextId: dto.contextId,
          orderedBy: dto.orderedBy,
        },
      });

      // 2. Create the first version (V1)
      const version = await tx.orderVersion.create({
        data: {
          orderId: order.id,
          versionNumber: 1,
          status: OrderStatus.REQUESTED,
          priority: dto.priority || OrderPriority.ROUTINE,
          clinicalNotes: dto.clinicalNotes,
          createdBy: dto.orderedBy,
        },
      });

      // 3. Link base order to active version
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { activeVersionId: version.id },
      });

      // 4. Create items linked to the order
      const items = await Promise.all(
        dto.items.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              catalogVersionId: item.catalogVersionId,
              departmentId: item.departmentId,
              quantity: item.quantity || 1,
              clinicalNotes: item.clinicalNotes,
              status: OrderStatus.REQUESTED,
            },
          }),
        ),
      );

      // 5. Emit ORDER_REQUESTED outbox event
      await tx.outboxEvent.create({
        data: {
          aggregateId: order.id,
          aggregateType: 'ORDER',
          eventType: 'ORDER_REQUESTED',
          payload: { orderId: order.id, items: items.map((i) => i.id) },
        },
      });

      return { order: updatedOrder, version, items };
    });
  }

  async amendOrder(dto: AmendOrderDto) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({
        where: { id: dto.orderId },
        include: { activeVersion: true },
      });

      if (!order.activeVersion) {
        throw new Error('Order has no active version');
      }

      if (
        order.activeVersion.status === OrderStatus.CANCELLED ||
        order.activeVersion.status === OrderStatus.COMPLETED
      ) {
        throw new Error('Cannot amend a completed or cancelled order');
      }

      const nextVersionNumber = order.activeVersion.versionNumber + 1;

      // Create new version
      const version = await tx.orderVersion.create({
        data: {
          orderId: order.id,
          versionNumber: nextVersionNumber,
          status: order.activeVersion.status,
          priority: dto.priority || order.activeVersion.priority,
          clinicalNotes: dto.clinicalNotes || order.activeVersion.clinicalNotes,
          reasonForChange: dto.reasonForChange,
          createdBy: dto.actorId,
        },
      });

      // Point base order to new version
      await tx.order.update({
        where: { id: order.id },
        data: { activeVersionId: version.id },
      });

      // For simplicity in this implementation, we overwrite all items.
      // In production, you'd match diffs to maintain execution state of existing items.
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });

      const items = await Promise.all(
        dto.items.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              catalogVersionId: item.catalogVersionId,
              departmentId: item.departmentId,
              quantity: item.quantity || 1,
              clinicalNotes: item.clinicalNotes,
              status: OrderStatus.REQUESTED, // Resetting status for amended items
            },
          }),
        ),
      );

      // Emit ORDER_AMENDED outbox event
      await tx.outboxEvent.create({
        data: {
          aggregateId: order.id,
          aggregateType: 'ORDER',
          eventType: 'ORDER_AMENDED',
          payload: { orderId: order.id, version: nextVersionNumber, items: items.map((i) => i.id) },
        },
      });

      return { order, version, items };
    });
  }

  async cancelOrder(orderId: string, actorId: string, reason: string) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { activeVersion: true },
      });

      if (order.activeVersion?.status === OrderStatus.COMPLETED) {
        throw new Error('Cannot cancel a completed order');
      }

      // 1. Update items to cancelled
      await tx.orderItem.updateMany({
        where: { orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      // 2. Create cancellation record
      await tx.orderCancellation.create({
        data: {
          orderId,
          reason,
          cancelledBy: actorId,
        },
      });

      // 3. Create a new version representing the CANCELLED state
      const nextVersionNumber = order.activeVersion ? order.activeVersion.versionNumber + 1 : 1;
      const version = await tx.orderVersion.create({
        data: {
          orderId,
          versionNumber: nextVersionNumber,
          status: OrderStatus.CANCELLED,
          priority: order.activeVersion?.priority || OrderPriority.ROUTINE,
          reasonForChange: 'Order Cancelled: ' + reason,
          createdBy: actorId,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { activeVersionId: version.id },
      });

      // Emit ORDER_CANCELLED event
      await tx.outboxEvent.create({
        data: {
          aggregateId: orderId,
          aggregateType: 'ORDER',
          eventType: 'ORDER_CANCELLED',
          payload: { orderId, reason },
        },
      });

      return { order, version };
    });
  }

  async completeOrderGroup(groupId: string, actorId: string) {
    // A helper to complete multiple orders linked by a groupId
    return await this.prisma.$transaction(async (tx) => {
      const orders = await tx.order.findMany({
        where: { groupId },
        include: { activeVersion: true },
      });

      for (const order of orders) {
        if (
          order.activeVersion?.status === OrderStatus.COMPLETED ||
          order.activeVersion?.status === OrderStatus.CANCELLED
        ) {
          continue;
        }

        const nextVersionNumber = order.activeVersion!.versionNumber + 1;
        const version = await tx.orderVersion.create({
          data: {
            orderId: order.id,
            versionNumber: nextVersionNumber,
            status: OrderStatus.COMPLETED,
            priority: order.activeVersion!.priority,
            reasonForChange: 'Group Completed',
            createdBy: actorId,
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { activeVersionId: version.id },
        });

        await tx.orderItem.updateMany({
          where: { orderId: order.id },
          data: { status: OrderStatus.COMPLETED },
        });

        await tx.outboxEvent.create({
          data: {
            aggregateId: order.id,
            aggregateType: 'ORDER',
            eventType: 'ORDER_COMPLETED',
            payload: { orderId: order.id },
          },
        });
      }
    });
  }
}
