import { prisma } from '@haspataal/db';

export interface TenantConfig {
  hospitalId: string;
  branding: {
    logoUrl?: string;
    brandColor?: string;
    letterheadTemplate?: string;
  };
  billing: {
    gstInclusivePricing: boolean;
    invoicePrefix: string;
    acceptedTpas: string[];
    currency: string;
  };
  operational: {
    timezone: string;
    workingDays: string[];
    openTime?: string;
    closeTime?: string;
  };
}

export class TenantConfigService {
  /**
   * Retrieves the full unified configuration for a specific hospital tenant.
   * This avoids hardcoding logic (e.g., "if hospitalId === X then GST = true")
   * and scales gracefully to 100+ hospitals.
   */
  async getConfig(hospitalId: string): Promise<TenantConfig> {
    const hospital = await prisma.hospitalsMaster.findUnique({
      where: { id: hospitalId },
      include: {
        billingProfile: true,
      },
    });

    if (!hospital) throw new Error(`Hospital ${hospitalId} not found`);

    return {
      hospitalId: hospital.id,
      branding: {
        logoUrl: hospital.logoUrl || undefined,
        brandColor: hospital.brandColor || undefined,
        letterheadTemplate: hospital.letterheadTemplate || undefined,
      },
      billing: {
        gstInclusivePricing: hospital.gstInclusivePricing,
        invoicePrefix: hospital.invoicePrefix,
        // In a real implementation, acceptedTpas would join against a TpaMaster table
        acceptedTpas: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Bajaj Allianz'],
        currency: 'INR',
      },
      operational: {
        timezone: hospital.timezone,
        workingDays: hospital.workingDays,
        openTime: hospital.openTime || undefined,
        closeTime: hospital.closeTime || undefined,
      },
    };
  }

  /**
   * Checks if a specific feature is enabled for a tenant.
   * Useful for progressive rollouts.
   */
  async isFeatureEnabled(hospitalId: string, featureFlag: string): Promise<boolean> {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: featureFlag },
    });

    if (!flag || !flag.enabled || flag.rolloutType === 'OFF') return false;
    if (flag.rolloutType === 'GLOBAL') return true;
    if (flag.rolloutType === 'BETA') {
      return flag.betaHospitalIds.includes(hospitalId);
    }

    if (flag.rolloutType === 'CANARY') {
      let hash = 0;
      const str = `${hospitalId}:${featureFlag}`;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const bucket = Math.abs(hash) % 100;
      return bucket < flag.rolloutPct;
    }

    return false;
  }
}

export const tenantConfigService = new TenantConfigService();
