import { redirect } from 'next/navigation';

import { requireRole } from '@/lib/auth/requireRole';
import { UserRole } from '@/types';

import DoctorDashboardClient from './DoctorDashboardClient';

export default async function DoctorDashboard() {
  let user;
  try {
    user = await requireRole(UserRole.DOCTOR, 'session_doctor');
  } catch {
    redirect('/doctor/login');
  }

  return <DoctorDashboardClient user={user} />;
}
