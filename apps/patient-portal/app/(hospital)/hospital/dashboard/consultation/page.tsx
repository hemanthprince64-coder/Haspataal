/* eslint-disable */
import { requireHospitalStaff } from '@haspataal/auth';

import { redirect } from 'next/navigation';

import DoctorConsultationWorkflow from '@/components/hospital/doctor-consultation-workflow';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Consultation | Haspataal',
};

export default async function ConsultationPage() {
  const user = await requireHospitalStaff();

  if (user.role !== 'DOCTOR' && user.role !== 'HOSPITAL_ADMIN') {
    return <div className="p-6">Unauthorized: This module is for doctors only.</div>;
  }

  // Find the doctor's record based on user's mobile (assuming user mobile matches doctor mobile)
  // Or in patient-portal, the user ID is the doctor ID if they login as doctor.
  const doctor = await prisma.doctorMaster.findFirst({
    where: {
      mobile: user.mobile,
      affiliations: {
        some: { hospitalId: user.hospitalId },
      },
    },
  });

  if (!doctor) {
    return (
      <div className="p-6">
        Doctor profile not found for the logged in user. Please configure your profile first.
      </div>
    );
  }

  // Fetch today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: { patient: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Consultation</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your queue and write prescriptions.</p>
        </div>
        <div className="text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
          Dr. {doctor.fullName}
        </div>
      </div>

      <DoctorConsultationWorkflow
        initialAppointments={appointments}
        doctorId={doctor.id}
        hospitalId={user.hospitalId}
      />
    </div>
  );
}
