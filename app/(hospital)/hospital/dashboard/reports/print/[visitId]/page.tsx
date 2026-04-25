import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types";
import { PrescriptionPad } from "@/components/hospital/PrescriptionPad";
import { notFound } from "next/navigation";

export default async function PrintPrescriptionPage(props: { params: Promise<{ visitId: string }> }) {
  const params = await props.params;
  const { visitId } = params;
  
  // 1. Auth check
  const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], "session_user");

  // 2. Fetch visit data with relations
  const visit = await prisma.visit.findUnique({
    where: { 
      id: visitId,
      hospitalId: user.hospitalId 
    },
    include: {
      hospital: true,
      appointment: {
        include: {
          doctor: {
            include: {
              affiliations: {
                where: { hospitalId: user.hospitalId }
              }
            }
          },
          patient: true
        }
      }
    }
  });

  if (!visit) {
    notFound();
  }

  // 3. Map to PrescriptionPad format
  const doctor = visit.appointment?.doctor;
  const patient = visit.appointment?.patient;
  const affiliation = doctor?.affiliations?.[0];

  const data = {
    hospital: {
      name: visit.hospital.legalName || "Haspataal Healthcare",
      address: `${visit.hospital.addressLine1 || ""} ${visit.hospital.city || ""}`.trim() || "Hospital Address Not Configured",
      phone: visit.hospital.contactNumber || "—"
    },
    doctor: {
      name: doctor?.fullName || "Medical Officer",
      qualification: affiliation?.role || "MBBS, MD", // Use role as qualification fallback
      registration: doctor?.id.slice(0, 8).toUpperCase() || "REG-PENDING"
    },
    patient: {
      name: visit.patientName || patient?.name || "Unknown Patient",
      age: patient?.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : "—",
      gender: patient?.gender || "—",
      date: new Date(visit.createdAt).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <PrescriptionPad data={data} />
    </div>
  );
}
