export declare class DigestEngine {
    static generateDigest(patientId: string, type: 'daily' | 'weekly' | 'pregnancy'): Promise<{
        type: "daily" | "weekly" | "pregnancy";
        count: number;
        items: {
            channel: any;
            body: any;
        }[];
    }>;
}
