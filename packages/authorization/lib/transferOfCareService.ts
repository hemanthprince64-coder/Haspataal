import { PrismaClient, TransferStatus, ResponsibilityStatus } from '@prisma/client';

export class TransferOfCareService {
  constructor(private prisma: PrismaClient) {}

  async initiateTransfer(params: {
    initiatingDoctorId: string;
    receivingDoctorId: string;
    patientId: string;
    episodeId: string;
    hospitalId: string;
    reason: string;
  }) {
    return await this.prisma.transferOfCare.create({
      data: {
        initiatingDoctorId: params.initiatingDoctorId,
        receivingDoctorId: params.receivingDoctorId,
        patientId: params.patientId,
        episodeId: params.episodeId,
        hospitalId: params.hospitalId,
        reason: params.reason,
        status: TransferStatus.INITIATED,
      },
    });
  }

  async acceptTransfer(transferId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const transfer = await tx.transferOfCare.findUniqueOrThrow({ where: { id: transferId } });

      if (transfer.status !== TransferStatus.INITIATED) {
        throw new Error('Transfer must be INITIATED to accept.');
      }

      // 1. Mark transfer accepted (Optimistic concurrency with version)
      const acceptedTransfer = await tx.transferOfCare.update({
        where: { id: transferId, version: transfer.version },
        data: {
          status: TransferStatus.ACCEPTED,
          acceptedAt: new Date(),
          version: { increment: 1 },
        },
      });

      // 2. End current primary responsibility
      const currentPrimary = await tx.careResponsibility.findFirst({
        where: {
          episodeId: transfer.episodeId,
          patientId: transfer.patientId,
          isPrimary: true,
          status: ResponsibilityStatus.ACTIVE,
        },
      });

      if (currentPrimary) {
        await tx.careResponsibility.update({
          where: { id: currentPrimary.id },
          data: {
            status: ResponsibilityStatus.TRANSFERRED,
            endedAt: new Date(),
            terminationReason: 'TRANSFER_ACCEPTED',
          },
        });
      }

      // 3. Create new primary responsibility for receiving doctor
      await tx.careResponsibility.create({
        data: {
          doctorId: transfer.receivingDoctorId,
          patientId: transfer.patientId,
          episodeId: transfer.episodeId,
          isPrimary: true,
          status: ResponsibilityStatus.ACTIVE,
        },
      });

      return acceptedTransfer;
    });
  }

  async rejectTransfer(transferId: string) {
    return await this.prisma.transferOfCare.update({
      where: { id: transferId },
      data: {
        status: TransferStatus.REJECTED,
        rejectedAt: new Date(),
        version: { increment: 1 },
      },
    });
  }
}