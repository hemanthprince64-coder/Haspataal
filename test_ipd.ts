import { PrismaClient } from '@prisma/client';

import { IPDService } from './apps/hospital-hms/lib/services/ipd';

const prisma = new PrismaClient();
async function run() {
  try {
    const hospital = await prisma.hospital.create({
      data: { name: 'Test', tenantId: 'tenant-1', type: 'GENERAL' },
    });
    const bed = await prisma.bed.create({
      data: { hospitalId: hospital.id, wardId: 'w', status: 'OCCUPIED' },
    });
    const adm = await prisma.admission.create({
      data: {
        hospitalId: hospital.id,
        patientId: 'p1',
        bedId: bed.id,
        attendingDoctorId: 'doc1',
        clinicalStatus: 'DISCHARGE_CLINICALLY_DECIDED',
        physicalPresenceStatus: 'PRESENT',
        admissionNumber: 'adm-123',
      },
    });
    const res = await IPDService.confirmPhysicalDeparture(
      adm.id,
      'STANDARD',
      'actor-1',
      'NURSE',
      'MANUAL_ENTRY',
      'SYSTEM',
    );
    console.log('success', res.status);
  } catch (e) {
    console.error('ERROR', e);
  }
}
run();
