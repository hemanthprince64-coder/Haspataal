import { HospitalConfig, OpdConfig, BillingProfile, ConfigProvider } from './domain/types';
export declare class ConfigEngine implements ConfigProvider {
    /**
     * Helper to write an outbox event.
     */
    private dispatchConfigUpdatedEvent;
    getHospitalConfig(hospitalId: string): Promise<HospitalConfig | null>;
    updateHospitalConfig(hospitalId: string, data: HospitalConfig): Promise<HospitalConfig>;
    getOpdConfig(hospitalId: string): Promise<OpdConfig | null>;
    updateOpdConfig(hospitalId: string, data: OpdConfig): Promise<OpdConfig>;
    getBillingProfile(hospitalId: string): Promise<BillingProfile | null>;
    updateBillingProfile(hospitalId: string, data: BillingProfile): Promise<BillingProfile>;
}
