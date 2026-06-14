/**
 * High-Risk Pregnancy Evaluator
 * Evaluates pregnancy profiles for high-risk indicators as per Bihar NHM guidelines
 */

interface PregnancyProfileForRisk {
  gestationalAge?: number | null;
  highRisk?: boolean;
  visits?: Array<{
    bpSystolic?: number | null;
    bpDiastolic?: number | null;
    hemoglobin?: number | null;
    weightKg?: number | null;
  }>;
  obstetricHistory?: Array<{ outcome?: string | null }>;
}

export interface HighRiskResult {
  isHighRisk: boolean;
  reasons: string[];
}

/**
 * Evaluates a pregnancy profile and returns high-risk status with reasons
 */
export function evaluateHighRisk(profile: PregnancyProfileForRisk): HighRiskResult {
  const reasons: string[] = [];
  const visits = profile.visits ?? [];
  const lastVisit = visits[visits.length - 1];

  // ── Blood Pressure ─────────────────────────────────────────
  if (lastVisit?.bpSystolic && lastVisit.bpSystolic >= 140) {
    reasons.push('Hypertension (systolic BP ≥ 140 mmHg)');
  }
  if (lastVisit?.bpDiastolic && lastVisit.bpDiastolic >= 90) {
    reasons.push('Hypertension (diastolic BP ≥ 90 mmHg)');
  }

  // ── Anaemia ────────────────────────────────────────────────
  if (lastVisit?.hemoglobin && lastVisit.hemoglobin < 7) {
    reasons.push('Severe anaemia (Hb < 7 g/dL)');
  } else if (lastVisit?.hemoglobin && lastVisit.hemoglobin < 10) {
    reasons.push('Moderate anaemia (Hb < 10 g/dL)');
  }

  // ── Obstetric History ──────────────────────────────────────
  const obsHistory = profile.obstetricHistory ?? [];
  const hasBadOutcome = obsHistory.some(
    (h) => h.outcome === 'stillbirth' || h.outcome === 'neonatal_death' || h.outcome === 'abortion',
  );
  if (hasBadOutcome) {
    reasons.push('Previous adverse obstetric outcome (stillbirth/neonatal death)');
  }

  // ── Late Presentation ──────────────────────────────────────
  if (profile.gestationalAge && profile.gestationalAge > 28 && visits.length < 3) {
    reasons.push('Late ANC registration with insufficient visits (3rd trimester, <3 visits)');
  }

  return {
    isHighRisk: reasons.length > 0,
    reasons,
  };
}

/**
 * Evaluates BP readings for PIH (Pregnancy-Induced Hypertension)
 */
export function evaluatePih(systolic?: number | null, diastolic?: number | null): 'normal' | 'mild' | 'severe' {
  if (!systolic || !diastolic) return 'normal';
  if (systolic >= 160 || diastolic >= 110) return 'severe';
  if (systolic >= 140 || diastolic >= 90) return 'mild';
  return 'normal';
}
