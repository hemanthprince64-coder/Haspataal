/**
 * Gestational Age Calculator
 * Calculates gestational age in weeks from Last Menstrual Period (LMP)
 */

/**
 * Returns gestational age in completed weeks from LMP date
 */
export function calculateGestationalAge(lmp: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - lmp.getTime();
  const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(0, weeks);
}

/**
 * Returns Estimated Due Date (EDD) based on Naegele's rule (LMP + 280 days)
 */
export function calculateEdd(lmp: Date): Date {
  const edd = new Date(lmp);
  edd.setDate(edd.getDate() + 280);
  return edd;
}

/**
 * Returns trimester label based on gestational age in weeks
 */
export function getTrimester(gestationalAgeWeeks: number): '1st' | '2nd' | '3rd' {
  if (gestationalAgeWeeks <= 13) return '1st';
  if (gestationalAgeWeeks <= 26) return '2nd';
  return '3rd';
}
