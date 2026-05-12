import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DoctorManagement from './DoctorManagement';

export default async function DoctorsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('session_user');

  if (!userCookie) redirect('/login');
  const user = JSON.parse(userCookie.value);

  if (user.role !== 'ADMIN') {
    return (
      <div className="animate-fade-in p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">Only hospital admins can manage doctors.</p>
      </div>
    );
  }

  const doctors = await prisma.doctor.findMany({
    where: { hospitalId: user.hospitalId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-2">Manage Doctors</h1>
      <p className="text-muted-foreground mb-6">
        Add, view, and manage your hospital's doctors
      </p>
      <DoctorManagement doctors={doctors} />
    </div>
  );
}
