export class RankingEngine {
  static calculateRelevance(query, document, context) {
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
  static exactMatch(query, doc) {
    var _a;
    const terms = query.toLowerCase().split(/\s+/);
    for (const term of terms) {
      if (doc.title.toLowerCase().includes(term)) return 1.0;
      if ((_a = doc.content) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(term))
        return 0.8;
    }
    return 0.2;
  }
  static prefixMatch(_query, _doc) {
    return 0.5; // Placeholder
  }
  static fuzzyMatch(_query, _doc) {
    return 0.5; // Placeholder
  }
  static recencyScore(doc) {
    const daysOld = (Date.now() - doc.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0.1, 1.0 - daysOld / 365);
  }
}
