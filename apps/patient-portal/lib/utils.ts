import { Hospital, HospitalPublic } from '../types';

export function toHospitalPublic(hospital: Hospital): HospitalPublic {
  return {
    id: hospital.id,
    name: hospital.name,
    city: hospital.city,
    state: hospital.state,
  };
}

export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(' ');
}
