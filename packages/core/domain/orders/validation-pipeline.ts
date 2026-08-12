import { PrismaClient } from '@prisma/client';

export enum ValidationWarningType {
  DUPLICATE_ORDER = 'DUPLICATE_ORDER',
  DRUG_INTERACTION = 'DRUG_INTERACTION',
  ALLERGY = 'ALLERGY',
  RENAL_DOSE = 'RENAL_DOSE',
  PREGNANCY = 'PREGNANCY',
}

export interface ValidationWarning {
  type: ValidationWarningType;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  relatedItemCode?: string;
}

export interface ValidationResult {
  status: 'PASS' | 'FAIL' | 'INDETERMINATE';
  warnings: ValidationWarning[];
  errors?: string[];
}

export interface OrderContextPayload {
  patientId: string;
  items: { catalogVersionId: string; catalogCode: string }[];
}

export class OrderValidationPipeline {
  constructor(private prisma: PrismaClient) {}

  async validate(payload: OrderContextPayload): Promise<ValidationResult> {
    const warnings: ValidationWarning[] = [];
    let isIndeterminate = false;
    const errors: string[] = [];

    // 1. Duplicate Detection Check
    const duplicateWarnings = await this.checkDuplicates(payload);
    warnings.push(...duplicateWarnings);

    // 2. Drug Interaction Check (future LIS/Pharmacy integration)
    const interactionResult = this.checkDrugInteractions(payload);
    if (interactionResult.status === 'INDETERMINATE') {
      isIndeterminate = true;
      errors.push('DRUG_INTERACTION_SERVICE_UNAVAILABLE');
    }

    // 3. Allergy Check
    const allergyResult = this.checkAllergies(payload);
    if (allergyResult.status === 'INDETERMINATE') {
      isIndeterminate = true;
      errors.push('ALLERGY_SERVICE_UNAVAILABLE');
    }

    let status: ValidationResult['status'] = 'PASS';
    if (isIndeterminate) {
      status = 'INDETERMINATE';
    } else if (warnings.length > 0) {
      // In a real system, some warnings might cause FAIL, others PASS.
      // For now, if there are warnings but it's not INDETERMINATE, it's a FAIL.
      status = 'FAIL';
    }

    return {
      status,
      warnings,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private async checkDuplicates(payload: OrderContextPayload): Promise<ValidationWarning[]> {
    const warnings: ValidationWarning[] = [];

    // Find recent completed orders for the same patient in the last 24 hours
    const recentDate = new Date();
    recentDate.setHours(recentDate.getHours() - 24);

    const recentOrders = await this.prisma.orderItem.findMany({
      where: {
        order: {
          patientId: payload.patientId,
        },
        status: { in: ['COMPLETED', 'IN_PROGRESS', 'REQUESTED'] },
        createdAt: { gte: recentDate },
      },
      include: {
        catalogVersion: {
          include: { catalog: true },
        },
      },
    });

    for (const item of payload.items) {
      const isDuplicate = recentOrders.some(
        (ro) => ro.catalogVersion.catalog.code === item.catalogCode,
      );
      if (isDuplicate) {
        warnings.push({
          type: ValidationWarningType.DUPLICATE_ORDER,
          message: `Possible duplicate: ${item.catalogCode} was ordered recently.`,
          severity: 'MEDIUM',
          relatedItemCode: item.catalogCode,
        });
      }
    }

    return warnings;
  }

  private checkDrugInteractions(payload: OrderContextPayload): { status: 'PASS' | 'INDETERMINATE' } {
    // Explicit unavailable state rather than faking safety
    return { status: 'INDETERMINATE' };
  }

  private checkAllergies(payload: OrderContextPayload): { status: 'PASS' | 'INDETERMINATE' } {
    // Explicit unavailable state rather than faking safety
    return { status: 'INDETERMINATE' };
  }
}
