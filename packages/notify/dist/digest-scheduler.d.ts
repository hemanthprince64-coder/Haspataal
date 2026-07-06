export declare class DigestScheduler {
    static scheduleDaily(): Promise<void>;
    static scheduleWeekly(): Promise<void>;
    static schedulePregnancy(patientId: string): Promise<void>;
}
