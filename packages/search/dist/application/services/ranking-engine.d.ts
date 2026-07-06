import { SearchResult } from '../../domain/types';
export declare class RankingEngine {
    private static exactMatch;
    private static prefixMatch;
    private static fuzzyMatch;
    private static recencyScore;
    static calculateRelevance(query: string, document: SearchResult, context: {
        userId?: string;
        hospitalId?: string;
    }): number;
}
//# sourceMappingURL=ranking-engine.d.ts.map