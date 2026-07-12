import { PrismaClient, OrderItem } from '@prisma/client';

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
  passed: boolean;
  warnings: ValidationWarning[];
}

export interface OrderContextPayload {
  patientId: string;
  items: { catalogVersionId: string; catalogCode: string }[];
}

export class OrderValidationPipeline {
  constructor(private prisma: PrismaClient) {}

  async validate(payload: OrderContextPayload): Promise<ValidationResult> {
    const warnings: ValidationWarning[] = [];

    // 1. Duplicate Detection Check
    const duplicateWarnings = await this.checkDuplicates(payload);
    warnings.push(...duplicateWarnings);

    // 2. Mock Drug Interaction Check (future LIS/Pharmacy integration)
    const interactionWarnings = this.checkDrugInteractions(payload);
    warnings.push(...interactionWarnings);

    // 3. Mock Allergy Check
    const allergyWarnings = this.checkAllergies(payload);
    warnings.push(...allergyWarnings);

    return {
      passed: warnings.length === 0,
      warnings,
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

  private checkDrugInteractions(payload: OrderContextPayload): ValidationWarning[] {
    // Stub implementation
    return [];
  }

  private checkAllergies(payload: OrderContextPayload): ValidationWarning[] {
    // Stub implementation
    return [];
  }
}
