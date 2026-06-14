/* ------------------------------------------------------------------ */
/*  ASHA Worker Module                                                  */
/* ------------------------------------------------------------------ */

export interface AshaWorker {
  id: string;
  name: string;
  mobile: string;
  village: string;
  block: string;
  panchayat: string;
  assignedPatients: string[]; // patient IDs
  active: boolean;
}

export interface AshaVisitLog {
  id: string;
  ashaId: string;
  patientId: string;
  visitDate: Date;
  vitals: {
    bpSystolic?: number;
    bpDiastolic?: number;
    weight?: number;
    temperature?: number;
  };
  symptoms: string[];
  adviceGiven: string[];
  ifaGiven: number; // tablets distributed
  ttGiven: boolean;
  notes: string;
  syncedAt?: Date;
}

export interface AshaAssignmentResult {
  success: boolean;
  ashaId?: string;
  reason?: string;
}

/**
 * Simple PIN-based auth for ASHA workers using basic tablets.
 */
export function validateAshaPin(ashaId: string, pin: string): boolean {
  // In production, this would hash-compare against stored PIN
  // For now, accept any 4-digit PIN for demo
  return pin.length === 4;
}

/**
 * Match an ASHA worker to a patient based on pincode/village.
 * In production, this would query a spatial or pincode-based index.
 */
export function matchAshaToPatient(ashaWorkers: AshaWorker[], patientPincode: string): AshaAssignmentResult {
  if (!ashaWorkers.length) {
    return { success: false, reason: 'No ASHA workers registered in this block' };
  }

  // Simple round-robin for now; real impl would use pincode/village matching
  const available = ashaWorkers.filter((a) => a.active && a.assignedPatients.length < 20);
  if (available.length === 0) {
    return { success: false, reason: 'All ASHA workers at capacity (max 20 patients each)' };
  }

  const assigned = available[0];
  return { success: true, ashaId: assigned.id };
}

/**
 * Format a visit log for SMS reporting to ANM/block coordinator.
 */
export function formatVisitLogForSms(log: AshaVisitLog, patientName: string): string {
  const lines = [
    `ASHA Visit Report - ${new Date(log.visitDate).toLocaleDateString('en-IN')}`,
    `Patient: ${patientName}`,
    `BP: ${log.vitals.bpSystolic || '—'}/${log.vitals.bpDiastolic || '—'}`,
    `Weight: ${log.vitals.weight || '—'} kg`,
    `IFA given: ${log.ifaGiven} tablets`,
    `TT given: ${log.ttGiven ? 'Yes' : 'No'}`,
    `Symptoms: ${log.symptoms.join(', ') || 'None'}`,
    `Advice: ${log.adviceGiven.join(', ') || 'None'}`,
  ];
  if (log.notes) lines.push(`Notes: ${log.notes}`);
  return lines.join('\n');
}
