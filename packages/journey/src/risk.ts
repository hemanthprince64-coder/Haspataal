import { prisma } from '@haspataal/db';

export class RiskEngine {
  static async calculate(journeyId: string, factors: Record<string, number>) {
    const scores = Object.values(factors);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    const risk = await prisma.journeyRisk.upsert({
      where: { journeyId },
      update: { score: avgScore, factors },
      create: { journeyId, score: avgScore, factors },
    });
    return risk;
  }

  static async get(journeyId: string) {
    return await prisma.journeyRisk.findUnique({ where: { journeyId } });
  }
}
