/* eslint-disable @typescript-eslint/no-unused-vars */
import { OtpService, OtpPurpose } from '@haspataal/auth';
import {
  hospitalRegistrationsCounter,
  appointmentsCreatedCounter,
} from '@haspataal/core/lib/metrics';
import { logger, logAudit } from '@haspataal/logger';
import bcrypt from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import { z } from 'zod';

import { emitEvent } from '@/services/event-emitter';

import {
  Hospital,
  HospitalPublic,
  Doctor,
  Appointment,
  Review,
  UserRole,
  BookingStatus,
} from '../types';
import prisma from './prisma';
import { rateLimiter } from './rate-limit';
import { toHospitalPublic } from './utils';

type OtpChannel = 'SMS' | 'WHATSAPP' | 'EMAIL';

// Zod schemas for runtime validation
const HospitalArraySchema = z.array(z.any());
const DoctorArraySchema = z.array(z.any());
const DEFAULT_CONSULTATION_FEE = Number(process.env.DEFAULT_CONSULTATION_FEE || 500);
const OTP_RATE_LIMIT = Number(process.env.OTP_RATE_LIMIT || 3);
const OTP_RATE_WINDOW_SECONDS = Number(process.env.OTP_RATE_WINDOW_SECONDS || 15 * 60);

// Strip sensitive fields from any object (password, etc.)
function stripSensitive<T extends Record<string, any>>(obj: T | null): T | null {
  if (!obj) return null;
  const { password: _password, ...safe } = obj as any;
  return safe as T;
}
function _stripSensitiveArray<T extends Record<string, any>>(arr: T[]): T[] {
  return arr.map((item) => stripSensitive(item)!);
}

/**
 * Type guard: returns true when a stored password field is plaintext (not a bcrypt hash).
 * bcrypt hashes always start with "$2b$" or "$2a$". Any other value is treated as plaintext
 * and must be rehashed before use.
 */
export function isPlaintextPassword(s: string): boolean {
  return !s.startsWith('$2b$') && !s.startsWith('$2a$');
}

/** Generates a cryptographically-random alphanumeric string of the given length. */
function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; // no ambiguous chars
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomInt(0, chars.length)];
  }
  return result;
}

function generatePasswordSeed(): string {
  return randomBytes(32).toString('base64url');
}

function toFee(value: unknown): number {
  if (value === null || value === undefined) return DEFAULT_CONSULTATION_FEE;
  const fee = Number(value);
  return Number.isFinite(fee) && fee >= 0 ? fee : DEFAULT_CONSULTATION_FEE;
}

async function getAppointmentFee(appointment: {
  doctorId: string;
  hospitalId?: string | null;
}): Promise<number> {
  const affiliation = await prisma.doctorHospitalAffiliation.findFirst({
    where: {
      doctorId: appointment.doctorId,
      hospitalId: appointment.hospitalId || undefined,
      isCurrent: true,
    },
    select: { consultationFee: true },
  });
  return toFee(affiliation?.consultationFee);
}

// Helper to preserve CITIES constant from the old data file
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

