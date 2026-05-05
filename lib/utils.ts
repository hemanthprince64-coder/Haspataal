import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Hospital, type HospitalPublic } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toHospitalPublic(h: Hospital): HospitalPublic {
  const { password, ...publicHospital } = h as any;
  return publicHospital as HospitalPublic;
}
