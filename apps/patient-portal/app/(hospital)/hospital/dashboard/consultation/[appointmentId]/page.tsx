import { getSession } from '@haspataal/auth';
import { prisma } from '@haspataal/db';

import { redirect } from 'next/navigation';

import EMRWorkspaceClient from './EMRWorkspaceClient';

export default async function ConsultationPage({ params }: { params: { appointmentId: string } }) {
  const session = await getSession();

  if (
    !session ||
    !session.user ||
    (session.user.role !== 'DOCTOR' && session.user.role !== 'HOSPITAL_ADMIN')
  ) {
    redirect('/login');
  }

  const visit = await prisma.visit.findUnique({
    where: { appointmentId: params.appointmentId },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
      observations: true,
      notes: true,
    },
  });

  if (!visit || !visit.appointment) {
    return <div>Visit not found for this appointment. Has the patient been checked in?</div>;
  }

  if (visit.hospitalId !== session.user.hospitalId) {
    return <div>Unauthorized: This visit belongs to another hospital.</div>;
  }

  if (visit.appointment.doctorId !== session.user.id && session.user.role !== 'HOSPITAL_ADMIN') {
    return <div>Unauthorized: You are not the assigned doctor for this visit.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        EMR Workspace - {visit.appointment.patient.fullName}
      </h1>
      <EMRWorkspaceClient visit={visit} />
    </div>
  );
}
