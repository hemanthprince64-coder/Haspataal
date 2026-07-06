export interface SearchDocument {
    id: string;
    entityType: string;
    entityId: string;
    hospitalId?: string;
    patientId?: string;
    title: string;
    content?: string;
    metadata?: Record<string, any>;
    searchVector?: string;
}
export declare function buildSearchDocument(entityType: string, entity: any): SearchDocument;
//# sourceMappingURL=document-builder.d.ts.map