import { SearchResult } from '../../domain/types';

export declare class RankingEngine {
  static calculateRelevance(
    query: string,
    document: SearchResult,
    context: {
      userId?: string;
      hospitalId?: string;
    },
  ): number;
  private static exactMatch;
  private static prefixMatch;
  private static fuzzyMatch;
  private static recencyScore;
}
//# sourceMappingURL=ranking-engine.d.ts.map
