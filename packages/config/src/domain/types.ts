import { z } from 'zod';
import {
  UpdateHospitalConfigSchema,
  UpdateOpdConfigSchema,
  UpdateBillingProfileSchema,
} from './schemas';

export type HospitalConfig = z.infer<typeof UpdateHospitalConfigSchema>;
export type OpdConfig = z.infer<typeof UpdateOpdConfigSchema>;
export type BillingProfile = z.infer<typeof UpdateBillingProfileSchema>;

export interface ConfigProvider {
  getHospitalConfig(hospitalId: string): Promise<HospitalConfig | null>;
  updateHospitalConfig(hospitalId: string, data: HospitalConfig): Promise<HospitalConfig>;

  getOpdConfig(hospitalId: string): Promise<OpdConfig | null>;
  updateOpdConfig(hospitalId: string, data: OpdConfig): Promise<OpdConfig>;

  getBillingProfile(hospitalId: string): Promise<BillingProfile | null>;
  updateBillingProfile(hospitalId: string, data: BillingProfile): Promise<BillingProfile>;
}
