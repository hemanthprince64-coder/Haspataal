/* ------------------------------------------------------------------ */
/*  Gestational Age Engine                                            */
/* ------------------------------------------------------------------ */

export function calculateGestationalAge(lmp: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - new Date(lmp).getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

export function calculateEdd(lmp: Date): Date {
  const date = new Date(lmp);
  const edd = new Date(date);
  edd.setFullYear(edd.getFullYear() + 1);
  edd.setMonth(edd.getMonth() - 3);
  edd.setDate(edd.getDate() + 7);
  return edd;
}

export function getTrimester(gestationalAgeWeeks: number): 'FIRST' | 'SECOND' | 'THIRD' {
  if (gestationalAgeWeeks <= 12) return 'FIRST';
  if (gestationalAgeWeeks <= 27) return 'SECOND';
  return 'THIRD';
}
