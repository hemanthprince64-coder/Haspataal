/* ------------------------------------------------------------------ */
/*  High-Risk Auto-Flagging (Indian Obstetric Criteria)               */
/* ------------------------------------------------------------------ */

interface PregnancyProfileInput {
  gravida: number;
  para: number;
  abortions: number;
  bmiPrePregnancy: number | null;
  heightCm: number | null;
  bloodGroup: string | null;
  rhFactor: string | null;
  age?: number;           // from patient.dob
  previousComplications: string[];
  highRisk: boolean;
}

interface HighRiskResult {
  isHighRisk: boolean;
  reasons: string[];
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  actionProtocol: string[];
}

const HIGH_RISK_FACTORS = {
  AGE: { min: 18, max: 35 },
  HEIGHT: 145,        // cm
  BMI: { min: 18.5, max: 30 },
  GRAVIDA: 4,
  BP: { systolic: 140, diastolic: 90 },
  HB: 11,             // g/dL
  SUGAR: 140,          // mg/dL
};

export function evaluateHighRisk(profile: Partial<PregnancyProfileInput>): HighRiskResult {
  const reasons: string[] = [];
  let severityScore = 0;

  // Age
  if (profile.age !== undefined) {
    if (profile.age < HIGH_RISK_FACTORS.AGE.min) {
      reasons.push('Maternal age < 18 years');
      severityScore += 3;
    }
    if (profile.age > HIGH_RISK_FACTORS.AGE.max) {
      reasons.push('Maternal age > 35 years (elderly primigravida)');
      severityScore += 2;
    }
  }

  // Height (CPD risk)
  if (profile.heightCm !== null && profile.heightCm !== undefined && profile.heightCm < HIGH_RISK_FACTORS.HEIGHT) {
    reasons.push(`Short stature (${profile.heightCm} cm) – CPD risk`);
    severityScore += 2;
  }

  // BMI
  if (profile.bmiPrePregnancy !== null && profile.bmiPrePregnancy !== undefined) {
    if (profile.bmiPrePregnancy < HIGH_RISK_FACTORS.BMI.min) {
      reasons.push(`Underweight (BMI ${profile.bmiPrePregnancy})`);
      severityScore += 2;
    }
    if (profile.bmiPrePregnancy > HIGH_RISK_FACTORS.BMI.max) {
      reasons.push(`Obese (BMI ${profile.bmiPrePregnancy})`);
      severityScore += 3;
    }
  }

  // Gravida
  if (profile.gravida >= HIGH_RISK_FACTORS.GRAVIDA) {
    reasons.push(`Grand multipara (G${profile.gravida}P${profile.para})`);
    severityScore += 2;
  }

  // Previous complications
  const criticalComplications = ['PPH', 'Eclampsia', 'Severe Pre-eclampsia', 'Stillbirth', 'Neonatal Death'];
  profile.previousComplications?.forEach((comp) => {
    const isCritical = criticalComplications.some((c) => comp.toLowerCase().includes(c.toLowerCase()));
    if (isCritical) {
      reasons.push(`Previous ${comp}`);
      severityScore += isCritical ? 4 : 1;
    }
  });

  // Rh-negative without anti-D
  if (profile.rhFactor === 'NEGATIVE') {
    reasons.push('Rh-negative – requires anti-D immunoglobulin');
    severityScore += 2;
  }

  // Severity mapping
  let severity: HighRiskResult['severity'] = 'LOW';
  if (severityScore >= 8) severity = 'CRITICAL';
  else if (severityScore >= 5) severity = 'HIGH';
  else if (severityScore >= 2) severity = 'MODERATE';

  const isHighRisk = reasons.length > 0;

  // Action protocol
  const actionProtocol: string[] = [];
  if (isHighRisk) {
    actionProtocol.push('Schedule weekly visits instead of monthly');
    actionProtocol.push('Assign dedicated ASHA worker for home monitoring');
    actionProtocol.push('Generate referral slip for higher-center review');
    if (severityScore >= 5) {
      actionProtocol.push('Flag for specialist obstetrician review');
      actionProtocol.push('Ensure 24/7 emergency contact availability');
    }
  }

  return { isHighRisk, reasons, severity, actionProtocol };
}
