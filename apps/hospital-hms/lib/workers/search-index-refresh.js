/* eslint-disable no-console */
import { Queue, Worker, QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';

import prisma from '../lib/prisma';

const connection = new IORedis(
  process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL || 'redis://localhost:6379',
);

export const refreshQueue = new Queue('search-index-refresh', { connection });
export const refreshQueueScheduler = new QueueScheduler('search-index-refresh', { connection });

const worker = new Worker(
  'search-index-refresh',
  async (job) => {
    const { type, doctorId, hospitalId } = job.data;

    switch (type) {
      case 'doctor-updated':
        await refreshDoctorIndex(doctorId);
        break;

      case 'hospital-updated':
        await refreshHospitalDoctors(hospitalId);
        break;

      case 'full-refresh':
        await refreshAllIndices();
        break;

      default:
        console.warn(`Unknown refresh type: ${type}`);
    }
  },
  { connection, concurrency: 5 },
);

worker.on('failed', (job, err) => {
  console.error(`Search index refresh failed: ${job.id}`, err);
});

worker.on('completed', (job) => {
  console.log(`Search index refresh completed: ${job.id}`);
});

async function refreshDoctorIndex(doctorId) {
  // Get doctor with all related data
  const doctor = await prisma.doctorMaster.findUnique({
    where: { id: doctorId },
    include: {
      profile: true,
      affiliations: {
        where: { verificationStatus: 'ACTIVE' },
        include: { hospital: true },
      },
      verification: true,
    },
  });

  if (!doctor) return;

  // Check if eligible for discovery
  const isActive =
    doctor.verification?.status === 'VERIFIED' &&
    doctor.affiliations.some((a) => a.hospital.accountStatus === 'ACTIVE');

  // Update search index
  const indexData = {
    fullName: doctor.fullName,
    specialties: doctor.profile?.speciality ? [doctor.profile.speciality] : [],
    departments: doctor.affiliations.map((a) => a.department).filter(Boolean),
    avgRating: 0,
    experienceYears: doctor.experienceYears,
    isActive,
  };

  await prisma.doctorSearchIndex.upsert({
    where: { doctorId },
    create: { ...indexData, doctorId },
    update: indexData,
  });

  // Update public profile
  await prisma.doctorPublicProfile.upsert({
    where: { doctorId },
    create: {
      doctorId,
      fullName: doctor.fullName,
      specialties: indexData.specialties,
      yearsExperience: doctor.experienceYears,
      verificationStatus: doctor.verification?.status || 'PENDING',
    },
    update: {
      fullName: doctor.fullName,
      specialties: indexData.specialties,
      yearsExperience: doctor.experienceYears,
    },
  });
}

async function refreshHospitalDoctors(hospitalId) {
  const affiliations = await prisma.doctorHospitalAffiliation.findMany({
    where: {
      hospitalId,
      verificationStatus: 'ACTIVE',
    },
    include: {
      doctor: {
        include: {
          profile: true,
          verification: true,
        },
      },
    },
  });

  for (const aff of affiliations) {
    await refreshDoctorIndex(aff.doctorId);
  }
}

async function refreshAllIndices() {
  const doctors = await prisma.doctorMaster.findMany({
    include: {
      profile: true,
      verification: true,
    },
  });

  for (const doctor of doctors) {
    await refreshDoctorIndex(doctor.id);
  }
}

export { refreshDoctorIndex, refreshHospitalDoctors, refreshAllIndices };
