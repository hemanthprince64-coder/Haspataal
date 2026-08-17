"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskEngine = void 0;
const db_1 = require("@haspataal/db");
class RiskEngine {
    static async calculate(journeyId, factors) {
        const scores = Object.values(factors);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const risk = await db_1.prisma.journeyRisk.upsert({
            where: { journeyId },
            update: { score: avgScore, factors },
            create: { journeyId, score: avgScore, factors },
        });
        return risk;
    }
    static async get(journeyId) {
        return await db_1.prisma.journeyRisk.findUnique({ where: { journeyId } });
    }
}
exports.RiskEngine = RiskEngine;
