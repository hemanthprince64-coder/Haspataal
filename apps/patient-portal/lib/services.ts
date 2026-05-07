import 'server-only';
import prisma from './prisma';
import { emitEvent } from '@/services/event-emitter';
import logger from './logger';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import {
  Hospital,
  HospitalPublic,
  Doctor,
  Appointment,
  Review,
  UserRole,
  BookingStatus,
} from '../types';
import { toHospitalPublic } from './utils';

// ── Domain Mapping Functions ─────────────────────────────────

/**
 * Maps a Prisma DoctorMaster record to the clean Domain Doctor type.
 * Decouples the database schema from the application logic.
 */
function toDoctorDomain(doc: any): Doctor {
  if (!doc) throw new Error("Mapping failed: doctor record is null");
  return {
    id: doc.id,
    fullName: doc.fullName,
    mobile: doc.mobile,
    email: doc.email,
    profilePhotoUrl: doc.profilePhotoUrl,
    kycStatus: doc.kycStatus,
    accountStatus: doc.accountStatus,
    name: doc.fullName,
    speciality: doc.affiliations?.[0]?.department || 'General',
    fee: doc.affiliations?.[0]?.consultationFee ? Number(doc.affiliations[0].consultationFee) : 500,
    experience: doc.experienceYears || 0,
    hospital: doc.affiliations?.[0]?.hospital || null,
    reviews: doc.reviews || [],
  };
}

/** Maps a Prisma Appointment record to the Domain Appointment type. */
function toAppointmentDomain(app: any): Appointment {
  if (!app) throw new Error("Mapping failed: appointment record is null");
  return {
    id: app.id,
    patientId: app.patientId,
    doctorId: app.doctorId,
    date: app.date,
    slot: app.slot,
    status: app.status as BookingStatus,
    notes: app.notes,
  };
}

// ── Result Type ───────────────────────────────────────────────

export type Result<T> = 
  | { ok: true; value: T } 
  | { ok: false; error: string; code: string };

// ── Utility Functions ────────────────────────────────────────

/** Strip sensitive fields (like password) from any object. */
function stripSensitive<T extends Record<string, any>>(obj: T | null): T | null {
  if (!obj) return null;
  const { password, ...safe } = obj as any;
  return safe as T;
}

export function isPlaintextPassword(s: string): boolean {
  return !s.startsWith('$2b$') && !s.startsWith('$2a$');
}

function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export const CITIES = [
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'delhi', name: 'Delhi', state: 'Delhi NCR' },
  { id: 'bangalore', name: 'Bangalore', state: 'Karnataka' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
];

// ── Services ──────────────────────────────────────────────────

