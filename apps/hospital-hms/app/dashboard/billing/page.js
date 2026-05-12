import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BillingForm from './BillingForm';

export default async function BillingPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('session_user');

  if (!userCookie) redirect('/login');
  const user = JSON.parse(userCookie.value);

  const doctors = await prisma.doctor.findMany({
    where: { hospitalId: user.hospitalId },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-2">OPD & Billing</h1>
      <p className="text-muted-foreground mb-6">
        Create a new OPD visit and generate billing
      </p>
      <BillingForm doctors={doctors} />
    </div>
  );
}
