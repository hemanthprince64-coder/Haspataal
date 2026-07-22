/* eslint-disable */
/* ------------------------------------------------------------------ */
/*  PIH (Pre-eclampsia / Hypertension in Pregnancy) Detection          */
/* ------------------------------------------------------------------ */

export interface BpReading {
  systolic: number;
  diastolic: number;
  recordedAt: Date;
  gestationalAge?: number;
}

export interface PihResult {
  isPih: boolean;
  isSevere: boolean;
  severity: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
  recommendation: string[];
  requiresReferral: boolean;
}

const BP_SEVERE = { systolic: 160, diastolic: 110 };
const BP_MODERATE = { systolic: 140, diastolic: 90 };

export function evaluatePih(readings: BpReading[]): PihResult {
  if (readings.length === 0) {
    return {
      isPih: false,
      isSevere: false,
      severity: 'NONE',
      recommendation: [],
      requiresReferral: false,
    };
  }

  const latest = readings[readings.length - 1];
  const { systolic, diastolic } = latest;

  let severity: PihResult['severity'] = 'NONE';
  let isPih = false;
  let isSevere = false;

  if (systolic >= BP_SEVERE.systolic || diastolic >= BP_SEVERE.diastolic) {
    severity = 'SEVERE';
    isPih = true;
    isSevere = true;
  } else if (systolic >= BP_MODERATE.systolic || diastolic >= BP_MODERATE.diastolic) {
    severity = 'MODERATE';
    isPih = true;
    isSevere = false;
  }

  const recommendation: string[] = [];
  let requiresReferral = false;

  if (severity === 'SEVERE') {
    recommendation.push('IMMEDIATE referral to higher center (CHC/DH)');
    recommendation.push('Administer MgSO4 if available');
    recommendation.push('Monitor BP every 15 minutes');
    recommendation.push('Alert ASHA for emergency transport');
    requiresReferral = true;
  } else if (severity === 'MODERATE') {
    recommendation.push('Schedule weekly visits (instead of monthly)');
    recommendation.push('Start anti-hypertensive therapy');
    recommendation.push('Monitor urine protein daily');
    recommendation.push('Advise rest in left lateral position');
    recommendation.push('If no improvement in 48h, refer to higher center');
    requiresReferral = false;
  }

  return { isPih, isSevere, severity, recommendation, requiresReferral };
}

export function getBpTrendData(visits: any[]): { date: string; systolic: number; diastolic: number; gestationalAge: number }[] {
  return visits
    .filter((v) => v.bpSystolic && v.bpDiastolic)
    .map((v) => ({
      date: new Date(v.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      systolic: v.bpSystolic,
      diastolic: v.bpDiastolic,
      gestationalAge: v.gestationalAge || 0,
    }));
}
