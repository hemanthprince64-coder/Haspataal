import { prisma } from '@haspataal/db';
import { PlaceClinicalOrderUseCase } from '@haspataal/orders';
import { ClinicalOrderType, OrderPriority } from '@haspataal/types';
import { v4 as uuidv4 } from 'uuid';

export interface PlaceRadiologyOrderDTO {
  encounterId: string;
  patientId: string;
  hospitalId: string;
  doctorId?: string;
  modality: string;
  priority?: string;
  reason?: string;
  requestedBy: string;
}

export class PlaceRadiologyOrderUseCase {
  static async execute(data: PlaceRadiologyOrderDTO) {
    // 1. Create the base ClinicalOrder via the orders package engine
    const orderResult = await PlaceClinicalOrderUseCase.execute({
      encounterId: data.encounterId,
      patientId: data.patientId,
      hospitalId: data.hospitalId,
      doctorId: data.doctorId,
      type: ClinicalOrderType.RADIOLOGY,
      priority: (data.priority as OrderPriority) || OrderPriority.ROUTINE,
      reason: data.reason,
      requestedBy: data.requestedBy,
      payload: { modality: data.modality },
    });

    if (!orderResult.success || !orderResult.order) {
      return { success: false, error: orderResult.error };
    }

    // Generate a default accession number (e.g., RAD-YYYYMMDD-UUID)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const accessionNumber = `RAD-${dateStr}-${uuidv4().slice(0, 6).toUpperCase()}`;

    // 2. Create the specialized ImagingStudy
    const study = await prisma.imagingStudy.create({
      data: {
        clinicalOrderId: orderResult.order.id,
        encounterId: data.encounterId,
        patientId: data.patientId,
        hospitalId: data.hospitalId,
        modality: data.modality,
        accessionNumber,
        status: 'ORDERED',
      },
    });

    return { success: true, order: orderResult.order, study };
  }
}
