export declare class RetryEngine {
    static moveToDeadLetter(notificationId: string, reason: string, error: string): Promise<void>;
    static scheduleRetry(notificationId: string, delayMs: number): Promise<void>;
}
export declare class Scheduler {
    static schedule(input: {
        notificationId: string;
        scheduledAt: Date;
    }): Promise<void>;
    static cancel(notificationId: string): Promise<void>;
}
