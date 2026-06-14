/* ------------------------------------------------------------------ */
/*  ANC Retention Engine – Dropout Risk Scoring                       */
/* ------------------------------------------------------------------ */

interface RetentionProfile {
  gravida: number;
  para: number;
  bmiPrePregnancy: number | null;
  heightCm: number | null;
  ancVisits: number | null;
  dropoutRiskScore: number | null;
  visits: { visitDate: Date }[];
  supplements: { supplementType: string; dosesTaken: number; targetDose: number }[];
  patient?: { dob?: Date | null };
}

interface RetentionRule {
  maxDropoutScore: number;
  intervention: string;
  channel: 'SMS' | 'WHATSAPP' | 'ASHA_VISIT' | 'ANM_CALL' | 'ESCORT' | 'NHM_TRANSPORT';
}

const INTERVENTIONS: RetentionRule[] = [
  { maxDropoutScore: 30, intervention: 'Standard SMS reminders', channel: 'SMS' },
  { maxDropoutScore: 60, intervention: 'ASHA home visit + ANM call', channel: 'ASHA_VISIT' },
  { maxDropoutScore: 80, intervention: 'Escort arrangement to hospital', channel: 'ESCORT' },
  { maxDropoutScore: 100, intervention: 'Block-level NHM transport voucher', channel: 'NHM_TRANSPORT' },
];

export function predictDropoutRisk(profile: Partial<RetentionProfile>): number {
  let score = 0;

  // Geographical / Socio-economic (approximated)
  // In real implementation this would use patient address data

  // Age
  const age = profile.patient?.dob ? calculateAge(profile.patient.dob) : null;
  if (age !== null) {
    if (age < 20) score += 15;
    if (age > 35) score += 10;
  }

  // Primigravida (first-time mother) – higher dropout risk due to fear
  if (profile.gravida === 1 && profile.para === 0) {
    score += 15;
  }

  // Grand multipara
  if (profile.gravida > 4) {
    score += 10;
  }

  // BMI risk
  if (profile.bmiPrePregnancy !== null && profile.bmiPrePregnancy !== undefined) {
    if (profile.bmiPrePregnancy < 18.5 || profile.bmiPrePregnancy > 30) {
      score += 10;
    }
  }

  // Short stature
  if (profile.heightCm !== null && profile.heightCm !== undefined && profile.heightCm < 145) {
    score += 5;
  }

  // ANC Dropout (missed visits)
  const expectedVisits = estimateExpectedVisits(profile);
  const actualVisits = profile.ancVisits ?? 0;
  if (expectedVisits > actualVisits) {
    score += (expectedVisits - actualVisits) * 10;
  }

  // Missed previous visits
  if (profile.visits && profile.visits.length > 1) {
    const now = new Date();
    const lastVisit = profile.visits[profile.visits.length - 1];
    const daysSinceVisit = Math.floor((now.getTime() - new Date(lastVisit.visitDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceVisit > 35) { // more than a month since last visit
      score += 15;
    }
  }

  // Supplement non-compliance
  if (profile.supplements) {
    profile.supplements.forEach((supp) => {
      if (supp.targetDose > 0) {
        const compliance = supp.dosesTaken / supp.targetDose;
        if (compliance < 0.5) score += 10;
        else if (compliance < 0.75) score += 5;
      }
    });
  }

  return Math.min(100, Math.max(0, score));
}

function calculateAge(dob: Date): number {
  const now = new Date();
  const birth = new Date(dob);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function estimateExpectedVisits(profile: Partial<RetentionProfile>): number {
  // Rough estimate: one visit per month from registration to now
  if (!profile.visits || profile.visits.length === 0) return 0;
  const firstVisit = new Date(profile.visits[0].visitDate);
  const now = new Date();
  const monthsDiff = Math.floor((now.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24 * 30));
  return Math.min(monthsDiff, 9); // max ~9 months of ANC
}

export function getRetentionIntervention(riskScore: number): RetentionRule {
  for (const rule of INTERVENTIONS) {
    if (riskScore <= rule.maxDropoutScore) {
      return rule;
    }
  }
  return INTERVENTIONS[INTERVENTIONS.length - 1];
}
