export class RankingEngine {
    static exactMatch(query, doc) {
        var _a;
        const terms = query.toLowerCase().split(/\s+/);
        for (const term of terms) {
            if (doc.title.toLowerCase().includes(term))
                return 1.0;
            if ((_a = doc.content) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(term))
                return 0.8;
        }
        return 0.2;
    }
    static prefixMatch(query, doc) {
        var _a;
        const terms = query.toLowerCase().split(/\s+/);
        let matchCount = 0;
        const docTerms = `${doc.title.toLowerCase()} ${((_a = doc.content) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ''}`.split(/\s+/);
        for (const term of terms) {
            if (docTerms.some((dt) => dt.startsWith(term))) {
                matchCount++;
            }
        }
        return matchCount > 0 ? Math.min(1.0, matchCount / terms.length + 0.2) : 0.1;
    }
    static fuzzyMatch(query, doc) {
        // Very basic Levenshtein approximation via common chars / fast similarity check
        const qLower = query.toLowerCase();
        const tLower = doc.title.toLowerCase();
        // If exact includes, it's not fuzzy
        if (tLower.includes(qLower))
            return 1.0;
        let common = 0;
        for (const char of new Set(qLower)) {
            if (tLower.includes(char))
                common++;
        }
        const ratio = common / Math.max(qLower.length, 1);
        return ratio > 0.7 ? 0.8 : ratio > 0.5 ? 0.5 : 0.1;
    }
    static recencyScore(doc) {
        const daysOld = (Date.now() - doc.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
        return Math.max(0.1, 1.0 - daysOld / 365);
    }
    static calculateRelevance(query, document, context) {
        // Extract dynamic popularity if provided in metadata (e.g., views, priority)
        let popularityScore = 0.5;
        if (document.metadata) {
            if (typeof document.metadata.views === 'number') {
                popularityScore = Math.min(1.0, 0.5 + document.metadata.views / 1000);
            }
            else if (document.metadata.priority === 'HIGH' ||
                document.metadata.severity === 'CRITICAL') {
                popularityScore = 0.9;
            }
        }
        const scores = {
            exact: this.exactMatch(query, document),
            prefix: this.prefixMatch(query, document),
            fuzzy: this.fuzzyMatch(query, document),
            recency: this.recencyScore(document),
            popularity: popularityScore,
            hospital: document.hospitalId === context.hospitalId ? 1.0 : 0.5,
        };
        return (scores.exact * 0.4 +
            scores.prefix * 0.15 +
            scores.fuzzy * 0.1 +
            scores.recency * 0.2 +
            scores.popularity * 0.1 +
            scores.hospital * 0.05);
    }
}
