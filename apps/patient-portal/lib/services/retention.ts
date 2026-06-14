/**
 * Dropout Risk / Retention Score Calculator
 * Predicts ANC dropout risk based on visit adherence and profile data
 */

interface PregnancyProfileForRetention {
  gestationalAge?: number | null;
  visits?: Array<{
    visitDate: Date;
    visitNumber: number;
  }>;
  retentionAlerts?: Array<{ status: string }>;
}

/**
 * Returns a dropout risk score from 0-100 (100 = highest risk)
 */
export function predictDropoutRisk(profile: PregnancyProfileForRetention): number {
  let score = 0;
  const visits = profile.visits ?? [];
  const ga = profile.gestationalAge ?? 0;

  // ── Visit adherence ────────────────────────────────────────
  // Expected: at least 4 ANC visits (WHO recommendation)
  const expectedVisits = ga >= 36 ? 4 : ga >= 28 ? 3 : ga >= 16 ? 2 : 1;
  const visitDeficit = Math.max(0, expectedVisits - visits.length);
  score += visitDeficit * 20;

  // ── Recency of last visit ──────────────────────────────────
  if (visits.length > 0) {
    const lastVisit = visits[visits.length - 1];
    const daysSinceLastVisit = Math.floor(
      (Date.now() - new Date(lastVisit.visitDate).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLastVisit > 90) score += 30;
    else if (daysSinceLastVisit > 42) score += 15;
  } else {
    // No visits at all
    score += 40;
  }

  // ── Third trimester with no recent visit ──────────────────
  if (ga >= 28 && visits.length < 3) {
    score += 20;
  }

  return Math.min(100, score);
}