export const services = {
  // --- Platform Services ---
  platform: {
    getCities: (): typeof CITIES => CITIES,

    getHospitals: async (city?: string, limit = 10, cursor?: string): Promise<HospitalPublic[]> => {
      const where: any = { accountStatus: 'active' };
      if (city) {
        where.city = { equals: city };
      }

      // PERFORMANCE: Cursor-based pagination + Eager loading to avoid N+1
      // Note: 'specialities' is a scalar array in this schema, so it is natively included.
      const data = await prisma.hospitalsMaster.findMany({
        where,
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { rankingScore: 'desc' },
        include: {
          _count: {
            select: {
              affiliations: { where: { isCurrent: true } },
              reviews: true,
            },
          },
        },
      });

      const processed = data.map((h) => ({
        ...stripSensitive(h),
        name: h.displayName || h.legalName,
        doctorCount: h._count.affiliations,
        avgRating: h._count.reviews > 0 ? '4.8' : '4.5',
      }));

      // Runtime validation layer
      if (!Array.isArray(processed)) throw new Error('getHospitals must return an array');

      return HospitalArraySchema.parse(processed).map(toHospitalPublic) as HospitalPublic[];
    },

    getHospitalsByCity: async (city: string): Promise<HospitalPublic[]> => {
      const data = (await prisma.hospitalsMaster.findMany({
        where: {
          city: { equals: city },
          accountStatus: 'active',
        },
        include: {
          _count: {
            select: {
              affiliations: { where: { isCurrent: true } },
              reviews: true,
            },
          },
          reviews: {
            take: 5,
          },
        },
      })) as any[];

      const processed = data.map((h: any) => ({
        ...stripSensitive(h),
        name: h.displayName || h.legalName,
        doctorCount: h._count?.affiliations,
        avgRating: (h._count?.reviews ?? 0) > 0 ? '4.8' : '4.5',
        reviews: h.reviews,
      }));

      return HospitalArraySchema.parse(processed).map(toHospitalPublic) as HospitalPublic[];
    },

    searchDoctors: async (
      city?: string,
      speciality?: string,
      query?: string,
    ): Promise<Doctor[]> => {
      let hospitalIds: string[] = [];
      if (city) {
        const hospitals = await prisma.hospitalsMaster.findMany({
          where: { city: { equals: city }, accountStatus: 'active' },
          select: { id: true },
        });
        hospitalIds = hospitals.map((h) => h.id);
      }

      const where: any = {};
      if (city) {
        where.affiliations = {
          some: {
            hospitalId: { in: hospitalIds },
            isCurrent: true,
          },
        };
      }

      if (speciality) {
        where.affiliations = {
          ...where.affiliations,
          some: {
            ...where.affiliations?.some,
            department: { equals: speciality },
          },
        };
      }

      if (query) {
        where.OR = [{ fullName: { contains: query } }];
      }

      const data = await prisma.doctorMaster.findMany({
        where,
        include: {
          affiliations: { include: { hospital: true } },
        },
      });

      if (!Array.isArray(data)) throw new Error('searchDoctors must return an array');
      return DoctorArraySchema.parse(data) as Doctor[];
    },

    getDoctorsByHub: async (city: string, speciality: string): Promise<Doctor[]> => {
      const hospitals = await prisma.hospitalsMaster.findMany({
        where: { city: { equals: city }, accountStatus: 'active' },
        select: { id: true },
      });
      const hospitalIds = hospitals.map((h) => h.id);

      const data = await prisma.doctorMaster.findMany({
        where: {
          accountStatus: 'ACTIVE',
          affiliations: {
            some: {
              hospitalId: { in: hospitalIds },
              department: { equals: speciality },
              isCurrent: true,
            },
          },
        },
        include: {
          affiliations: {
            include: { hospital: true },
          },
        },
      });

      return DoctorArraySchema.parse(data) as Doctor[];
    },

    getHubStats: async (city: string, speciality: string) => {
      const hospitals = await prisma.hospitalsMaster.findMany({
        where: { city: { equals: city }, accountStatus: 'active' },
        select: { id: true },
      });
      const hospitalIds = hospitals.map((h) => h.id);

      const count = await prisma.doctorMaster.count({
        where: {
          accountStatus: 'ACTIVE',
          affiliations: {
            some: {
              hospitalId: { in: hospitalIds },
              department: { equals: speciality },
              isCurrent: true,
            },
          },
        },
      });
      return { count };
    },

    getHubMetadata: async () => {
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
        cities: cities.map((c) => c.city).filter(Boolean) as string[],
        specialties: specialties.map((s) => s.department).filter(Boolean) as string[],
      };
    },

    getDoctorById: async (id: string): Promise<Doctor | null> => {
      const doc = await prisma.doctorMaster.findUnique({
        where: { id },
        include: {
          affiliations: { include: { hospital: true } },
          reviews: true,
        },
      });
      return stripSensitive(doc ? { ...doc, name: doc.fullName } : null) as Doctor | null;
    },

    getHospitalById: async (id: string): Promise<HospitalPublic | null> => {
      const hospital = await prisma.hospitalsMaster.findUnique({
        where: { id },
        include: {
          facilities: true,
          services: true,
          departments: true,
        },
      });
      return stripSensitive(
        hospital ? { ...hospital, name: hospital.displayName || hospital.legalName } : null,
      ) as Hospital | null;
    },

    getAllSpecialities: async (): Promise<string[]> => {
      const affs = await prisma.doctorHospitalAffiliation.findMany({
        distinct: ['department'],
        select: { department: true },
        where: {
          isCurrent: true,
          hospital: { accountStatus: 'active' },
        },
      });
      return affs.map((a) => a.department).filter((d): d is string => Boolean(d));
    },

    getHospitalDoctors: async (
      hospitalId: string,
    ): Promise<{ id: string; name: string; speciality: string; fee: number }[]> => {
      const affiliations = await prisma.doctorHospitalAffiliation.findMany({
        where: { hospitalId, isCurrent: true },
        include: { doctor: true },
      });
      return affiliations.map((aff) => ({
        id: aff.doctor.id,
        name: aff.doctor.fullName,
        speciality: aff.department || 'General',
        fee: toFee(aff.consultationFee),
      }));
    },

    getHospitalReviews: async (_hospitalId: string): Promise<Review[]> => {
      return [];
    },

    getHospitalStats: async (hospitalId: string) => {
      const [totalVisits, todayVisits, scheduledVisits] = await Promise.all([
        prisma.visit.count({ where: { hospitalId } }),
        prisma.visit.count({
          where: { hospitalId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        }),
        prisma.appointment.count({
          where: { doctor: { affiliations: { some: { hospitalId } } }, status: 'CONFIRMED' },
        }),
      ]);

      return {
        totalVisits,
        todayVisits,
        scheduledVisits,
        totalPatients: 0,
        totalDoctors: 0,
      };
    },
  },

  // --- Patient Services ---
  patient: {
    requestOtp: async (mobile: string) => {
      const result = await OtpService.sendOtp({ phone: mobile, purpose: OtpPurpose.PATIENT_LOGIN });
      if (!result.success) {
        throw new Error(result.message || 'OTP request failed');
      }

      const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);
      const code = result.code || '';
      const expiresAt = result.expiresAt ? new Date(result.expiresAt) : new Date();

      logger.info({ action: 'otp_generated', mobile: normalizedMobile }, 'OTP generated');

      if (process.env.NODE_ENV === 'development') {
        console.log(
          '%c[DEMO OTP]',
          'background: #22c55e; color: black; font-weight: bold; padding: 2px 8px; border-radius: 4px;',
          `Mobile: ${mobile} | Code: ${code} | Expires: ${expiresAt.toISOString()}`,
        );
      }

      try {
        const channel = (process.env.PATIENT_OTP_CHANNEL as any) || 'SMS';
        const { dispatchOtpNotification } = await import('./otp-notification-dispatcher');
        const notifyResult = await dispatchOtpNotification({
          mobile: normalizedMobile,
          code,
          channel,
          recipientName: 'Patient',
        });

        if (!notifyResult.success) {
          logger.warn(
            {
              action: 'patient_otp_dispatch_failed',
              mobile: normalizedMobile,
              channel,
              error: notifyResult.error,
            },
            'Patient OTP dispatch failed',
          );
        }
      } catch (dispatchError) {
        logger.warn(
          { action: 'patient_otp_dispatch_failed', mobile: normalizedMobile, error: dispatchError },
          'Patient OTP dispatch failed',
        );
      }

      return true;
    },

    login: async (mobile: string, otp: string) => {
      const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);

      const result = await OtpService.verifyOtp({
        phone: mobile,
        otp,
        purpose: OtpPurpose.PATIENT_LOGIN,
      });

      if (!result.success) {
        if (result.message?.includes('Account not found')) {
          let patient = await prisma.patient.findUnique({ where: { phone: normalizedMobile } });
          if (!patient) {
            const hashedPassword = await bcrypt.hash(generatePasswordSeed(), 12);
            patient = await prisma.patient.create({
              data: {
                phone: normalizedMobile,
                name: 'New User',
                password: hashedPassword,
              },
            });
          }
          logger.info(
            { action: 'patient_registration', mobile: normalizedMobile },
            'Auto-registering new patient during login',
          );
          return {
            user: {
              id: patient.id,
              name: patient.name || 'Patient',
              role: UserRole.PATIENT,
              mobile: patient.phone,
            },
          };
        }
        throw new Error(result.message || 'OTP verification failed');
      }

      if (result.user) {
        return { user: result.user };
      }
      throw new Error('OTP verification failed');
    },

    register: async (data: {
      mobile: string;
      name: string;
      password?: string;
      age?: string;
      gender?: string;
      bloodGroup?: string;
      city?: string;
      email?: string;
    }) => {
      logger.info({ action: 'patient_register', data }, 'Patient registering profile');

      // Added Zod Validation
      const RegisterSchema = z.object({
        mobile: z.string().regex(/^\d{10}$/, 'Invalid mobile number'),
        name: z.string().min(2, 'Name too short'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        email: z.string().email().optional().or(z.literal('')),
      });

      RegisterSchema.parse(data); // validate input

      if (!data.password) throw new Error('PASSWORD_REQUIRED');
      const hashedPassword = await bcrypt.hash(data.password, 12);
      const patient = await prisma.patient.upsert({
        where: { phone: data.mobile },
        update: {
          name: data.name,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          city: data.city,
          email: data.email,
          password: hashedPassword,
        },
        create: {
          phone: data.mobile,
          name: data.name,
          password: hashedPassword,
        },
      });

      logAudit({
        action: 'CREATE',
        actorId: patient.id,
        actorRole: 'PATIENT',
        resourceType: 'PATIENT_PROFILE',
        resourceId: patient.id,
        timestamp: new Date().toISOString(),
        ip: 'system', // IP would come from request context in a real action
        changes: { name: patient.name, mobile: patient.phone },
      });

      return {
        user: {
          id: patient.id,
          name: patient.name || 'Patient',
          role: UserRole.PATIENT,
          mobile: patient.phone,
        },
      };
    },

    updateProfile: async (id: string, updates: any) => {
      return await prisma.patient.update({
        where: { id },
        data: updates,
      });
    },

    getAvailableSlots: async (doctorId: string, date: string) => {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const now = new Date();
      const isToday =
        targetDate.getTime() ===
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      // Fetch existing bookings for this doctor on this date
      const existingBookings = await prisma.appointment.findMany({
        where: {
          doctorId,
          date: targetDate,
          status: { in: [BookingStatus.BOOKED, BookingStatus.CONFIRMED] },
        },
        select: { slot: true },
      });

      const bookedSlots = new Set(existingBookings.map((b) => b.slot));

      // Standard clinic hours: 09:00 to 17:00, 30-min intervals
      const allSlots = [
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
      ];

      return allSlots.map((time) => {
        let available = !bookedSlots.has(time);

        if (isToday) {
          const [hours, minutes] = time.split(':').map(Number);
          const slotDateTime = new Date(targetDate);
          slotDateTime.setHours(hours, minutes, 0, 0);

          // If slot is in the past (using 15 min buffer for convenience)
          if (slotDateTime.getTime() <= now.getTime()) {
            available = false;
          }
        }

        return {
          time,
          available,
        };
      });
    },

    createVisit: async (
      hospitalId: string,
      data: {
        patientMobile: string;
        patientName: string;
        doctorId: string;
        date: string;
        slot?: string;
        status?: any;
      },
    ) => {
      logger.info(
        {
          action: 'create_booking_attempt',
          hospitalId,
          doctorId: data.doctorId,
          date: data.date,
          slot: data.slot,
        },
        'Attempting transactional appointment booking',
      );
      const targetDate = new Date(data.date);
      targetDate.setHours(0, 0, 0, 0);
      const targetSlot = data.slot || 'ONLINE';

      // DPDP COMPLIANCE: Check for explicit consent before processing booking
      const hasConsent = await services.compliance.checkConsent(
        data.patientMobile,
        'APPOINTMENT_BOOKING',
      );
      if (!hasConsent) {
        throw new Error(
          'CONSENT_REQUIRED: Patient has not provided explicit consent for appointment booking.',
        );
      }

      try {
        // ACID Transaction to prevent double booking race conditions
        const appointment = await prisma.$transaction(async (tx) => {
          // 1. Ensure patient exists
          const hashedPassword = await bcrypt.hash(generatePasswordSeed(), 12);
          const patient = await tx.patient.upsert({
            where: { phone: data.patientMobile },
            update: { name: data.patientName },
            create: {
              phone: data.patientMobile,
              name: data.patientName,
              password: hashedPassword,
            },
          });

          const affiliation = await tx.doctorHospitalAffiliation.findFirst({
            where: {
              doctorId: data.doctorId,
              hospitalId,
              isCurrent: true,
              verificationStatus: 'VERIFIED',
            },
          });
          if (!affiliation) {
            throw new Error('Doctor is not approved for this hospital.');
          }

          // 2. Check if slot is already taken in this transaction snapshot
          const existing = await tx.appointment.findFirst({
            where: {
              doctorId: data.doctorId,
              date: targetDate,
              slot: targetSlot,
              status: { in: [BookingStatus.BOOKED, BookingStatus.CONFIRMED] },
            },
          });

          if (existing) {
            throw new Error(`SLOT_UNAVAILABLE: The slot ${targetSlot} has already been booked.`);
          }

          // 3. Create the appointment. The @@unique(doctorId, date, slot) constraint
          // acts as the final database-level lock against parallel inserts.
          return await tx.appointment.create({
            data: {
              patientId: patient.id,
              doctorId: data.doctorId,
              date: targetDate,
              slot: targetSlot,
              hospitalId,
              status: data.status || BookingStatus.AWAITING_PAYMENT,
            },
          });
        });

        logger.info(
          { action: 'booking_created', appointmentId: appointment.id },
          'Successfully booked appointment',
        );

        logAudit({
          action: 'CREATE',
          actorId: appointment.patientId,
          actorRole: 'PATIENT',
          resourceType: 'APPOINTMENT',
          resourceId: appointment.id,
          timestamp: new Date().toISOString(),
          ip: 'system',
          changes: {
            doctorId: appointment.doctorId,
            slot: appointment.slot,
            date: appointment.date,
          },
        });

        appointmentsCreatedCounter.inc({
          status: 'BOOKED',
          hospitalId: appointment.hospitalId || 'unknown',
        });

        return appointment;
      } catch (error: any) {
        // Handle Prisma unique constraint violation explicitly (P2002)
        if (error.code === 'P2002') {
          logger.warn(
            { action: 'booking_conflict', doctorId: data.doctorId, slot: targetSlot },
            'Race condition double-booking prevented by Unique Constraint',
          );
          throw new Error('This slot was just booked by someone else. Please choose another.');
        }
        logger.error(
          { action: 'booking_transaction_failed', error: error.message },
          'Booking transaction failed',
        );
        throw error;
      }
    },

    updateVisitStatus: async (visitId: string, patientId: string, newStatus: BookingStatus) => {
      const appointment = await prisma.appointment.findFirst({
        where: { id: visitId, patientId },
      });

      if (!appointment) throw new Error('Appointment not found');

      const current = appointment.status;

      // Strict State Machine Enforcement
      const validTransitions: Record<string, string[]> = {
        [BookingStatus.AWAITING_PAYMENT]: [BookingStatus.BOOKED, BookingStatus.CANCELLED],
        [BookingStatus.BOOKED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
        [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
        [BookingStatus.CANCELLED]: [],
        [BookingStatus.COMPLETED]: [],
      };

      const allowed = validTransitions[current] || [];
      if (!allowed.includes(newStatus)) {
        logger.warn(
          { action: 'invalid_status_transition', visitId, current, newStatus },
          'Attempted invalid status transition',
        );
        throw new Error(`Invalid state transition: Cannot move from ${current} to ${newStatus}`);
      }

      const updated = await prisma.appointment.update({
        where: { id: visitId },
        data: { status: newStatus },
      });

      logger.info(
        { action: 'status_transition', visitId, oldStatus: current, newStatus },
        `Appointment status updated to ${newStatus}`,
      );
      return updated;
    },

    cancelVisit: async (patientId: string, visitId: string) => {
      logger.info(
        { action: 'cancel_booking_attempt', visitId },
        'Attempting to cancel appointment',
      );

      const visit = await prisma.appointment.findUnique({ where: { id: visitId } });
      if (!visit) throw new Error('Appointment not found');
      if (visit.patientId !== patientId) throw new Error('Unauthorized');

      const hrLimit = 6 * 60 * 60 * 1000;

      // Construct full Date by combining visit.date (Y-M-D) and visit.slot (H:m)
      const [hours, minutes] = (visit.slot || '09:00').split(':').map(Number);
      const appointmentTime = new Date(visit.date);
      appointmentTime.setHours(hours, minutes, 0, 0);

      if (appointmentTime.getTime() - Date.now() < hrLimit) {
        throw new Error(
          `Appointments cannot be cancelled within 6 hours of the scheduled time (${visit.slot})`,
        );
      }

      // If the user previously paid for this appointment, process a refund
      if (visit.status === 'CONFIRMED' || visit.status === 'BOOKED') {
        await services.patient.addWalletTransaction(patientId, {
          type: 'CREDIT',
          amount: await getAppointmentFee(visit),
          source: 'REFUND',
          description: `Refund for cancelled appointment`,
        });
      }

      // Delegate to the state machine to ensure it's a valid transition
      const cancelled = await services.patient.updateVisitStatus(
        visitId,
        patientId,
        BookingStatus.CANCELLED,
      );

      return cancelled;
    },

    getById: async (id: string) => {
      const patient = stripSensitive(await prisma.patient.findUnique({ where: { id } }));
      return patient;
    },

    getVisits: async (patientId: string) => {
      const appointments = await prisma.appointment.findMany({
        where: { patientId },
        include: {
          doctor: {
            include: {
              registration: true,
              affiliations: true,
            },
          },
          patient: true,
        },
        orderBy: { date: 'desc' },
      });
      return appointments.map((a) => {
        // Extract specialization from registration degree or affiliation department
        const degree = a.doctor?.registration?.degree || null;
        const department = a.doctor?.affiliations?.[0]?.department || null;
        const specialization = degree || department || 'General Consultation';

        return {
          id: a.id,
          doctorId: a.doctorId,
          doctorName: a.doctor?.fullName || 'Doctor',
          specialization,
          patientName: a.patient?.name || 'Patient',
          createdAt: a.createdAt ? a.createdAt.toISOString() : null,
          amountPaid:
            a.status === 'CONFIRMED' || a.status === 'COMPLETED'
              ? toFee(a.doctor?.affiliations?.[0]?.consultationFee)
              : 0,
          hospitalId: a.hospitalId || '',
          date: a.date,
          slot: a.slot,
          status: a.status,
          patientId: a.patientId,
        };
      });
    },

    // --- Family Members ---
    getFamilyMembers: async (patientId: string) => {
      return await prisma.familyMember.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });
    },
    addFamilyMember: async (
      patientId: string,
      data: { name: string; relation: string; dob?: string; gender?: string; bloodGroup?: string },
    ) => {
      return await prisma.familyMember.create({
        data: {
          patientId,
          name: data.name,
          relation: data.relation,
          dob: data.dob ? new Date(data.dob) : null,
          gender: data.gender || null,
          bloodGroup: data.bloodGroup || null,
        },
      });
    },
    deleteFamilyMember: async (patientId: string, memberId: string) => {
      return await prisma.familyMember.deleteMany({
        where: { id: memberId, patientId },
      });
    },

    // --- Medical History ---
    getMedicalHistory: async (patientId: string) => {
      return await prisma.patientMedicalHistory.findUnique({
        where: { patientId },
      });
    },
    saveMedicalHistory: async (
      patientId: string,
      data: {
        chronicDiseases?: string;
        pastIllnesses?: string;
        surgeries?: string;
        allergies?: string;
        drugAllergies?: string;
        hospitalizations?: string;
      },
    ) => {
      return await prisma.patientMedicalHistory.upsert({
        where: { patientId },
        update: data,
        create: { patientId, ...data },
      });
    },

    // --- Medications ---
    getMedications: async (patientId: string) => {
      return await prisma.patientMedication.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });
    },
    addMedication: async (
      patientId: string,
      data: { drugName: string; dose?: string; frequency?: string; startDate?: string },
    ) => {
      return await prisma.patientMedication.create({
        data: {
          patientId,
          drugName: data.drugName,
          dose: data.dose || null,
          frequency: data.frequency || null,
          startDate: data.startDate ? new Date(data.startDate) : null,
        },
      });
    },
    deleteMedication: async (patientId: string, medicationId: string) => {
      return await prisma.patientMedication.deleteMany({
        where: { id: medicationId, patientId },
      });
    },

    // --- Vitals ---
    getVitals: async (patientId: string) => {
      return await prisma.vitalRecord.findMany({
        where: { patientId },
        orderBy: { recordedAt: 'desc' },
        take: 20,
      });
    },
    addVital: async (
      patientId: string,
      data: {
        weight?: number;
        height?: number;
        bloodPressure?: string;
        pulse?: number;
        bloodSugar?: number;
        spo2?: number;
        temperature?: number;
      },
    ) => {
      const bmi =
        data.weight && data.height
          ? parseFloat((data.weight / (data.height / 100) ** 2).toFixed(1))
          : null;
      return await prisma.vitalRecord.create({
        data: {
          patientId,
          weight: data.weight ?? null,
          height: data.height ?? null,
          bmi,
          bloodPressure: data.bloodPressure || null,
          pulse: data.pulse ?? null,
          bloodSugar: data.bloodSugar ?? null,
          spo2: data.spo2 ?? null,
          temperature: data.temperature ?? null,
        },
      });
    },

    // --- Vaccinations ---
    getVaccinations: async (patientId: string) => {
      return await prisma.vaccinationRecord.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });
    },
    addVaccination: async (
      patientId: string,
      data: { vaccineName: string; dateGiven?: string; nextDueDate?: string },
    ) => {
      return await prisma.vaccinationRecord.create({
        data: {
          patientId,
          vaccineName: data.vaccineName,
          dateGiven: data.dateGiven ? new Date(data.dateGiven) : null,
          nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        },
      });
    },

    // --- Pregnancy Profile ---
    getPregnancyProfile: async (patientId: string) => {
      return await prisma.pregnancyProfile.findUnique({
        where: { patientId },
      });
    },
    savePregnancyProfile: async (
      patientId: string,
      data: {
        lmp?: string;
        edd?: string;
        gestationalAge?: number;
        highRisk?: boolean;
        ancVisits?: number;
        dangerSigns?: string;
        deliveryPlan?: string;
      },
    ) => {
      return await prisma.pregnancyProfile.upsert({
        where: { patientId },
        update: {
          lmp: data.lmp ? new Date(data.lmp) : undefined,
          edd: data.edd ? new Date(data.edd) : undefined,
          gestationalAge: data.gestationalAge,
          highRisk: data.highRisk,
          ancVisits: data.ancVisits,
          dangerSigns: data.dangerSigns,
          deliveryPlan: data.deliveryPlan,
        },
        create: {
          patientId,
          lmp: data.lmp ? new Date(data.lmp) : null,
          edd: data.edd ? new Date(data.edd) : null,
          gestationalAge: data.gestationalAge,
          highRisk: data.highRisk ?? false,
          ancVisits: data.ancVisits,
          dangerSigns: data.dangerSigns,
          deliveryPlan: data.deliveryPlan,
        },
      });
    },

    // --- Insurance ---
    getInsurance: async (patientId: string) => {
      return await prisma.insuranceDetail.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });
    },
    saveInsurance: async (
      patientId: string,
      data: {
        id?: string;
        company: string;
        policyNumber?: string;
        coverageAmount?: number;
        expiryDate?: string;
      },
    ) => {
      if (data.id) {
        const updated = await prisma.insuranceDetail.updateMany({
          where: { id: data.id, patientId },
          data: {
            company: data.company,
            policyNumber: data.policyNumber || null,
            coverageAmount: data.coverageAmount ?? null,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          },
        });
        if (updated.count === 0) {
          throw new Error('Insurance policy not found');
        }
        return await prisma.insuranceDetail.findFirst({
          where: { id: data.id, patientId },
        });
      }
      return await prisma.insuranceDetail.create({
        data: {
          patientId,
          company: data.company,
          policyNumber: data.policyNumber || null,
          coverageAmount: data.coverageAmount ?? null,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        },
      });
    },
    deleteInsurance: async (patientId: string, insuranceId: string) => {
      return await prisma.insuranceDetail.deleteMany({
        where: { id: insuranceId, patientId },
      });
    },

    // --- Addresses ---
    getAddresses: async (patientId: string) => {
      return await prisma.patientAddress.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });
    },
    addAddress: async (
      patientId: string,
      data: {
        type?: string;
        address: string;
        city: string;
        state?: string;
        pincode: string;
        landmark?: string;
        isDefault?: boolean;
      },
    ) => {
      if (data.isDefault) {
        await prisma.patientAddress.updateMany({
          where: { patientId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return await prisma.patientAddress.create({
        data: {
          patientId,
          type: data.type || 'Home',
          address: data.address,
          city: data.city,
          state: data.state || null,
          pincode: data.pincode,
          landmark: data.landmark || null,
          isDefault: data.isDefault || false,
        },
      });
    },
    deleteAddress: async (patientId: string, addressId: string) => {
      return await prisma.patientAddress.deleteMany({
        where: { id: addressId, patientId },
      });
    },
    setDefaultAddress: async (patientId: string, addressId: string) => {
      await prisma.patientAddress.updateMany({
        where: { patientId, isDefault: true },
        data: { isDefault: false },
      });
      return await prisma.patientAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    },

    // --- Wallet ---
    getWallet: async (patientId: string) => {
      let wallet = await prisma.wallet.findUnique({
        where: { patientId },
        include: {
          transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      });
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: { patientId, balance: 0.0 },
          include: { transactions: true },
        });
      }
      return {
        ...wallet,
        balance: wallet.balance.toNumber(),
        transactions: wallet.transactions.map((t) => ({
          ...t,
          amount: t.amount.toNumber(),
        })),
      };
    },
    addWalletTransaction: async (
      patientId: string,
      data: { type: string; amount: number; source: string; description?: string },
    ) => {
      return await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.upsert({
          where: { patientId },
          update: {
            balance:
              data.type === 'CREDIT' ? { increment: data.amount } : { decrement: data.amount },
          },
          create: { patientId, balance: data.type === 'CREDIT' ? data.amount : 0 },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: data.type,
            amount: data.amount,
            source: data.source,
            description: data.description || null,
          },
        });

        return wallet;
      });
    },

    // --- Prescriptions ---
    getPrescriptions: async (patientId: string) => {
      return await prisma.patientPrescription.findMany({
        where: { patientId },
        include: { items: true, doctor: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
      });
    },
    addStructuredPrescription: async (
      patientId: string,
      data: {
        doctorId?: string;
        appointmentId?: string;
        notes?: string;
        items: { medicineName: string; dosage: string; duration: string; instructions?: string }[];
      },
    ) => {
      return await prisma.patientPrescription.create({
        data: {
          patientId,
          doctorId: data.doctorId || null,
          appointmentId: data.appointmentId || null,
          type: 'STRUCTURED',
          notes: data.notes || null,
          items: {
            create: data.items.map((i) => ({
              medicineName: i.medicineName,
              dosage: i.dosage,
              duration: i.duration,
              instructions: i.instructions || null,
            })),
          },
        },
        include: { items: true },
      });
    },
    uploadPrescriptionFile: async (
      patientId: string,
      data: { doctorId?: string; appointmentId?: string; fileUrl: string; notes?: string },
    ) => {
      return await prisma.patientPrescription.create({
        data: {
          patientId,
          doctorId: data.doctorId || null,
          appointmentId: data.appointmentId || null,
          type: 'FILE',
          fileUrl: data.fileUrl,
          notes: data.notes || null,
        },
      });
    },
  },

  // --- Hospital Specific ---
  hospital: {
    getStats: async (hospitalId: string) => {
      const [totalVisits, todayVisits, scheduledVisits] = await Promise.all([
        prisma.visit.count({ where: { hospitalId } }),
        prisma.visit.count({
          where: { hospitalId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        }),
        prisma.appointment.count({
          where: { doctor: { affiliations: { some: { hospitalId } } }, status: 'CONFIRMED' },
        }),
      ]);

      return {
        totalVisits,
        todayVisits,
        scheduledVisits,
        totalPatients: await prisma.visit
          .groupBy({ by: ['patientPhone'], where: { hospitalId } })
          .then((res) => res.length),
        totalDoctors: await prisma.doctorHospitalAffiliation.count({
          where: { hospitalId, isCurrent: true },
        }),
        completedVisits: 0,
        cancelledVisits: 0,
      };
    },

    getVisits: async (hospitalId: string) => {
      return await prisma.visit.findMany({
        where: { hospitalId },
        include: {
          careJourney: true,
          appointment: { include: { doctor: true, patient: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    completeVisit: async (hospitalId: string, visitId: string, notes: string) => {
      logger.info(
        { action: 'hospital_complete_visit', hospitalId, visitId },
        'Completing visit with AI processing',
      );

      // 1. Update visit with initial notes (stored in diagnosis for now)
      const visit = await prisma.visit.update({
        where: { id: visitId, hospitalId },
        data: { diagnosis: notes },
      });

      // 2. Trigger Post-Visit AI Pipeline
      await services.ai.processVisit(visitId, notes);

      return visit;
    },

    getPatients: async (hospitalId: string) => {
      const visits = await prisma.visit.findMany({
        where: { hospitalId },
        select: { patientName: true, patientPhone: true },
      });
      const uniqueMap = new Map();
      visits.forEach((v) => uniqueMap.set(v.patientPhone, v));
      return Array.from(uniqueMap.values()).map((v, i) => ({
        id: i.toString(),
        name: v.patientName || 'Unknown',
        mobile: v.patientPhone,
      }));
    },

    getDoctors: async (hospitalId: string) => {
      /**
       * PERFORMANCE (FIX N+1):
       * Avoid fetching affiliations and then looping for doctor details.
       * Deep include handles registration and slots in a single SQL join.
       */
      const affiliations = await prisma.doctorHospitalAffiliation.findMany({
        where: { hospitalId, isCurrent: true },
        include: {
          doctor: {
            include: {
              registration: true,
              slots: { where: { isActive: true } },
            },
          },
        },
      });
      return affiliations.map((a) => ({
        id: a.doctor.id,
        name: a.doctor.fullName,
        speciality: a.department || '',
        mobile: a.doctor.mobile,
        role: a.role,
        fee: toFee(a.consultationFee),
        registration: a.doctor.registration?.registrationNumber,
        activeSlots: a.doctor.slots.length,
      }));
    },

    getPendingDoctors: async (hospitalId: string) => {
      const affiliations = await prisma.doctorHospitalAffiliation.findMany({
        where: { hospitalId, verificationStatus: 'PENDING' },
        include: { doctor: true },
      });
      return affiliations.map((a) => ({
        id: a.doctor.id,
        name: a.doctor.fullName,
        speciality: a.department || '',
        mobile: a.doctor.mobile,
        role: a.role,
        schedule: a.schedule,
      }));
    },

    approveDoctorAffiliation: async (hospitalId: string, doctorId: string) => {
      return await prisma.doctorHospitalAffiliation.updateMany({
        where: { hospitalId, doctorId },
        data: { verificationStatus: 'VERIFIED', isCurrent: true, approvedAt: new Date() },
      });
    },

    rejectDoctorAffiliation: async (hospitalId: string, doctorId: string) => {
      return await prisma.doctorHospitalAffiliation.updateMany({
        where: { hospitalId, doctorId },
        data: { verificationStatus: 'REJECTED', isCurrent: false },
      });
    },

    getPatientById: async (hospitalId: string, patientId: string) => {
      const patient = await prisma.patient.findUnique({ where: { id: patientId } });
      if (patient) {
        return { name: patient.name, mobile: patient.phone };
      }

      // Fall back to visit-backed walk-ins when there is no patient master record.
      const visit = await prisma.visit.findFirst({
        where: {
          hospitalId,
          OR: [{ id: patientId }, { appointment: { is: { patientId } } }],
        },
      });

      return visit ? { name: visit.patientName, mobile: visit.patientPhone } : null;
    },

    getDiagnosticCatalog: async (hospitalId: string) => {
      return await prisma.hospitalDiagnosticPricing.findMany({
        where: { hospitalId },
        include: { test: { include: { category: true } } },
      });
    },

    getLabOrders: async (hospitalId: string) => {
      return await prisma.diagnosticOrder.findMany({
        where: { hospitalId },
        include: { patient: true },
        orderBy: { createdAt: 'desc' },
      });
    },

    login: async (mobile: string, password?: string) => {
      if (!password) throw new Error('PASSWORD_REQUIRED');

      // Normalize mobile: remove any non-digit characters and take last 10 digits
      const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);

      // Fetch hospital via raw SQL since @ignore fields (password, name)
      // can cause the Prisma Query Engine to panic during findFirst without explicit select.
      const hospitals = await prisma.$queryRaw<any[]>`
                SELECT * FROM hospitals_master WHERE contact_number = ${normalizedMobile} LIMIT 1
            `;

      const hospital = hospitals?.[0];

      if (!hospital) {
        logger.warn(
          { action: 'hospital_login_failed', mobile: normalizedMobile },
          'Hospital not found',
        );
        return null;
      }

      const passwordHash = hospital.password;
      if (passwordHash && (await bcrypt.compare(password, passwordHash))) {
        logger.info(
          { action: 'hospital_login', hospitalId: hospital.id },
          'Hospital logged in successfully',
        );
        return {
          user: {
            id: hospital.id,
            name: hospital.display_name || hospital.legal_name || 'Hospital Admin',
            role: UserRole.HOSPITAL_ADMIN,
            hospitalId: hospital.id,
          },
        };
      }
      logger.warn(
        { action: 'hospital_login_failed', mobile: normalizedMobile },
        'Failed hospital login attempt',
      );
      return null;
    },

    register: async (data: {
      hospitalName: string;
      city: string;
      adminName: string;
      mobile: string;
      password?: string;
      registrationNumber?: string;
      facilityType?: 'HOSPITAL' | 'CLINIC';
      approvalDocumentUrl?: string;
      googleLocationUrl?: string;
      medicalCouncilNumber?: string;
      specialities?: string[];
    }) => {
      logger.info(
        { action: 'hospital_register', hospitalName: data.hospitalName },
        'Registering new hospital',
      );
      if (!data.password) throw new Error('PASSWORD_REQUIRED');

      // 0. Pre-check: reject duplicate mobile before entering transaction
      const existingAdmin = await prisma.hospitalAdmin.findUnique({
        where: { mobile: data.mobile },
      });
      if (existingAdmin) {
        logger.warn(
          { action: 'hospital_register_duplicate', mobile: data.mobile },
          'Duplicate mobile on hospital registration',
        );
        throw new Error('MOBILE_ALREADY_REGISTERED');
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      return await prisma.$transaction(async (tx) => {
        // Generate a random registration number if not provided
        const regNumber = data.registrationNumber || `REG-${Date.now()}`;

        // 1. Create Hospital (password set via raw SQL since @ignore)
        const hospital = await tx.hospitalsMaster.create({
          data: {
            legalName: data.hospitalName,
            registrationNumber: regNumber,
            city: data.city,
            contactNumber: data.mobile,
            verificationStatus: 'pending',
            accountStatus: 'inactive',
            facilityType: data.facilityType || 'HOSPITAL',
            approvalDocumentUrl: data.approvalDocumentUrl || null,
            googleLocationUrl: data.googleLocationUrl || null,
            medicalCouncilNumber: data.medicalCouncilNumber || null,
            specialities: (data.specialities || []) as any,
          },
          select: {
            id: true,
            legalName: true,
            city: true,
            contactNumber: true,
          },
        });

        // Set password hash via raw SQL (field is @ignore in Prisma schema)
        await tx.$executeRaw`UPDATE hospitals_master SET password = ${hashedPassword} WHERE id = ${hospital.id}`;

        // 2. Add Primary Admin
        await tx.hospitalAdmin.create({
          data: {
            hospitalId: hospital.id,
            fullName: data.adminName,
            mobile: data.mobile,
            email: `${data.mobile}@haspataal.com`,
            isPrimary: true,
            verificationStatus: 'pending',
          },
        });

        // 3. Create Staff record for primary admin
        await tx.staff.create({
          data: {
            hospitalId: hospital.id,
            name: data.adminName,
            mobile: data.mobile,
            password: hashedPassword,
            role: 'HOSPITAL_ADMIN',
            isActive: true,
          },
        });

        // 4. Emit event (fire-and-forget, outside tx)
        emitEvent({
          eventType: 'hospital_registered',
          hospitalId: hospital.id,
          payload: { hospitalName: data.hospitalName, city: data.city, adminName: data.adminName },
        });

        logAudit({
          action: 'CREATE',
          actorId: hospital.id,
          actorRole: 'HOSPITAL_ADMIN',
          resourceType: 'HOSPITAL',
          resourceId: hospital.id,
          timestamp: new Date().toISOString(),
          ip: 'system',
          changes: { name: hospital.legalName, city: hospital.city },
        });

        return toHospitalPublic({ ...hospital, name: hospital.legalName } as Record<
          string,
          unknown
        >);
      });
    },

    registerLab: async (data: {
      labName: string;
      city: string;
      adminName: string;
      mobile: string;
      password?: string;
      registrationNumber?: string;
    }) => {
      logger.info(
        { action: 'lab_register', labName: data.labName },
        'Registering new diagnostic lab',
      );
      if (!data.password) throw new Error('PASSWORD_REQUIRED');

      // 0. Pre-check: reject duplicate mobile before entering transaction
      const existingAdmin = await prisma.hospitalAdmin.findUnique({
        where: { mobile: data.mobile },
      });
      if (existingAdmin) {
        logger.warn(
          { action: 'lab_register_duplicate', mobile: data.mobile },
          'Duplicate mobile on lab registration',
        );
        throw new Error('MOBILE_ALREADY_REGISTERED');
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      return await prisma.$transaction(async (tx) => {
        const regNumber = data.registrationNumber || `LAB-${Date.now()}`;

        const lab = await tx.hospitalsMaster.create({
          data: {
            legalName: data.labName,
            registrationNumber: regNumber,
            city: data.city,
            contactNumber: data.mobile,
            verificationStatus: 'pending',
            accountStatus: 'inactive',
            type: 'DIAGNOSTIC_CENTER',
          },
          select: {
            id: true,
            legalName: true,
            city: true,
            contactNumber: true,
          },
        });

        // Set password hash via raw SQL (field is @ignore in Prisma schema)
        await tx.$executeRaw`UPDATE hospitals_master SET password = ${hashedPassword} WHERE id = ${lab.id}`;

        await tx.hospitalAdmin.create({
          data: {
            hospitalId: lab.id,
            fullName: data.adminName,
            mobile: data.mobile,
            email: `${data.mobile}@haspataal.com`,
            isPrimary: true,
            verificationStatus: 'pending',
          },
        });

        emitEvent({
          eventType: 'lab_registered',
          hospitalId: lab.id,
          payload: { labName: data.labName, city: data.city, adminName: data.adminName },
        });

        return toHospitalPublic({ ...lab, name: lab.legalName } as Record<string, unknown>);
      });
    },

    createVisit: async (
      hospitalId: string,
      data: { patientMobile: string; patientName: string; doctorId?: string; date: string },
    ) => {
      logger.info(
        { action: 'hospital_create_visit', hospitalId, doctorId: data.doctorId },
        'Hospital staff creating new visit',
      );
      const hashedPassword = await bcrypt.hash(generatePasswordSeed(), 12);
      const patient = await prisma.patient.upsert({
        where: { phone: data.patientMobile },
        update: { name: data.patientName },
        create: {
          phone: data.patientMobile,
          name: data.patientName,
          password: hashedPassword,
        },
      });

      let consultationFee = DEFAULT_CONSULTATION_FEE;
      if (data.doctorId) {
        const affiliation = await prisma.doctorHospitalAffiliation.findFirst({
          where: {
            doctorId: data.doctorId,
            hospitalId,
            isCurrent: true,
            verificationStatus: 'VERIFIED',
          },
        });
        if (!affiliation) {
          throw new Error('Doctor is not approved for this hospital.');
        }
        consultationFee = toFee(affiliation.consultationFee);

        await prisma.appointment.create({
          data: {
            patientId: patient.id,
            doctorId: data.doctorId,
            date: new Date(data.date),
            slot: 'OPD',
            status: 'COMPLETED',
            hospitalId,
          },
        });
      }

      const visit = await prisma.visit.create({
        data: {
          hospitalId,
          patientName: data.patientName,
          patientPhone: data.patientMobile,
          diagnosis: 'OPD Visit',
          amount: consultationFee,
        },
      });

      emitEvent({
        eventType: 'patient_visited',
        hospitalId,
        patientId: patient.id,
        payload: {
          patientName: data.patientName,
          patientPhone: data.patientMobile,
          doctorId: data.doctorId || null,
        },
      });

      return visit;
    },

    addDoctor: async (
      hospitalId: string,
      data: { name: string; mobile: string; schedule?: string; qualifications?: string },
    ): Promise<{
      doctor: typeof import('@prisma/client').Prisma extends never ? any : any;
      tempPassword: string;
    }> => {
      // Generate a secure one-time temporary password for the doctor.
      // The plaintext is returned ONCE so the hospital can share it; only the hash is persisted.
      const tempPassword = generateTempPassword(12);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      logger.info(
        { action: 'hospital_add_doctor', hospitalId, mobile: data.mobile },
        'Adding hospital-enrolled doctor with hashed temp password',
      );

      const doctor = await prisma.doctorMaster.create({
        data: {
          fullName: data.name,
          mobile: data.mobile,
          email: `${data.mobile}@example.com`,
          password: hashedPassword,
          registration: {
            create: {
              registrationNumber: `HOSP-${Date.now()}`,
              councilName: 'Hospital Added',
              degree: data.qualifications,
            },
          },
          affiliations: {
            create: {
              hospitalId,
              role: 'DOCTOR',
              isCurrent: true,
              schedule: data.schedule,
            },
          },
        },
      });
      emitEvent({
        eventType: 'doctor_added',
        hospitalId,
        payload: { doctorName: data.name, doctorId: doctor.id },
      });
      // Return both the doctor record AND the one-time plaintext password.
      // Callers MUST surface this to the hospital admin immediately; it is never stored in plaintext.
      return { doctor, tempPassword };
    },

    createReferral: async (
      hospitalId: string,
      data: {
        patientId: string;
        fromDoctorId: string;
        toDoctorId: string;
        reason: string;
        priority?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
        notes?: string;
      },
    ) => {
      logger.info(
        {
          action: 'hospital_create_referral',
          hospitalId,
          fromDoctorId: data.fromDoctorId,
          toDoctorId: data.toDoctorId,
        },
        'Creating internal referral',
      );
      return await prisma.internalReferral.create({
        data: {
          hospitalId,
          patientId: data.patientId,
          fromDoctorId: data.fromDoctorId,
          toDoctorId: data.toDoctorId,
          reason: data.reason,
          priority: data.priority || 'ROUTINE',
          notes: data.notes || null,
        },
      });
    },

    getReferralTimeline: async (patientId: string) => {
      return await prisma.internalReferral.findMany({
        where: { patientId },
        include: {
          fromDoctor: { select: { fullName: true } },
          toDoctor: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    payoutConsultant: async (
      hospitalId: string,
      doctorId: string,
      periodStart: Date,
      periodEnd: Date,
    ) => {
      logger.info(
        { action: 'hospital_consultant_payout', hospitalId, doctorId },
        'Calculating consultant settlement',
      );

      const visits = await prisma.visit.findMany({
        where: {
          hospitalId,
          createdAt: { gte: periodStart, lte: periodEnd },
          appointment: { doctorId },
        },
      });

      const totalConsultations = visits.length;
      const grossRevenueCents = visits.reduce((sum, v) => sum + v.amount * 100, 0);

      const affiliation = await prisma.doctorHospitalAffiliation.findUnique({
        where: { doctorId_hospitalId: { doctorId, hospitalId } },
      });

      const payloadObj = affiliation?.payload as any;
      const sharePercent = payloadObj?.revenueSharePercent
        ? Number(payloadObj.revenueSharePercent)
        : 70.0;
      const consultantShareCents = Math.round((grossRevenueCents * sharePercent) / 100);
      const hospitalShareCents = grossRevenueCents - consultantShareCents;

      return await prisma.consultantSettlement.create({
        data: {
          hospitalId,
          doctorId,
          settlementPeriodStart: periodStart,
          settlementPeriodEnd: periodEnd,
          totalConsultations,
          grossRevenueCents,
          revenueSharePercent: sharePercent,
          consultantShareCents,
          hospitalShareCents,
          status: 'PENDING',
        },
      });
    },

    handoffPatient: async (
      visitId: string,
      hospitalId: string,
      fromStage: any,
      toStage: any,
      staffId?: string,
      notes?: string,
    ) => {
      logger.info(
        { action: 'hospital_handoff_patient', visitId, fromStage, toStage },
        'Executing patient handoff',
      );

      // Update prior handoffs as completed
      await prisma.departmentHandoff.updateMany({
        where: { visitId, toStage: fromStage, status: 'PENDING' },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      // Create new handoff
      const handoff = await prisma.departmentHandoff.create({
        data: {
          visitId,
          hospitalId,
          fromStage,
          toStage,
          status: 'PENDING',
          assignedStaffId: staffId || null,
          notes: notes || null,
        },
      });

      // Update visit current stage
      await prisma.visit.update({
        where: { id: visitId },
        data: { currentStage: toStage },
      });

      return handoff;
    },

    removeDoctor: async (hospitalId: string, doctorId: string) => {
      const result = await prisma.doctorHospitalAffiliation.deleteMany({
        where: { hospitalId, doctorId },
      });
      emitEvent({ eventType: 'doctor_removed', hospitalId, payload: { doctorId } });
      return result;
    },
  },

  // --- Doctor Specific ---
  doctor: {
    login: async (mobile: string, password: string) => {
      const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);

      const doctor = await prisma.doctorMaster.findUnique({
        where: { mobile: normalizedMobile },
        select: {
          id: true,
          fullName: true,
          mobile: true,
          email: true,
          accountStatus: true,
          kycStatus: true,
          password: true,
        },
      });

      if (!doctor || !doctor.password) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, doctor.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      if (doctor.accountStatus === 'SUSPENDED') {
        throw new Error('Account is suspended');
      }

      return {
        user: {
          id: doctor.id,
          name: doctor.fullName,
          role: UserRole.DOCTOR,
          mobile: doctor.mobile,
          email: doctor.email,
        },
      };
    },
    requestOtp: async (mobile: string) => {
      const result = await OtpService.sendOtp(
        { phone: mobile, purpose: OtpPurpose.HOSPITAL_LOGIN }
      );
      if (!result.success) {
        throw new Error(result.message || 'OTP request failed');
      }

      const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);
      const code = result.code || '';
      const expiresAt = result.expiresAt ? new Date(result.expiresAt) : new Date();

      logger.info(
        { action: 'doctor_otp_generated', mobile: normalizedMobile },
        'Doctor OTP generated',
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(
          '%c[DEMO DOCTOR OTP]',
          'background: #14b8a6; color: black; font-weight: bold; padding: 2px 8px; border-radius: 4px;',
          `Mobile: ${mobile} | Code: ${code} | Expires: ${expiresAt.toISOString()}`,
        );
      }

      try {
        const channel = (process.env.DOCTOR_OTP_CHANNEL as OtpChannel) || 'SMS';
        const { dispatchOtpNotification } = await import('./otp-notification-dispatcher');
        const notifyResult = await dispatchOtpNotification({
          mobile: normalizedMobile,
          code,
          channel,
          recipientName: 'Doctor',
        });

        if (!notifyResult.success) {
          logger.warn(
            {
              action: 'doctor_otp_dispatch_failed',
              mobile: normalizedMobile,
              channel,
              error: notifyResult.error,
            },
            'Doctor OTP dispatch failed',
          );
        }
      } catch (dispatchError) {
        logger.warn(
          { action: 'doctor_otp_dispatch_failed', mobile: normalizedMobile, error: dispatchError },
          'Doctor OTP dispatch failed',
        );
      }

      return true;
    },
    verifyOtp: async (mobile: string, otp: string) => {
      const result = await OtpService.verifyOtp(
        { phone: mobile, otp, purpose: OtpPurpose.HOSPITAL_LOGIN }
      );

      if (!result.success) {
        throw new Error(result.message || 'OTP verification failed');
      }

      if (result.user) {
        return { user: result.user };
      }

      throw new Error('OTP verification failed');
    },
    register: async (data: {
      fullName: string;
      mobile: string;
      email: string;
      password?: string;
      registrationNumber: string;
      councilName: string;
    }) => {
      logger.info(
        { action: 'doctor_register', mobile: data.mobile },
        'Self-registering new doctor',
      );
      if (!data.password) throw new Error('PASSWORD_REQUIRED');
      const hashedPassword = await bcrypt.hash(data.password, 12);

      return await prisma.$transaction(async (tx) => {
        const doctor = await tx.doctorMaster.create({
          data: {
            fullName: data.fullName,
            mobile: data.mobile,
            email: data.email,
            password: hashedPassword,
            kycStatus: 'PENDING',
            accountStatus: 'INACTIVE',
            registration: {
              create: {
                registrationNumber: data.registrationNumber,
                councilName: data.councilName,
                verificationStatus: 'PENDING',
              },
            },
          },
        });
        emitEvent({
          eventType: 'doctor_registered',
          payload: { doctorName: data.fullName, mobile: data.mobile },
        });
        return doctor;
      });
    },

    getDashboardStats: async (doctorId: string) => {
      const now = new Date();

      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

      const [todayAppointments, patientsSeenThisWeek, pendingRecords, doctor] = await Promise.all([
        // Today's appointments
        prisma.appointment.count({
          where: {
            doctorId,
            date: { gte: startOfDay, lt: endOfDay },
            status: { in: ['BOOKED', 'CONFIRMED'] },
          },
        }),

        // Patients seen this week (distinct patients)
        prisma.appointment
          .groupBy({
            by: ['patientId'],
            where: {
              doctorId,
              date: { gte: startOfWeek, lt: endOfWeek },
              status: 'COMPLETED',
            },
          })
          .then((res) => res.length),

        // Pending records (draft or awaiting review)
        prisma.patientRecord.count({
          where: {
            doctorId,
          },
        }),

        // Upcoming appointments total (for today or future)
        prisma.doctorMaster.findUnique({
          where: { id: doctorId },
          select: {
            accountStatus: true,
            _count: {
              select: {
                appointments: {
                  where: {
                    date: { gte: startOfDay },
                    status: { in: ['BOOKED', 'CONFIRMED'] },
                  },
                },
              },
            },
          },
        }),
      ]);

      return {
        todayAppointments,
        patientsSeenThisWeek,
        pendingRecords,
        upcomingAppointments: doctor?._count.appointments || 0,
        clinicStatus:
          doctor?.accountStatus === 'ACTIVE'
            ? 'ACTIVE'
            : doctor?.accountStatus === 'SUSPENDED'
              ? 'OFFLINE'
              : 'ON_LEAVE',
      };
    },
  },

  // --- Admin Services ---
  admin: {
    getPlatformStats: async () => {
      return {
        totalHospitals: await prisma.hospitalsMaster.count(),
        verifiedHospitals: await prisma.hospitalsMaster.count({
          where: { verificationStatus: 'verified' },
        }),
        totalDoctors: await prisma.doctorMaster.count(),
        totalPatients: await prisma.patient.count(),
      };
    },

    login: async (username: string, password?: string) => {
      const adminPassHash = process.env.ADMIN_PASSWORD_HASH;
      const adminUser = process.env.ADMIN_USERNAME;

      if (!adminPassHash || !adminUser) {
        throw new Error(
          'ADMIN_PASSWORD_HASH and ADMIN_USERNAME must be set in environment variables',
        );
      }

      if (password && username === adminUser && (await bcrypt.compare(password, adminPassHash))) {
        logger.info({ action: 'admin_login', username }, 'Admin logged in successfully');
        return {
          user: {
            id: 'admin',
            role: UserRole.PLATFORM_ADMIN,
            name: 'Platform Admin',
          },
        };
      }
      logger.warn({ action: 'admin_login_failed', username }, 'Failed admin login attempt');
      return null;
    },

    getPendingHospitals: async (): Promise<HospitalPublic[]> => {
      const data = await prisma.hospitalsMaster.findMany({
        where: { verificationStatus: 'pending' },
      });
      if (!Array.isArray(data)) throw new Error('getPendingHospitals must return an array');
      return HospitalArraySchema.parse(data).map(toHospitalPublic) as HospitalPublic[];
    },

    getAllHospitals: async (): Promise<HospitalPublic[]> => {
      const data = await prisma.hospitalsMaster.findMany();
      if (!Array.isArray(data)) throw new Error('getAllHospitals must return an array');
      return HospitalArraySchema.parse(data).map(toHospitalPublic) as HospitalPublic[];
    },

    approveHospital: async (id: string) => {
      logger.info({ action: 'approve_hospital', hospitalId: id }, 'Admin approving hospital');
      const result = await prisma.hospitalsMaster.update({
        where: { id },
        data: { verificationStatus: 'verified', accountStatus: 'inactive' },
      });
      emitEvent({
        eventType: 'hospital_approved',
        hospitalId: id,
        payload: { hospitalName: result.legalName },
      });
      return result;
    },

    rejectHospital: async (id: string) => {
      logger.info({ action: 'reject_hospital', hospitalId: id }, 'Admin rejecting hospital');
      const result = await prisma.hospitalsMaster.update({
        where: { id },
        data: { verificationStatus: 'rejected', accountStatus: 'inactive' },
      });
      emitEvent({
        eventType: 'hospital_rejected',
        hospitalId: id,
        payload: { hospitalName: result.legalName },
      });
      return result;
    },

    suspendHospital: async (id: string) => {
      logger.info({ action: 'suspend_hospital', hospitalId: id }, 'Admin suspending hospital');
      const result = await prisma.hospitalsMaster.update({
        where: { id },
        data: { accountStatus: 'suspended' },
      });
      emitEvent({
        eventType: 'hospital_suspended',
        hospitalId: id,
        payload: { hospitalName: result.legalName },
      });
      return result;
    },
  },

  // --- Agent Services ---
  agent: {
    register: async (data: {
      fullName: string;
      mobile: string;
      email: string;
      password?: string;
      area?: string;
      city?: string;
      state?: string;
    }) => {
      logger.info({ action: 'agent_register', mobile: data.mobile }, 'Registering new agent');
      if (!data.password) throw new Error('PASSWORD_REQUIRED');
      const hashedPassword = await bcrypt.hash(data.password, 12);

      const agent = await prisma.agent.create({
        data: {
          fullName: data.fullName,
          mobile: data.mobile,
          email: data.email,
          password: hashedPassword,
          area: data.area,
          city: data.city,
          state: data.state,
          kycStatus: 'PENDING',
          accountStatus: 'INACTIVE',
          commissionRate: 5.0,
        },
      });
      emitEvent({
        eventType: 'agent_registered',
        payload: { agentName: data.fullName, mobile: data.mobile },
      });
      return agent;
    },

    login: async (mobile: string, password?: string) => {
      if (!password) throw new Error('PASSWORD_REQUIRED');

      // Normalize mobile: remove any non-digit characters and take last 10 digits
      const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);

      const agent = await prisma.agent.findFirst({
        where: { mobile: normalizedMobile },
      });

      if (!agent) {
        throw new Error('Agent not found. Please register first.');
      }

      if (agent.accountStatus !== 'ACTIVE') {
        throw new Error('Your account is not active. Please wait for admin approval.');
      }

      const isValid = await bcrypt.compare(password, agent.password);
      if (!isValid) {
        throw new Error('Invalid credentials.');
      }

      return {
        user: {
          id: agent.id,
          role: UserRole.AGENT,
          name: agent.fullName,
          mobile: agent.mobile,
          status: agent.accountStatus,
        },
      };
    },

    getDashboardData: async (agentId: string) => {
      // PERFORMANCE: Parallelize independent queries to reduce total response time
      const [hospitals, patients] = await Promise.all([
        prisma.hospitalsMaster.findMany({
          where: { agentId },
          select: {
            id: true,
            legalName: true,
            verificationStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.patient.findMany({
          where: { agentId },
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return {
        hospitals,
        patients,
        stats: {
          totalHospitals: hospitals.length,
          approvedHospitals: hospitals.filter((h) => h.verificationStatus === 'verified').length,
          totalPatients: patients.length,
        },
      };
    },
  },

  // --- AI Services ---
  ai: {
    processVisit: async (
      visitId: string,
      notes: string,
      imageData?: { mimeType: string; data: string },
    ) => {
      logger.info(
        { action: 'process_visit_advanced_ai', visitId },
        'Starting advanced post-consultation AI processing',
      );

      // 1. Get visit & patient context
      const visit = await prisma.visit.findUnique({
        where: { id: visitId },
        include: {
          appointment: { include: { patient: true, doctor: true } },
        },
      });

      if (!visit) throw new Error('Visit not found');

      const patient = visit.appointment?.patient;
      const patientAge = patient
        ? new Date().getFullYear() - (patient.dob ? new Date(patient.dob).getFullYear() : 30)
        : undefined;

      // 2. Trigger Advanced AI Engine
      const { ConsultationAiEngine } = await import('./ai/engine');
      const careJourney = await ConsultationAiEngine.process({
        visitId,
        clinicalNotes: notes,
        prescriptionImage: imageData,
        patientProfile: {
          age: patientAge,
          language: 'English/Hindi', // Default for now
        },
      });

      // 3. Save raw notes for audit
      await prisma.visitNote.create({
        data: { visitId, content: notes, type: imageData ? 'OCR+NOTE' : 'CLINICAL_NOTE' },
      });

      logger.info(
        { action: 'process_visit_ai_complete', visitId },
        'Advanced Care Journey generated',
      );
      return careJourney;
    },

    getVisitAnalysis: async (visitId: string) => {
      return await prisma.careJourney.findUnique({
        where: { visitId },
        include: {
          visit: {
            include: {
              observations: true,
              appointment: { include: { doctor: true } },
            },
          },
          medications: true,
          followUp: true,
          redFlags: true,
        },
      });
    },

    getVisitAnalysisForPatient: async (patientId: string, visitId: string) => {
      const analysis = await prisma.careJourney.findUnique({
        where: { visitId },
        include: {
          visit: {
            include: {
              observations: true,
              appointment: {
                include: {
                  doctor: true,
                },
              },
            },
          },
          medications: true,
          followUp: true,
          redFlags: true,
        },
      });

      if (!analysis) {
        return null;
      }

      if (analysis.visit?.appointment?.patientId !== patientId) {
        throw new Error('Unauthorized');
      }

      return analysis;
    },
  },

  // --- Compliance & Privacy (DPDP) ---
  compliance: {
    recordConsent: async (
      patientId: string,
      purpose: 'APPOINTMENT_BOOKING' | 'HEALTH_RECORDS' | 'MARKETING',
    ) => {
      return await prisma.consent.upsert({
        where: {
          patientId_purpose_version: {
            patientId,
            purpose,
            version: 1,
          },
        },
        create: {
          patientId,
          purpose,
          version: 1,
        },
        update: {
          givenAt: new Date(),
          withdrawnAt: null,
        },
      });
    },

    withdrawConsent: async (
      patientId: string,
      purpose: 'APPOINTMENT_BOOKING' | 'HEALTH_RECORDS' | 'MARKETING',
    ) => {
      return await prisma.consent.update({
        where: {
          patientId_purpose_version: {
            patientId,
            purpose,
            version: 1,
          },
        },
        data: {
          withdrawnAt: new Date(),
        },
      });
    },

    checkConsent: async (
      patientIdOrMobile: string,
      purpose: 'APPOINTMENT_BOOKING' | 'HEALTH_RECORDS' | 'MARKETING',
    ) => {
      // Find patient first if mobile is provided
      let patientId = patientIdOrMobile;
      if (!patientIdOrMobile.includes('-')) {
        // Simple heuristic: mobile doesn't have hyphens
        const p = await prisma.patient.findUnique({ where: { phone: patientIdOrMobile } });
        if (!p) return false;
        patientId = p.id;
      }

      const consent = await prisma.consent.findUnique({
        where: {
          patientId_purpose_version: {
            patientId,
            purpose,
            version: 1,
          },
        },
      });
      return !!consent && !consent.withdrawnAt;
    },

    deletePatientData: async (patientId: string) => {
      return await prisma.$transaction(async (tx) => {
        // 1. Anonymize Patient Record
        const _patient = await tx.patient.update({
          where: { id: patientId },
          data: {
            name: '[DELETED]',
            phone: `DELETED-${patientId.substring(0, 8)}`,
            email: `deleted-${patientId.substring(0, 8)}@haspataal.deleted`,
            abhaAddress: null,
            address: null,
            password: 'DELETED',
          },
        });

        // 2. Soft-delete Appointment History
        await tx.appointment.updateMany({
          where: { patientId },
          data: {
            status: 'CANCELLED',
            notes: '[DATA ERASURE REQUEST PROCESSED]',
          },
        });

        // 3. Audit Log
        logAudit({
          action: 'DELETE',
          actorId: 'SYSTEM',
          actorRole: 'PLATFORM_ADMIN',
          resourceType: 'PATIENT',
          resourceId: patientId,
          timestamp: new Date().toISOString(),
          ip: 'system',
          changes: { erasure: true, timestamp: new Date() },
        });

        return { success: true };
      });
    },
  },

  // --- Hospital Setup / Onboarding Services (Discovery, Auto-Configuration, Data Migration) ---
  hospitalSetup: {
    saveOperationalProfile: async (hospitalId: string, data: any) => {
      logger.info(
        { action: 'setup_save_operational_profile', hospitalId },
        'Saving operational questionnaire profile',
      );
      return await prisma.clinicOperationalProfile.upsert({
        where: { hospitalId },
        update: {
          isSingleDoctor: data.isSingleDoctor,
          hasConsultants: data.hasConsultants,
          dailyStaffCount: Number(data.dailyStaffCount || 1),
          hasReceptionist: data.hasReceptionist,
          hasNursingStaff: data.hasNursingStaff,
          hasPharmacy: data.hasPharmacy,
          hasOwnLab: data.hasOwnLab,
          admitsPatients: data.admitsPatients,
          avgDailyPatients: Number(data.avgDailyPatients || 10),
          opdOnly: data.opdOnly,
          currentWorkflow: data.currentWorkflow || null,
          digitalMaturity: data.digitalMaturity || null,
          retentionLeaks: data.retentionLeaks || null,
          pharmacyConfig: data.pharmacyConfig || null,
          labConfig: data.labConfig || null,
          communicationPrefs: data.communicationPrefs || null,
        },
        create: {
          hospitalId,
          isSingleDoctor: data.isSingleDoctor,
          hasConsultants: data.hasConsultants,
          dailyStaffCount: Number(data.dailyStaffCount || 1),
          hasReceptionist: data.hasReceptionist,
          hasNursingStaff: data.hasNursingStaff,
          hasPharmacy: data.hasPharmacy,
          hasOwnLab: data.hasOwnLab,
          admitsPatients: data.admitsPatients,
          avgDailyPatients: Number(data.avgDailyPatients || 10),
          opdOnly: data.opdOnly,
          currentWorkflow: data.currentWorkflow || null,
          digitalMaturity: data.digitalMaturity || null,
          retentionLeaks: data.retentionLeaks || null,
          pharmacyConfig: data.pharmacyConfig || null,
          labConfig: data.labConfig || null,
          communicationPrefs: data.communicationPrefs || null,
        },
      });
    },

    autoConfigureClinic: async (hospitalId: string) => {
      logger.info(
        { action: 'setup_autoconfigure_clinic', hospitalId },
        'Running automatic workspace provisioning',
      );

      const profile = await prisma.clinicOperationalProfile.findUnique({
        where: { hospitalId },
      });

      if (!profile) {
        throw new Error('OPERATIONAL_PROFILE_MISSING');
      }

      return await prisma.$transaction(async (tx) => {
        // 1. Create Default Departments based on Profile
        const depts = [];
        if (profile.opdOnly) {
          depts.push('Outpatient Department (OPD)');
        } else {
          depts.push('Outpatient Department (OPD)');
          depts.push('Inpatient Department (IPD)');
        }

        if (profile.hasPharmacy) {
          depts.push('Pharmacy Dispensary');
        }
        if (profile.hasOwnLab) {
          depts.push('Diagnostic Laboratory');
        }

        // Clean existing depts first to be idempotent
        await tx.hospitalDepartment.deleteMany({
          where: { hospitalId },
        });

        for (const deptName of depts) {
          await tx.hospitalDepartment.create({
            data: { hospitalId, departmentName: deptName },
          });
        }

        // 2. Set Default Billing Profiles
        await tx.hospitalBillingProfile.upsert({
          where: { hospitalId },
          update: { gstApplicable: !profile.hasPharmacy },
          create: {
            hospitalId,
            gstApplicable: !profile.hasPharmacy,
            bankAccountNumber: '1234567890',
            bankIfsc: 'IFSC000123',
          },
        });

        // 3. Configure Default OPD Config
        await tx.opdConfig.upsert({
          where: { hospitalId },
          update: {
            avgConsultationMinutes: 15,
            allowOverbooking: true,
            maxOverbookingPercent: 10,
          },
          create: {
            hospitalId,
            avgConsultationMinutes: 15,
            allowOverbooking: true,
            maxOverbookingPercent: 10,
          },
        });

        // 4. Do not mark the hospital active yet. They must complete the setup stages.
        await tx.hospitalsMaster.update({
          where: { id: hospitalId },
          data: { accountStatus: 'inactive' },
        });

        return { success: true };
      });
    },

    importLegacyData: async (hospitalId: string, data: { patients: any[] }) => {
      logger.info(
        { action: 'setup_import_legacy_data', hospitalId, count: data.patients.length },
        'Importing legacy clinic records',
      );

      const results = [];
      const hashedPassword = await bcrypt.hash('pass123', 12);

      for (const p of data.patients) {
        try {
          const patient = await prisma.patient.upsert({
            where: { phone: p.phone },
            update: { name: p.name, email: p.email || null },
            create: {
              name: p.name,
              phone: p.phone,
              email: p.email || null,
              password: hashedPassword,
            },
          });

          // Record acquisition as Direct/Walkin
          await prisma.patientAcquisition.create({
            data: {
              hospitalId,
              patientId: patient.id,
              source: 'WALK_IN',
              converted: true,
            },
          });

          results.push(patient);
        } catch (e: any) {
          logger.error(
            { action: 'setup_import_patient_failed', phone: p.phone, error: e.message },
            'Failed to import patient',
          );
        }
      }

      return { count: results.length };
    },
  },
};