export const services = {
  platform: {
    getCities: (): typeof CITIES => CITIES,

    getHospitals: async (city?: string): Promise<HospitalPublic[]> => {
      const where: any = { accountStatus: 'active' };
      if (city) {
        where.city = { equals: city, mode: 'insensitive' };
      }
      const data = await prisma.hospitalsMaster.findMany({
        where,
        include: {
          _count: {
            select: {
              affiliations: { where: { isCurrent: true } },
              reviews: true,
            },
          },
        },
      });

      return data.map((h) => ({
        ...toHospitalPublic(h as any),
        doctorCount: h._count.affiliations,
        avgRating: h._count.reviews > 0 ? '4.8' : '4.5',
      }));
    },

    getHospitalsByCity: async (city: string): Promise<HospitalPublic[]> => {
      const data = await prisma.hospitalsMaster.findMany({
        where: {
          city: { equals: city, mode: 'insensitive' },
          accountStatus: 'active',
        },
        include: {
          _count: {
            select: {
              affiliations: { where: { isCurrent: true } },
              reviews: true,
            },
          },
          reviews: { take: 5 },
        },
      });

      return data.map((h) => ({
        ...toHospitalPublic(h as any),
        doctorCount: h._count.affiliations,
        avgRating: h._count.reviews > 0 ? '4.8' : '4.5',
        reviews: h.reviews,
      }));
    },

    searchDoctors: async (city?: string, speciality?: string, query?: string): Promise<Doctor[]> => {
      let hospitalIds: string[] = [];
      if (city) {
        const hospitals = await prisma.hospitalsMaster.findMany({
          where: { city: { equals: city, mode: 'insensitive' }, accountStatus: 'active' },
          select: { id: true },
        });
        hospitalIds = hospitals.map((h) => h.id);
      }

      const where: any = {};
      if (city) {
        where.affiliations = { some: { hospitalId: { in: hospitalIds }, isCurrent: true } };
      }
      if (speciality) {
        where.affiliations = {
          ...where.affiliations,
          some: { ...where.affiliations?.some, department: { equals: speciality, mode: 'insensitive' } },
        };
      }
      if (query) {
        where.OR = [{ fullName: { contains: query, mode: 'insensitive' } }];
      }

      const data = await prisma.doctorMaster.findMany({
        where,
        include: { affiliations: { include: { hospital: true } } },
      });

      return data.map(toDoctorDomain);
    },

    getDoctorsByHub: async (city: string, speciality: string): Promise<Doctor[]> => {
      const hospitals = await prisma.hospitalsMaster.findMany({
        where: { city: { equals: city, mode: 'insensitive' }, accountStatus: 'active' },
        select: { id: true },
      });
      const hospitalIds = hospitals.map((h) => h.id);

      const data = await prisma.doctorMaster.findMany({
        where: {
          accountStatus: 'ACTIVE',
          affiliations: {
            some: {
              hospitalId: { in: hospitalIds },
              department: { equals: speciality, mode: 'insensitive' },
              isCurrent: true,
            },
          },
        },
        include: { affiliations: { include: { hospital: true } } },
      });

      return data.map(toDoctorDomain);
    },

    getHubStats: async (city: string, speciality: string): Promise<{ count: number }> => {
      const hospitals = await prisma.hospitalsMaster.findMany({
        where: { city: { equals: city, mode: 'insensitive' }, accountStatus: 'active' },
        select: { id: true },
      });
      const hospitalIds = hospitals.map((h) => h.id);

      const count = await prisma.doctorMaster.count({
        where: {
          accountStatus: 'ACTIVE',
          affiliations: {
            some: {
              hospitalId: { in: hospitalIds },
              department: { equals: speciality, mode: 'insensitive' },
              isCurrent: true,
            },
          },
        },
      });
      return { count };
    },

    getHubMetadata: async (): Promise<{ cities: string[]; specialties: string[] }> => {
      const cities = await prisma.hospitalsMaster.findMany({
        where: { accountStatus: 'active' },
        select: { city: true },
        distinct: ['city'],
      });

      const specialties = await prisma.doctorHospitalAffiliation.findMany({
        where: { isCurrent: true, hospital: { accountStatus: 'active' } },
        select: { department: true },
        distinct: ['department'],
      });

      return {
        cities: cities.map((c) => c.city).filter((c): c is string => Boolean(c)),
        specialties: specialties.map((s) => s.department).filter((s): s is string => Boolean(s)),
      };
    },

    getDoctorById: async (id: string): Promise<Doctor | null> => {
      const doc = await prisma.doctorMaster.findUnique({
        where: { id },
        include: { affiliations: { include: { hospital: true } }, reviews: true },
      });
      return doc ? toDoctorDomain(doc) : null;
    },

    getHospitalById: async (id: string): Promise<HospitalPublic | null> => {
      const h = await prisma.hospitalsMaster.findUnique({
        where: { id },
        include: { facilities: true, services: true, departments: true },
      });
      return h ? toHospitalPublic(h as any) : null;
    },

    getAllSpecialities: async (): Promise<string[]> => {
      const affs = await prisma.doctorHospitalAffiliation.findMany({
        distinct: ['department'],
        select: { department: true },
        where: { isCurrent: true, hospital: { accountStatus: 'active' } },
      });
      return affs.map((a) => a.department).filter((d): d is string => Boolean(d));
    },

    getHospitalDoctors: async (hospitalId: string): Promise<{ id: string; name: string; speciality: string; fee: number }[]> => {
      const affiliations = await prisma.doctorHospitalAffiliation.findMany({
        where: { hospitalId, isCurrent: true },
        include: { doctor: true },
      });
      return affiliations.map((aff) => ({
        id: aff.doctor.id,
        name: aff.doctor.fullName,
        speciality: aff.department || 'General',
        fee: aff.consultationFee ? Number(aff.consultationFee) : 500,
      }));
    },

    getHospitalReviews: async (hospitalId: string): Promise<Review[]> => [],

    getHospitalStats: async (hospitalId: string): Promise<{ totalVisits: number; todayVisits: number; scheduledVisits: number; totalPatients: number; totalDoctors: number }> => {
      const [totalVisits, todayVisits, scheduledVisits] = await Promise.all([
        prisma.visit.count({ where: { hospitalId } }),
        prisma.visit.count({ where: { hospitalId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
        prisma.appointment.count({ where: { doctor: { affiliations: { some: { hospitalId } } }, status: 'CONFIRMED' } }),
      ]);

      return { totalVisits, todayVisits, scheduledVisits, totalPatients: 0, totalDoctors: 0 };
    },
  },

  patient: {
    requestOtp: async (mobile: string): Promise<boolean> => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.otpCode.upsert({
        where: { phone: mobile },
        update: { code, expiresAt },
        create: { phone: mobile, code, expiresAt },
      });

      logger.info({ action: 'otp_generated', mobile, code }, `DEMO: Code: ${code}`);
      return true;
    },

    login: async (mobile: string, otp: string): Promise<Result<any>> => {
      try {
        const otpRecord = await prisma.otpCode.findUnique({ where: { phone: mobile } });
        if (!otpRecord) return { ok: false, error: 'OTP not requested', code: 'OTP_NOT_FOUND' };
        if (otpRecord.code !== otp) return { ok: false, error: 'Invalid OTP', code: 'INVALID_OTP' };
        if (new Date() > otpRecord.expiresAt) return { ok: false, error: 'OTP expired', code: 'OTP_EXPIRED' };

        await prisma.otpCode.delete({ where: { id: otpRecord.id } });
        let patient = await prisma.patient.findUnique({ where: { phone: mobile } });

        if (!patient) {
          const hashedPassword = await bcrypt.hash(Math.random().toString(36), 12);
          patient = await prisma.patient.create({ data: { phone: mobile, name: 'New User', password: hashedPassword } });
        }
        return { ok: true, value: { user: { id: patient.id, name: patient.name, role: UserRole.PATIENT, mobile: patient.phone } } };
      } catch (e: any) {
        return { ok: false, error: e.message, code: 'LOGIN_FAILED' };
      }
    },

    register: async (data: any): Promise<Result<any>> => {
      try {
        if (!data.password) return { ok: false, error: 'Password required', code: 'PASSWORD_REQUIRED' };
        const hashedPassword = await bcrypt.hash(data.password, 12);
        const patient = await prisma.patient.upsert({
          where: { phone: data.mobile },
          update: { name: data.name, email: data.email, password: hashedPassword },
          create: { phone: data.mobile, name: data.name, password: hashedPassword },
        });
        return { ok: true, value: { user: { id: patient.id, name: patient.name, role: UserRole.PATIENT, mobile: patient.phone } } };
      } catch (e: any) {
        return { ok: false, error: e.message, code: 'REGISTRATION_FAILED' };
      }
    },

    updateProfile: async (id: string, updates: any): Promise<any> => {
      return await prisma.patient.update({ where: { id }, data: updates });
    },

    getAvailableSlots: async (doctorId: string, date: string): Promise<{ time: string; available: boolean }[]> => {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const now = new Date();
      const isToday = targetDate.getTime() === new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      const existingBookings = await prisma.appointment.findMany({
        where: { doctorId, date: targetDate, status: { in: [BookingStatus.BOOKED, BookingStatus.CONFIRMED] } },
        select: { slot: true },
      });
      const bookedSlots = new Set(existingBookings.map((b) => b.slot));
      const allSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

      return allSlots.map((time) => {
        let available = !bookedSlots.has(time);
        if (isToday) {
          const [hours, minutes] = time.split(':').map(Number);
          const slotDateTime = new Date(targetDate);
          slotDateTime.setHours(hours!, minutes!, 0, 0);
          if (slotDateTime.getTime() <= now.getTime()) available = false;
        }
        return { time, available };
      });
    },

    createVisit: async (hospitalId: string, data: any): Promise<Result<Appointment>> => {
      try {
        const targetDate = new Date(data.date);
        targetDate.setHours(0, 0, 0, 0);
        const targetSlot = data.slot || 'ONLINE';

        const result = await prisma.$transaction(async (tx) => {
          // 1. Check Doctor Affiliation
          const affiliation = await tx.doctorHospitalAffiliation.findFirst({
            where: {
              doctorId: data.doctorId,
              hospitalId,
              verificationStatus: 'VERIFIED',
              isCurrent: true,
            },
          });

          if (!affiliation) {
            return { ok: false, error: 'Doctor not affiliated with this hospital', code: 'DOCTOR_NOT_AFFILIATED' };
          }

          // 2. Ensure patient exists
          const hashedPassword = await bcrypt.hash(Math.random().toString(36), 12);
          const patient = await tx.patient.upsert({
            where: { phone: data.patientMobile },
            update: { name: data.patientName },
            create: { phone: data.patientMobile, name: data.patientName, password: hashedPassword },
          });

          // 3. Check for double booking
          const existing = await tx.appointment.findFirst({
            where: {
              doctorId: data.doctorId,
              date: targetDate,
              slot: targetSlot,
              status: { in: [BookingStatus.BOOKED, BookingStatus.CONFIRMED] },
            },
          });

          if (existing) {
            return { ok: false, error: 'Slot already taken', code: 'SLOT_TAKEN' };
          }

          const appointment = await tx.appointment.create({
            data: {
              patientId: patient.id,
              doctorId: data.doctorId,
              date: targetDate,
              slot: targetSlot,
              status: data.status || BookingStatus.AWAITING_PAYMENT,
              hospitalId,
            },
          });

          return { ok: true, value: toAppointmentDomain(appointment) };
        });

        return result as Result<Appointment>;
      } catch (e: any) {
        return { ok: false, error: e.message, code: 'BOOKING_FAILED' };
      }
    },

    updateVisitStatus: async (visitId: string, patientId: string, newStatus: BookingStatus): Promise<Appointment> => {
      const app = await prisma.appointment.findFirst({ where: { id: visitId, patientId } });
      if (!app) throw new Error('NOT_FOUND');
      // [MANUAL_REVIEW] State machine transitions
      const updated = await prisma.appointment.update({ where: { id: visitId }, data: { status: newStatus } });
      return toAppointmentDomain(updated);
    },

    cancelVisit: async (patientId: string, visitId: string): Promise<Appointment> => {
      const visit = await prisma.appointment.findUnique({ where: { id: visitId } });
      if (!visit || visit.patientId !== patientId) throw new Error('UNAUTHORIZED');
      // [MANUAL_REVIEW] Cancellation logic (refunds, time limits)
      const cancelled = await services.patient.updateVisitStatus(visitId, patientId, BookingStatus.CANCELLED);
      return cancelled;
    },

    getById: async (id: string): Promise<any> => {
      return stripSensitive(await prisma.patient.findUnique({ where: { id } }));
    },

    getVisits: async (patientId: string): Promise<any[]> => {
      const data = await prisma.appointment.findMany({
        where: { patientId },
        include: { doctor: { include: { registration: true, affiliations: true } }, patient: true },
        orderBy: { date: 'desc' },
      });
      return data.map((a) => ({
        id: a.id,
        doctorId: a.doctorId,
        doctorName: a.doctor?.fullName || 'Doctor',
        specialization: a.doctor?.registration?.degree || 'General',
        patientName: a.patient?.name || 'Patient',
        createdAt: a.createdAt.toISOString(),
        amountPaid: 500,
        hospitalId: a.hospitalId || '',
        date: a.date,
        slot: a.slot,
        status: a.status,
        patientId: a.patientId,
      }));
    },

    getFamilyMembers: async (patientId: string): Promise<any[]> => {
      return await prisma.familyMember.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } });
    },

    addFamilyMember: async (patientId: string, data: any): Promise<any> => {
      return await prisma.familyMember.create({ data: { patientId, ...data, dob: data.dob ? new Date(data.dob) : null } });
    },

    deleteFamilyMember: async (patientId: string, memberId: string): Promise<any> => {
      return await prisma.familyMember.deleteMany({ where: { id: memberId, patientId } });
    },

    getMedicalHistory: async (patientId: string): Promise<any> => {
      return await prisma.patientMedicalHistory.findUnique({ where: { patientId } });
    },

    saveMedicalHistory: async (patientId: string, data: any): Promise<any> => {
      return await prisma.patientMedicalHistory.upsert({ where: { patientId }, update: data, create: { patientId, ...data } });
    },

    getMedications: async (patientId: string): Promise<any[]> => {
      return await prisma.patientMedication.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } });
    },

    addMedication: async (patientId: string, data: any): Promise<any> => {
      return await prisma.patientMedication.create({ data: { patientId, ...data, startDate: data.startDate ? new Date(data.startDate) : null } });
    },

    getVitals: async (patientId: string): Promise<any[]> => {
      return await prisma.vitalRecord.findMany({ where: { patientId }, orderBy: { recordedAt: 'desc' }, take: 20 });
    },

    addVital: async (patientId: string, data: any): Promise<any> => {
      const bmi = data.weight && data.height ? parseFloat((data.weight / (data.height / 100) ** 2).toFixed(1)) : null;
      return await prisma.vitalRecord.create({ data: { patientId, ...data, bmi } });
    },

    getVaccinations: async (patientId: string): Promise<any[]> => {
      return await prisma.vaccinationRecord.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } });
    },

    addVaccination: async (patientId: string, data: any): Promise<any> => {
      return await prisma.vaccinationRecord.create({ data: { patientId, ...data, dateGiven: data.dateGiven ? new Date(data.dateGiven) : null, nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null } });
    },

    getPregnancyProfile: async (patientId: string): Promise<any> => {
      return await prisma.pregnancyProfile.findUnique({ where: { patientId } });
    },

    savePregnancyProfile: async (patientId: string, data: any): Promise<any> => {
      return await prisma.pregnancyProfile.upsert({ where: { patientId }, update: { ...data, lmp: data.lmp ? new Date(data.lmp) : undefined }, create: { patientId, ...data, lmp: data.lmp ? new Date(data.lmp) : null } });
    },

    getInsurance: async (patientId: string): Promise<any[]> => {
      return await prisma.insuranceDetail.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } });
    },

    saveInsurance: async (patientId: string, data: any): Promise<any> => {
      if (data.id) return await prisma.insuranceDetail.update({ where: { id: data.id }, data });
      return await prisma.insuranceDetail.create({ data: { patientId, ...data } });
    },

    getAddresses: async (patientId: string): Promise<any[]> => {
      return await prisma.patientAddress.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } });
    },

    addAddress: async (patientId: string, data: any): Promise<any> => {
      if (data.isDefault) await prisma.patientAddress.updateMany({ where: { patientId, isDefault: true }, data: { isDefault: false } });
      return await prisma.patientAddress.create({ data: { patientId, ...data } });
    },

    getWallet: async (patientId: string): Promise<any> => {
      const wallet = await prisma.wallet.findUnique({ where: { patientId }, include: { transactions: true } });
      if (!wallet) return { balance: 0, transactions: [] };
      return { ...wallet, balance: Number(wallet.balance), transactions: wallet.transactions.map(t => ({ ...t, amount: Number(t.amount) })) };
    },

    addWalletTransaction: async (patientId: string, data: any): Promise<any> => {
      return await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.upsert({ where: { patientId }, update: { balance: data.type === 'CREDIT' ? { increment: data.amount } : { decrement: data.amount } }, create: { patientId, balance: data.amount } });
        return await tx.walletTransaction.create({ data: { walletId: wallet.id, ...data } });
      });
    },

    getPrescriptions: async (patientId: string): Promise<any[]> => {
      return await prisma.patientPrescription.findMany({ where: { patientId }, include: { items: true, doctor: true }, orderBy: { createdAt: 'desc' } });
    },
  },

  hospital: {
    getStats: async (hospitalId: string): Promise<any> => {
      const [totalVisits, todayVisits, scheduledVisits] = await Promise.all([
        prisma.visit.count({ where: { hospitalId } }),
        prisma.visit.count({ where: { hospitalId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
        prisma.appointment.count({ where: { doctor: { affiliations: { some: { hospitalId } } }, status: 'CONFIRMED' } }),
      ]);
      return { totalVisits, todayVisits, scheduledVisits, totalPatients: 0, totalDoctors: 0 };
    },

    getVisits: async (hospitalId: string): Promise<any[]> => {
      return await prisma.visit.findMany({ where: { hospitalId }, include: { careJourney: true, appointment: { include: { doctor: true, patient: true } } }, orderBy: { createdAt: 'desc' } });
    },

    completeVisit: async (hospitalId: string, visitId: string, notes: string): Promise<any> => {
      const visit = await prisma.visit.update({ where: { id: visitId, hospitalId }, data: { diagnosis: notes } });
      await services.ai.processVisit(visitId, notes);
      return visit;
    },

    getPatients: async (hospitalId: string): Promise<any[]> => {
      const data = await prisma.visit.findMany({ where: { hospitalId }, select: { patientName: true, patientPhone: true } });
      return Array.from(new Set(data.map(v => v.patientPhone))).map(phone => data.find(v => v.patientPhone === phone));
    },

    getDoctors: async (hospitalId: string): Promise<any[]> => {
      const affs = await prisma.doctorHospitalAffiliation.findMany({ where: { hospitalId, isCurrent: true }, include: { doctor: true } });
      return affs.map(a => ({ id: a.doctor.id, name: a.doctor.fullName, speciality: a.department || 'General' }));
    },

    approveDoctorAffiliation: async (affiliationId: string): Promise<any> => {
      return await prisma.doctorHospitalAffiliation.update({ where: { id: affiliationId }, data: { verificationStatus: 'VERIFIED', isCurrent: true } });
    },

    rejectDoctorAffiliation: async (affiliationId: string, reason?: string): Promise<any> => {
      return await prisma.doctorHospitalAffiliation.update({ where: { id: affiliationId }, data: { verificationStatus: 'REJECTED', isCurrent: false } });
    },

    login: async (mobile: string, password?: string): Promise<Result<any>> => {
      try {
        if (!password) return { ok: false, error: 'Password required', code: 'PASSWORD_REQUIRED' };
        const hospitals = await prisma.$queryRaw<any[]>`SELECT * FROM hospitals_master WHERE contact_number = ${mobile} LIMIT 1`;
        const hospital = hospitals?.[0];
        if (!hospital || !(await bcrypt.compare(password, hospital.password))) return { ok: false, error: 'Invalid credentials', code: 'AUTH_FAILED' };
        return { ok: true, value: { user: { id: hospital.id, name: hospital.legal_name, role: UserRole.HOSPITAL_ADMIN, hospitalId: hospital.id } } };
      } catch (e: any) {
        return { ok: false, error: e.message, code: 'LOGIN_ERROR' };
      }
    },

    register: async (data: any): Promise<HospitalPublic> => {
      if (!data.password) throw new Error('PASSWORD_REQUIRED');
      const hashedPassword = await bcrypt.hash(data.password, 12);
      const hospital = await prisma.$transaction(async (tx) => {
        const h = await tx.hospitalsMaster.create({ data: { legalName: data.hospitalName, registrationNumber: `REG-${Date.now()}`, city: data.city, contactNumber: data.mobile } });
        await tx.$executeRaw`UPDATE hospitals_master SET password = ${hashedPassword} WHERE id = ${h.id}`;
        return h;
      });
      return toHospitalPublic(hospital as any);
    },

    addDoctor: async (hospitalId: string, data: any): Promise<any> => {
      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      const doctor = await prisma.doctorMaster.create({
        data: { fullName: data.name, mobile: data.mobile, email: `${data.mobile}@example.com`, password: hashedPassword, affiliations: { create: { hospitalId, role: 'DOCTOR', isCurrent: true } } }
      });
      return { doctor, tempPassword };
    },
  },

  admin: {
    login: async (username: string, password?: string): Promise<Result<any>> => {
      const adminPassHash = process.env.ADMIN_PASSWORD_HASH || '$2b$12$YwrNaShX3AbSpPDb7FtlFOilUoeGAmPX5pCfa6IAd48UYfF6B3X7e';
      const adminUser = process.env.ADMIN_USERNAME || 'admin';
      if (password && username === adminUser && (await bcrypt.compare(password, adminPassHash))) {
        return { ok: true, value: { user: { id: 'admin', role: UserRole.PLATFORM_ADMIN, name: 'Platform Admin' } } };
      }
      return { ok: false, error: 'Invalid admin credentials', code: 'AUTH_FAILED' };
    },
  },

  agent: {
    login: async (mobile: string, password?: string): Promise<Result<any>> => {
      try {
        if (!password) return { ok: false, error: 'Password required', code: 'PASSWORD_REQUIRED' };
        const agent = await prisma.agent.findFirst({ where: { mobile } });
        if (!agent || !(await bcrypt.compare(password, agent.password))) return { ok: false, error: 'Invalid credentials', code: 'AUTH_FAILED' };
        if (agent.accountStatus !== 'ACTIVE') return { ok: false, error: 'Account inactive', code: 'INACTIVE' };
        return { ok: true, value: { user: { id: agent.id, role: UserRole.AGENT, name: agent.fullName, mobile: agent.mobile } } };
      } catch (e: any) {
        return { ok: false, error: e.message, code: 'LOGIN_ERROR' };
      }
    },
  },

  ai: {
    processVisit: async (visitId: string, notes: string, imageData?: any): Promise<any> => {
      const visit = await prisma.visit.findUnique({ where: { id: visitId }, include: { appointment: { include: { patient: true } } } });
      if (!visit) throw new Error('NOT_FOUND');
      const { ConsultationAiEngine } = await import('./ai/engine');
      return await ConsultationAiEngine.process({ visitId, clinicalNotes: notes, prescriptionImage: imageData });
    },
  },
};
