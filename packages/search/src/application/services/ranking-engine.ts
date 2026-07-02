import { SearchResult } from '../../domain/types';

export class RankingEngine {
  static calculateRelevance(
    query: string,
    document: SearchResult,
    context: { userId?: string; hospitalId?: string },
  ): number {
    const scores = {
      exact: this.exactMatch(query, document),
      prefix: this.prefixMatch(query, document),
      fuzzy: this.fuzzyMatch(query, document),
      recency: this.recencyScore(document),
      popularity: 0.5, // Default until logs available
      hospital: document.hospitalId === context.hospitalId ? 1.0 : 0.5,
    };

    return (
      scores.exact * 0.4 +
      scores.prefix * 0.15 +
      scores.fuzzy * 0.1 +
      scores.recency * 0.2 +
      scores.popularity * 0.1 +
      scores.hospital * 0.05
    );
  }

  private static exactMatch(query: string, doc: SearchResult): number {
    const terms = query.toLowerCase().split(/\s+/);
    for (const term of terms) {
      if (doc.title.toLowerCase().includes(term)) return 1.0;
      if (doc.content?.toLowerCase().includes(term)) return 0.8;
    }
    return 0.2;
  }

  private static prefixMatch(_query: string, _doc: SearchResult): number {
    return 0.5; // Placeholder
  }

  private static fuzzyMatch(_query: string, _doc: SearchResult): number {
    return 0.5; // Placeholder
  }

  private static recencyScore(doc: SearchResult): number {
    const daysOld = (Date.now() - doc.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0.1, 1.0 - daysOld / 365);
  }
}
