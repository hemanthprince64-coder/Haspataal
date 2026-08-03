import { requireHospitalStaff } from '@haspataal/auth';
import { prisma } from '@haspataal/db';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import DispenseWorkspace from './DispenseWorkspace';

export default async function PharmacyExecutionPage({
  params,
}: {
  params: { executionId: string };
}) {
  // Use session_user to get context
  const user = await requireHospitalStaff('session_user');

  const execution = await prisma.pharmacyExecution.findUnique({
    where: {
      id: params.executionId,
      hospitalId: user.hospitalId,
    },
    include: {
      clinicalOrder: {
        include: {
          patient: true,
          doctor: true,
        },
      },
      items: true,
    },
  });

  if (!execution) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/dashboard/pharmacy" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to Pharmacy Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dispensing Workspace</h1>
          <p className="text-slate-500">
            View and manage prescription #{execution.id.slice(-6).toUpperCase()}
          </p>
        </div>
      </div>

      {/* The interactive workspace client component */}
      <DispenseWorkspace execution={execution} />
    </div>
  );
}
