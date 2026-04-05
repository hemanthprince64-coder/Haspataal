import prisma from './prisma';
import logger from './logger';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Hospital, Doctor, Appointment, Review, UserRole, BookingStatus } from '../types';
import { PostVisitPipeline } from './ai/post-visit';
import { ConsultationAiEngine } from './ai/engine';

// Zod schemas for runtime validation
const HospitalArraySchema = z.array(z.any());
const DoctorArraySchema = z.array(z.any());

// Strip sensitive fields from any object (password, etc.)
function stripSensitive<T extends Record<string, any>>(obj: T | null): T | null {
    if (!obj) return null;
    const { password, ...safe } = obj as any;
    return safe as T;
}
function stripSensitiveArray<T extends Record<string, any>>(arr: T[]): T[] {
    return arr.map(item => stripSensitive(item)!);
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

        getHospitals: async (city?: string): Promise<Hospital[]> => {
            const where: any = { accountStatus: 'active' };
            if (city) {
                where.city = { equals: city, mode: 'insensitive' };
            }
            const data = stripSensitiveArray(await prisma.hospitalsMaster.findMany({ where }));

            // Runtime validation layer
            if (!Array.isArray(data)) throw new Error('getHospitals must return an array');

            return HospitalArraySchema.parse(data) as Hospital[];
        },

        getHospitalsByCity: async (city: string): Promise<Hospital[]> => {
            const data = stripSensitiveArray(await prisma.hospitalsMaster.findMany({
                where: {
                    city: { equals: city, mode: 'insensitive' },
                    accountStatus: 'active'
                }
            }));

            if (!Array.isArray(data)) throw new Error('getHospitalsByCity must return an array');
            return HospitalArraySchema.parse(data) as Hospital[];
        },

        searchDoctors: async (city?: string, speciality?: string, query?: string): Promise<Doctor[]> => {
            let hospitalIds: string[] = [];
            if (city) {
                const hospitals = await prisma.hospitalsMaster.findMany({
                    where: { city: { equals: city, mode: 'insensitive' }, accountStatus: 'active' },
                    select: { id: true }
                });
                hospitalIds = hospitals.map(h => h.id);
            }

            const where: any = {};
            if (city) {
                where.affiliations = {
                    some: {
                        hospitalId: { in: hospitalIds },
                        isCurrent: true
                    }
                };
            }

            if (speciality) {
                where.affiliations = {
                    ...where.affiliations,
                    some: {
                        ...where.affiliations?.some,
                        department: { equals: speciality, mode: 'insensitive' }
                    }
                };
            }

            if (query) {
                where.OR = [
                    { fullName: { contains: query, mode: 'insensitive' } }
                ];
            }

            const data = await prisma.doctorMaster.findMany({
                where,
                include: {
                    affiliations: { include: { hospital: true } }
                }
            });

            if (!Array.isArray(data)) throw new Error('searchDoctors must return an array');
            return DoctorArraySchema.parse(data) as Doctor[];
        },

        getDoctorsByHub: async (city: string, speciality: string): Promise<Doctor[]> => {
            const hospitals = await prisma.hospitalsMaster.findMany({
                where: { city: { equals: city, mode: 'insensitive' }, accountStatus: 'active' },
                select: { id: true }
            });
            const hospitalIds = hospitals.map(h => h.id);

            const data = await prisma.doctorMaster.findMany({
                where: {
                    accountStatus: 'ACTIVE',
                    affiliations: {
                        some: {
                            hospitalId: { in: hospitalIds },
                            department: { equals: speciality, mode: 'insensitive' },
                            isCurrent: true
                        }
                    }
                },
                include: {
                    affiliations: {
                        include: { hospital: true }
                    }
                }
            });

            return DoctorArraySchema.parse(data) as Doctor[];
        },

        getHubStats: async (city: string, speciality: string) => {
            const hospitals = await prisma.hospitalsMaster.findMany({
                where: { city: { equals: city, mode: 'insensitive' }, accountStatus: 'active' },
                select: { id: true }
            });
            const hospitalIds = hospitals.map(h => h.id);

            const count = await prisma.doctorMaster.count({
                where: {
                    accountStatus: 'ACTIVE',
                    affiliations: {
                        some: {
                            hospitalId: { in: hospitalIds },
                            department: { equals: speciality, mode: 'insensitive' },
                            isCurrent: true
                        }
                    }
                }
            });
            return { count };
        },

        getHubMetadata: async () => {
            const cities = await prisma.hospitalsMaster.findMany({
                where: { accountStatus: 'active' },
                select: { city: true },
                distinct: ['city']
            });
            
            const specialties = await prisma.doctorHospitalAffiliation.findMany({
                where: { isCurrent: true, hospital: { accountStatus: 'active' } },
                select: { department: true },
                distinct: ['department']
            });

            return {
                cities: cities.map(c => c.city).filter(Boolean) as string[],
                specialties: specialties.map(s => s.department).filter(Boolean) as string[]
            };
        },

        getDoctorById: async (id: string): Promise<Doctor | null> => {
            const doc = await prisma.doctorMaster.findUnique({
                where: { id },
                include: {
                    affiliations: { include: { hospital: true } },
                    reviews: true
                }
            });
            return stripSensitive(doc) as Doctor | null;
        },

        getHospitalById: async (id: string): Promise<Hospital | null> => {
            const hospital = await prisma.hospitalsMaster.findUnique({
                where: { id },
                include: {
                    facilities: true,
                    services: true,
                    departments: true
                }
            });
            return stripSensitive(hospital) as Hospital | null;
        },

        getAllSpecialities: async (): Promise<string[]> => {
            const affs = await prisma.doctorHospitalAffiliation.findMany({
                distinct: ['department'],
                select: { department: true },
                where: {
                    isCurrent: true,
                    hospital: { accountStatus: 'active' }
                }
            });
            return affs.map(a => a.department).filter((d): d is string => Boolean(d));
        },

        getHospitalDoctors: async (hospitalId: string): Promise<{ id: string; name: string; speciality: string; fee: number; }[]> => {
            const affiliations = await prisma.doctorHospitalAffiliation.findMany({
                where: { hospitalId, isCurrent: true },
                include: { doctor: true }
            });
            return affiliations.map(aff => ({
                id: aff.doctor.id,
                name: aff.doctor.fullName,
                speciality: aff.department || 'General',
                fee: 500
            }));
        },

        getHospitalReviews: async (hospitalId: string): Promise<Review[]> => {
            return [];
        },

        getHospitalStats: async (hospitalId: string) => {
            const [totalVisits, todayVisits, scheduledVisits] = await Promise.all([
                prisma.visit.count({ where: { hospitalId } }),
                prisma.visit.count({ where: { hospitalId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
                prisma.appointment.count({ where: { doctor: { affiliations: { some: { hospitalId } } }, status: 'CONFIRMED' } })
            ]);

            return {
                totalVisits,
                todayVisits,
                scheduledVisits,
                totalPatients: 0,
                totalDoctors: 0
            };
        },
    },

    // --- Patient Services ---
    patient: {
        requestOtp: async (mobile: string) => {
            const code = Math.floor(1000 + Math.random() * 9000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            await prisma.otpCode.upsert({
                where: { phone: mobile },
                update: { code, expiresAt },
                create: { phone: mobile, code, expiresAt }
            });

            logger.info({ action: 'otp_generated', mobile, code }, `DEMO: Use this code to login: ${code}`);
            return true;
        },

        login: async (mobile: string, otp: string) => {
            const otpRecord = await prisma.otpCode.findUnique({ where: { phone: mobile } });

            if (!otpRecord) throw new Error('OTP not requested for this number. Please request a new OTP.');
            if (otpRecord.code !== otp) throw new Error('Invalid OTP. Please try again.');
            if (new Date() > otpRecord.expiresAt) throw new Error('OTP has expired. Please request a new OTP.');

            // Prevent replay attacks
            await prisma.otpCode.delete({ where: { id: otpRecord.id } });

            let patient = await prisma.patient.findUnique({ where: { phone: mobile } });

            if (!patient) {
                logger.info({ action: 'patient_registration', mobile }, 'Auto-registering new patient during login');
                const hashedPassword = await bcrypt.hash(Math.random().toString(36), 12);
                patient = await prisma.patient.create({
                    data: {
                        phone: mobile,
                        name: 'New User',
                        password: hashedPassword
                    }
                });
            }
            logger.info({ action: 'patient_login', patientId: patient.id }, 'Patient logged in successfully');
            return {
                user: {
                    id: patient.id,
                    name: patient.name || 'Patient',
                    role: UserRole.PATIENT,
                    mobile: patient.phone
                }
            };
        },

        register: async (data: { mobile: string; name: string; password?: string; age?: string; gender?: string; bloodGroup?: string; city?: string; email?: string; }) => {
            logger.info({ action: 'patient_register', data }, 'Patient registering profile');
            if (!data.password) throw new Error("PASSWORD_REQUIRED");
            const hashedPassword = await bcrypt.hash(data.password, 12);
            const patient = await prisma.patient.upsert({
                where: { phone: data.mobile },
                update: {
                    name: data.name,
                    gender: data.gender,
                    bloodGroup: data.bloodGroup,
                    city: data.city,
                    email: data.email,
                    password: hashedPassword
                },
                create: {
                    phone: data.mobile,
                    name: data.name,
                    password: hashedPassword
                }
            });
            return {
                user: {
                    id: patient.id,
                    name: patient.name || 'Patient',
                    role: UserRole.PATIENT,
                    mobile: patient.phone
                }
            };
        },

        updateProfile: async (id: string, updates: any) => {
            return await prisma.patient.update({
                where: { id },
                data: updates
            });
        },

        getAvailableSlots: async (doctorId: string, date: string) => {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);

            const now = new Date();
            const isToday = targetDate.getTime() === new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            // Fetch existing bookings for this doctor on this date
            const existingBookings = await prisma.appointment.findMany({
                where: {
                    doctorId,
                    date: targetDate,
                    status: { in: [BookingStatus.BOOKED, BookingStatus.CONFIRMED] }
                },
                select: { slot: true }
            });

            const bookedSlots = new Set(existingBookings.map(b => b.slot));

            // Standard clinic hours: 09:00 to 17:00, 30-min intervals
            const allSlots = [
                '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
                '15:00', '15:30', '16:00', '16:30'
            ];

            return allSlots.map(time => {
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
                    available
                };
            });
        },

        createVisit: async (hospitalId: string, data: { patientMobile: string; patientName: string; doctorId: string; date: string; slot?: string; status?: any; }) => {
            logger.info({ action: 'create_booking_attempt', hospitalId, doctorId: data.doctorId, date: data.date, slot: data.slot }, 'Attempting transactional appointment booking');
            const targetDate = new Date(data.date);
            targetDate.setHours(0, 0, 0, 0);
            const targetSlot = data.slot || 'ONLINE';

            try {
                // ACID Transaction to prevent double booking race conditions
                const appointment = await prisma.$transaction(async (tx) => {
                    // 1. Ensure patient exists
                    const hashedPassword = await bcrypt.hash(Math.random().toString(36), 12);
                    const patient = await tx.patient.upsert({
                        where: { phone: data.patientMobile },
                        update: { name: data.patientName },
                        create: {
                            phone: data.patientMobile,
                            name: data.patientName,
                            password: hashedPassword
                        }
                    });

                    // 2. Check if slot is already taken in this transaction snapshot
                    const existing = await tx.appointment.findFirst({
                        where: {
                            doctorId: data.doctorId,
                            date: targetDate,
                            slot: targetSlot,
                            status: { in: [BookingStatus.BOOKED, BookingStatus.CONFIRMED] }
                        }
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
                            status: data.status || BookingStatus.BOOKED
                        }
                    });
                });

                logger.info({ action: 'booking_created', appointmentId: appointment.id }, 'Successfully booked appointment');
                return appointment;

            } catch (error: any) {
                // Handle Prisma unique constraint violation explicitly (P2002)
                if (error.code === 'P2002') {
                    logger.warn({ action: 'booking_conflict', doctorId: data.doctorId, slot: targetSlot }, 'Race condition double-booking prevented by Unique Constraint');
                    throw new Error('This slot was just booked by someone else. Please choose another.');
                }
                logger.error({ action: 'booking_transaction_failed', error: error.message }, 'Booking transaction failed');
                throw error;
            }
        },

        updateVisitStatus: async (visitId: string, patientId: string, newStatus: BookingStatus) => {
            const appointment = await prisma.appointment.findUnique({
                where: { id: visitId, patientId }
            });

            if (!appointment) throw new Error('Appointment not found');

            const current = appointment.status;

            // Strict State Machine Enforcement
            const validTransitions: Record<string, string[]> = {
                [BookingStatus.BOOKED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
                [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
                [BookingStatus.CANCELLED]: [],
                [BookingStatus.COMPLETED]: []
            };

            const allowed = validTransitions[current] || [];
            if (!allowed.includes(newStatus)) {
                logger.warn({ action: 'invalid_status_transition', visitId, current, newStatus }, 'Attempted invalid status transition');
                throw new Error(`Invalid state transition: Cannot move from ${current} to ${newStatus}`);
            }

            const updated = await prisma.appointment.update({
                where: { id: visitId },
                data: { status: newStatus }
            });

            logger.info({ action: 'status_transition', visitId, oldStatus: current, newStatus }, `Appointment status updated to ${newStatus}`);
            return updated;
        },

        cancelVisit: async (patientId: string, visitId: string) => {
            logger.info({ action: 'cancel_booking_attempt', patientId, visitId }, 'Attempting to cancel appointment');

            const visit = await prisma.appointment.findUnique({ where: { id: visitId } });
            if (!visit) throw new Error('Appointment not found');
            if (visit.patientId !== patientId) throw new Error('Unauthorized');

            const hrLimit = 6 * 60 * 60 * 1000;
            
            // Construct full Date by combining visit.date (Y-M-D) and visit.slot (H:m)
            const [hours, minutes] = (visit.slot || "09:00").split(':').map(Number);
            const appointmentTime = new Date(visit.date);
            appointmentTime.setHours(hours, minutes, 0, 0);

            if (appointmentTime.getTime() - Date.now() < hrLimit) {
                throw new Error(`Appointments cannot be cancelled within 6 hours of the scheduled time (${visit.slot})`);
            }

            // If the user previously paid for this appointment, process a refund
            if (visit.status === 'CONFIRMED' || visit.status === 'BOOKED') {
                await services.patient.addWalletTransaction(patientId, {
                    type: 'CREDIT',
                    amount: 500, // Assuming a flat 500 consultation fee for now
                    source: 'REFUND',
                    description: `Refund for cancelled appointment`
                });
            }

            // Delegate to the state machine to ensure it's a valid transition
            const cancelled = await services.patient.updateVisitStatus(visitId, patientId, BookingStatus.CANCELLED);

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
                            affiliations: true
                        }
                    },
                    patient: true
                },
                orderBy: { date: 'desc' }
            });
            return appointments.map(a => {
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
                    amountPaid: (a.status === 'CONFIRMED' || a.status === 'COMPLETED') ? 500 : 0,
                    hospitalId: a.hospitalId || '',
                    date: a.date,
                    slot: a.slot,
                    status: a.status,
                    patientId: a.patientId
                };
            });
        },

        // --- Family Members ---
        getFamilyMembers: async (patientId: string) => {
            return await prisma.familyMember.findMany({
                where: { patientId },
                orderBy: { createdAt: 'desc' }
            });
        },
        addFamilyMember: async (patientId: string, data: { name: string; relation: string; dob?: string; gender?: string; bloodGroup?: string }) => {
            return await prisma.familyMember.create({
                data: {
                    patientId,
                    name: data.name,
                    relation: data.relation,
                    dob: data.dob ? new Date(data.dob) : null,
                    gender: data.gender || null,
                    bloodGroup: data.bloodGroup || null
                }
            });
        },
        deleteFamilyMember: async (patientId: string, memberId: string) => {
            return await prisma.familyMember.deleteMany({
                where: { id: memberId, patientId }
            });
        },

        // --- Medical History ---
        getMedicalHistory: async (patientId: string) => {
            return await prisma.patientMedicalHistory.findUnique({
                where: { patientId }
            });
        },
        saveMedicalHistory: async (patientId: string, data: { chronicDiseases?: string; pastIllnesses?: string; surgeries?: string; allergies?: string; drugAllergies?: string; hospitalizations?: string }) => {
            return await prisma.patientMedicalHistory.upsert({
                where: { patientId },
                update: data,
                create: { patientId, ...data }
            });
        },

        // --- Medications ---
        getMedications: async (patientId: string) => {
            return await prisma.patientMedication.findMany({
                where: { patientId },
                orderBy: { createdAt: 'desc' }
            });
        },
        addMedication: async (patientId: string, data: { drugName: string; dose?: string; frequency?: string; startDate?: string }) => {
            return await prisma.patientMedication.create({
                data: {
                    patientId,
                    drugName: data.drugName,
                    dose: data.dose || null,
                    frequency: data.frequency || null,
                    startDate: data.startDate ? new Date(data.startDate) : null
                }
            });
        },
        deleteMedication: async (patientId: string, medicationId: string) => {
            return await prisma.patientMedication.deleteMany({
                where: { id: medicationId, patientId }
            });
        },

        // --- Vitals ---
        getVitals: async (patientId: string) => {
            return await prisma.vitalRecord.findMany({
                where: { patientId },
                orderBy: { recordedAt: 'desc' },
                take: 20
            });
        },
        addVital: async (patientId: string, data: { weight?: number; height?: number; bloodPressure?: string; pulse?: number; bloodSugar?: number; spo2?: number; temperature?: number }) => {
            const bmi = data.weight && data.height ? parseFloat((data.weight / ((data.height / 100) ** 2)).toFixed(1)) : null;
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
                    temperature: data.temperature ?? null
                }
            });
        },

        // --- Vaccinations ---
        getVaccinations: async (patientId: string) => {
            return await prisma.vaccinationRecord.findMany({
                where: { patientId },
                orderBy: { createdAt: 'desc' }
            });
        },
        addVaccination: async (patientId: string, data: { vaccineName: string; dateGiven?: string; nextDueDate?: string }) => {
            return await prisma.vaccinationRecord.create({
                data: {
                    patientId,
                    vaccineName: data.vaccineName,
                    dateGiven: data.dateGiven ? new Date(data.dateGiven) : null,
                    nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null
                }
            });
        },

        // --- Pregnancy Profile ---
        getPregnancyProfile: async (patientId: string) => {
            return await prisma.pregnancyProfile.findUnique({
                where: { patientId }
            });
        },
        savePregnancyProfile: async (patientId: string, data: { lmp?: string; edd?: string; gestationalAge?: number; highRisk?: boolean; ancVisits?: number; dangerSigns?: string; deliveryPlan?: string }) => {
            return await prisma.pregnancyProfile.upsert({
                where: { patientId },
                update: {
                    lmp: data.lmp ? new Date(data.lmp) : undefined,
                    edd: data.edd ? new Date(data.edd) : undefined,
                    gestationalAge: data.gestationalAge,
                    highRisk: data.highRisk,
                    ancVisits: data.ancVisits,
                    dangerSigns: data.dangerSigns,
                    deliveryPlan: data.deliveryPlan
                },
                create: {
                    patientId,
                    lmp: data.lmp ? new Date(data.lmp) : null,
                    edd: data.edd ? new Date(data.edd) : null,
                    gestationalAge: data.gestationalAge,
                    highRisk: data.highRisk ?? false,
                    ancVisits: data.ancVisits,
                    dangerSigns: data.dangerSigns,
                    deliveryPlan: data.deliveryPlan
                }
            });
        },

        // --- Insurance ---
        getInsurance: async (patientId: string) => {
            return await prisma.insuranceDetail.findMany({
                where: { patientId },
                orderBy: { createdAt: 'desc' }
            });
        },
        saveInsurance: async (patientId: string, data: { id?: string; company: string; policyNumber?: string; coverageAmount?: number; expiryDate?: string }) => {
            if (data.id) {
                return await prisma.insuranceDetail.update({
                    where: { id: data.id },
                    data: {
                        company: data.company,
                        policyNumber: data.policyNumber || null,
                        coverageAmount: data.coverageAmount ?? null,
                        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null
                    }
                });
            }
            return await prisma.insuranceDetail.create({
                data: {
                    patientId,
                    company: data.company,
                    policyNumber: data.policyNumber || null,
                    coverageAmount: data.coverageAmount ?? null,
                    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null
                }
            });
        },
        deleteInsurance: async (patientId: string, insuranceId: string) => {
            return await prisma.insuranceDetail.deleteMany({
                where: { id: insuranceId, patientId }
            });
        },

        // --- Addresses ---
        getAddresses: async (patientId: string) => {
            return await prisma.patientAddress.findMany({
                where: { patientId },
                orderBy: { createdAt: 'desc' }
            });
        },
        addAddress: async (patientId: string, data: { type?: string; address: string; city: string; state?: string; pincode: string; landmark?: string; isDefault?: boolean }) => {
            if (data.isDefault) {
                await prisma.patientAddress.updateMany({
                   where: { patientId, isDefault: true },
                   data: { isDefault: false }
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
                    isDefault: data.isDefault || false
                }
            });
        },
        deleteAddress: async (patientId: string, addressId: string) => {
            return await prisma.patientAddress.deleteMany({
                where: { id: addressId, patientId }
            });
        },
        setDefaultAddress: async (patientId: string, addressId: string) => {
            await prisma.patientAddress.updateMany({
                where: { patientId, isDefault: true },
                data: { isDefault: false }
            });
            return await prisma.patientAddress.update({
                where: { id: addressId },
                data: { isDefault: true }
            });
        },

        // --- Wallet ---
        getWallet: async (patientId: string) => {
            let wallet = await prisma.wallet.findUnique({
                where: { patientId },
                include: {
                    transactions: { orderBy: { createdAt: 'desc' }, take: 10 }
                }
            });
            if (!wallet) {
                wallet = await prisma.wallet.create({
                    data: { patientId, balance: 0.0 },
                    include: { transactions: true }
                });
            }
            return {
                ...wallet,
                balance: wallet.balance.toNumber(),
                transactions: wallet.transactions.map(t => ({
                    ...t,
                    amount: t.amount.toNumber()
                }))
            };
        },
        addWalletTransaction: async (patientId: string, data: { type: string; amount: number; source: string; description?: string }) => {
            return await prisma.$transaction(async (tx) => {
                const wallet = await tx.wallet.upsert({
                    where: { patientId },
                    update: { balance: data.type === 'CREDIT' ? { increment: data.amount } : { decrement: data.amount } },
                    create: { patientId, balance: data.type === 'CREDIT' ? data.amount : 0 }
                });

                await tx.walletTransaction.create({
                    data: {
                        walletId: wallet.id,
                        type: data.type,
                        amount: data.amount,
                        source: data.source,
                        description: data.description || null
                    }
                });

                return wallet;
            });
        },

        // --- Prescriptions ---
        getPrescriptions: async (patientId: string) => {
            return await prisma.patientPrescription.findMany({
                where: { patientId },
                include: { items: true, doctor: { select: { fullName: true } } },
                orderBy: { createdAt: 'desc' }
            });
        },
        addStructuredPrescription: async (patientId: string, data: { doctorId?: string; appointmentId?: string; notes?: string; items: { medicineName: string; dosage: string; duration: string; instructions?: string }[] }) => {
            return await prisma.patientPrescription.create({
                data: {
                    patientId,
                    doctorId: data.doctorId || null,
                    appointmentId: data.appointmentId || null,
                    type: 'STRUCTURED',
                    notes: data.notes || null,
                    items: {
                        create: data.items.map(i => ({
                            medicineName: i.medicineName,
                            dosage: i.dosage,
                            duration: i.duration,
                            instructions: i.instructions || null
                        }))
                    }
                },
                include: { items: true }
            });
        },
        uploadPrescriptionFile: async (patientId: string, data: { doctorId?: string; appointmentId?: string; fileUrl: string; notes?: string }) => {
            return await prisma.patientPrescription.create({
                data: {
                    patientId,
                    doctorId: data.doctorId || null,
                    appointmentId: data.appointmentId || null,
                    type: 'FILE',
                    fileUrl: data.fileUrl,
                    notes: data.notes || null
                }
            });
        }
    },

    // --- Hospital Specific ---
    hospital: {
        getStats: async (hospitalId: string) => {
            const [totalVisits, todayVisits, scheduledVisits] = await Promise.all([
                prisma.visit.count({ where: { hospitalId } }),
                prisma.visit.count({ where: { hospitalId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
                prisma.appointment.count({ where: { doctor: { affiliations: { some: { hospitalId } } }, status: 'CONFIRMED' } })
            ]);

            return {
                totalVisits,
                todayVisits,
                scheduledVisits,
                totalPatients: await prisma.visit.groupBy({ by: ['patientPhone'], where: { hospitalId } }).then(res => res.length),
                totalDoctors: await prisma.doctorHospitalAffiliation.count({ where: { hospitalId, isCurrent: true } }),
                completedVisits: 0,
                cancelledVisits: 0,
            };
        },

        getVisits: async (hospitalId: string) => {
            return await prisma.visit.findMany({
                where: { hospitalId },
                include: { 
                    aiSummary: true,
                    appointment: { include: { doctor: true, patient: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        },

        completeVisit: async (hospitalId: string, visitId: string, notes: string) => {
            logger.info({ action: 'hospital_complete_visit', hospitalId, visitId }, 'Completing visit with AI processing');
            
            // 1. Update visit with initial notes (stored in diagnosis for now)
            const visit = await prisma.visit.update({
                where: { id: visitId, hospitalId },
                data: { diagnosis: notes }
            });

            // 2. Trigger Post-Visit AI Pipeline
            await services.ai.processVisit(visitId, notes);

            return visit;
        },

        getPatients: async (hospitalId: string) => {
            const visits = await prisma.visit.findMany({
                where: { hospitalId },
                select: { patientName: true, patientPhone: true }
            });
            const uniqueMap = new Map();
            visits.forEach(v => uniqueMap.set(v.patientPhone, v));
            return Array.from(uniqueMap.values()).map((v, i) => ({
                id: i.toString(),
                name: v.patientName || 'Unknown',
                mobile: v.patientPhone
            }));
        },

        getDoctors: async (hospitalId: string) => {
            const affiliations = await prisma.doctorHospitalAffiliation.findMany({
                where: { hospitalId, isCurrent: true },
                include: { doctor: true }
            });
            return affiliations.map(a => ({
                id: a.doctor.id,
                name: a.doctor.fullName,
                speciality: a.department || '',
                mobile: a.doctor.mobile,
                role: a.role,
                fee: 500
            }));
        },

        getPendingDoctors: async (hospitalId: string) => {
            const affiliations = await prisma.doctorHospitalAffiliation.findMany({
                where: { hospitalId, verificationStatus: 'PENDING' },
                include: { doctor: true }
            });
            return affiliations.map(a => ({
                id: a.doctor.id,
                name: a.doctor.fullName,
                speciality: a.department || '',
                mobile: a.doctor.mobile,
                role: a.role,
                schedule: a.schedule
            }));
        },

        approveDoctorAffiliation: async (hospitalId: string, doctorId: string) => {
            return await prisma.doctorHospitalAffiliation.updateMany({
                where: { hospitalId, doctorId },
                data: { verificationStatus: 'VERIFIED', isCurrent: true, approvedAt: new Date() }
            });
        },

        rejectDoctorAffiliation: async (hospitalId: string, doctorId: string) => {
            return await prisma.doctorHospitalAffiliation.updateMany({
                where: { hospitalId, doctorId },
                data: { verificationStatus: 'REJECTED', isCurrent: false }
            });
        },

        getPatientById: async (hospitalId: string, patientId: string) => {
            // Look up patient from visit records for this hospital
            const visit = await prisma.visit.findFirst({
                where: { hospitalId, id: patientId }
            });
            if (visit) {
                return { name: visit.patientName, mobile: visit.patientPhone };
            }
            // Fall back to finding the patient by ID
            const patient = await prisma.patient.findUnique({ where: { id: patientId } });
            return patient ? { name: patient.name, mobile: patient.phone } : null;
        },

        getDiagnosticCatalog: async (hospitalId: string) => {
            return await prisma.hospitalDiagnosticPricing.findMany({
                where: { hospitalId },
                include: { test: { include: { category: true } } }
            });
        },

        getLabOrders: async (hospitalId: string) => {
            return await prisma.diagnosticOrder.findMany({
                where: { hospitalId },
                include: { patient: true },
                orderBy: { createdAt: 'desc' }
            });
        },

        login: async (mobile: string, password?: string) => {
            if (!password) throw new Error("PASSWORD_REQUIRED");
            const hospital = await prisma.hospitalsMaster.findFirst({
                where: { contactNumber: mobile }
            });
            // legacy plain text password check for hospital login prototype
            if (hospital && (hospital as any).password && await bcrypt.compare(password, (hospital as any).password)) {
                logger.info({ action: 'hospital_login', hospitalId: hospital.id }, 'Hospital logged in successfully');
                return {
                    user: {
                        id: hospital.id,
                        name: hospital.legalName || (hospital as any).name,
                        role: UserRole.HOSPITAL_ADMIN,
                        hospitalId: hospital.id
                    }
                };
            }
            logger.warn({ action: 'hospital_login_failed', mobile }, 'Failed hospital login attempt');
            return null;
        },

        register: async (data: { hospitalName: string; city: string; adminName: string; mobile: string; password?: string; registrationNumber?: string; }) => {
            logger.info({ action: 'hospital_register', hospitalName: data.hospitalName }, 'Registering new hospital');
            if (!data.password) throw new Error("PASSWORD_REQUIRED");
            const hashedPassword = await bcrypt.hash(data.password, 12);

            return await prisma.$transaction(async (tx) => {
                // Generate a random registration number if not provided
                const regNumber = data.registrationNumber || `REG-${Date.now()}`;

                // 1. Create Hospital
                const hospital = await tx.hospitalsMaster.create({
                    data: {
                        legalName: data.hospitalName,
                        registrationNumber: regNumber,
                        city: data.city,
                        contactNumber: data.mobile,
                        verificationStatus: 'pending',
                        accountStatus: 'inactive',
                        password: hashedPassword
                    }
                });

                // 2. Add Primary Admin
                await tx.hospitalAdmin.create({
                    data: {
                        hospitalId: hospital.id,
                        fullName: data.adminName,
                        mobile: data.mobile,
                        email: `${data.mobile}@example.com`,
                        isPrimary: true,
                        verificationStatus: 'pending'
                    }
                });

                return hospital;
            });
        },

        registerLab: async (data: { labName: string; city: string; adminName: string; mobile: string; password?: string; registrationNumber?: string; }) => {
            logger.info({ action: 'lab_register', labName: data.labName }, 'Registering new diagnostic lab');
            if (!data.password) throw new Error("PASSWORD_REQUIRED");
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
                        password: hashedPassword,
                        type: 'DIAGNOSTIC_CENTER'
                    }
                });

                await tx.hospitalAdmin.create({
                    data: {
                        hospitalId: lab.id,
                        fullName: data.adminName,
                        mobile: data.mobile,
                        email: `${data.mobile}@example.com`,
                        isPrimary: true,
                        verificationStatus: 'pending'
                    }
                });

                return lab;
            });
        },

        createVisit: async (hospitalId: string, data: { patientMobile: string; patientName: string; doctorId?: string; date: string; }) => {
            logger.info({ action: 'hospital_create_visit', hospitalId, doctorId: data.doctorId }, 'Hospital staff creating new visit');
            const hashedPassword = await bcrypt.hash(Math.random().toString(36), 12);
            const patient = await prisma.patient.upsert({
                where: { phone: data.patientMobile },
                update: { name: data.patientName },
                create: {
                    phone: data.patientMobile,
                    name: data.patientName,
                    password: hashedPassword
                }
            });

            if (data.doctorId) {
                await prisma.appointment.create({
                    data: {
                        patientId: patient.id,
                        doctorId: data.doctorId,
                        date: new Date(data.date),
                        slot: 'OPD',
                        status: 'COMPLETED'
                    }
                });
            }

            return await prisma.visit.create({
                data: {
                    hospitalId,
                    patientName: data.patientName,
                    patientPhone: data.patientMobile,
                    diagnosis: 'OPD Visit',
                    amount: 500
                }
            });
        },

        addDoctor: async (hospitalId: string, data: { name: string; mobile: string; schedule?: string; qualifications?: string; }) => {
            return await prisma.doctorMaster.create({
                data: {
                    fullName: data.name,
                    mobile: data.mobile,
                    email: `${data.mobile}@example.com`,
                    registration: {
                        create: {
                            registrationNumber: `HOSP-${Date.now()}`,
                            councilName: 'Hospital Added',
                            degree: data.qualifications
                        }
                    },
                    affiliations: {
                        create: {
                            hospitalId,
                            role: 'DOCTOR',
                            isCurrent: true,
                            schedule: data.schedule
                        }
                    }
                }
            });
        },

        removeDoctor: async (hospitalId: string, doctorId: string) => {
            return await prisma.doctorHospitalAffiliation.deleteMany({
                where: {
                    hospitalId,
                    doctorId
                }
            });
        }
    },

    // --- Doctor Specific ---
    doctor: {
        register: async (data: { fullName: string; mobile: string; email: string; password?: string; registrationNumber: string; councilName: string; }) => {
            logger.info({ action: 'doctor_register', mobile: data.mobile }, 'Self-registering new doctor');
            if (!data.password) throw new Error("PASSWORD_REQUIRED");
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
                                verificationStatus: 'PENDING'
                            }
                        }
                    }
                });
                return doctor;
            });
        },
    },

    // --- Admin Services ---
    admin: {
        getPlatformStats: async () => {
            return {
                totalHospitals: await prisma.hospitalsMaster.count(),
                verifiedHospitals: await prisma.hospitalsMaster.count({ where: { verificationStatus: 'verified' } }),
                totalDoctors: await prisma.doctorMaster.count(),
                totalPatients: await prisma.patient.count()
            };
        },

        login: async (username: string, password?: string) => {
            const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
            const adminUser = process.env.ADMIN_USERNAME || 'admin';
            if (username === adminUser && password === adminPass) {
                logger.info({ action: 'admin_login', username }, 'Admin logged in successfully');
                return {
                    user: {
                        id: 'admin',
                        role: UserRole.PLATFORM_ADMIN,
                        name: 'Platform Admin'
                    }
                };
            }
            logger.warn({ action: 'admin_login_failed', username }, 'Failed admin login attempt');
            return null;
        },

        getPendingHospitals: async (): Promise<Hospital[]> => {
            const data = await prisma.hospitalsMaster.findMany({ where: { verificationStatus: 'pending' } });
            if (!Array.isArray(data)) throw new Error('getPendingHospitals must return an array');
            return HospitalArraySchema.parse(data) as Hospital[];
        },

        getAllHospitals: async (): Promise<Hospital[]> => {
            const data = await prisma.hospitalsMaster.findMany();
            if (!Array.isArray(data)) throw new Error('getAllHospitals must return an array');
            return HospitalArraySchema.parse(data) as Hospital[];
        },

        approveHospital: async (id: string) => {
            logger.info({ action: 'approve_hospital', hospitalId: id }, 'Admin approving hospital');
            return await prisma.hospitalsMaster.update({
                where: { id },
                data: { verificationStatus: 'verified', accountStatus: 'active' }
            });
        },

        rejectHospital: async (id: string) => {
            logger.info({ action: 'reject_hospital', hospitalId: id }, 'Admin rejecting hospital');
            return await prisma.hospitalsMaster.update({
                where: { id },
                data: { verificationStatus: 'rejected', accountStatus: 'inactive' }
            });
        },

        suspendHospital: async (id: string) => {
            logger.info({ action: 'suspend_hospital', hospitalId: id }, 'Admin suspending hospital');
            return await prisma.hospitalsMaster.update({
                where: { id },
                data: { accountStatus: 'suspended' }
            });
        },

    },

    // --- Agent Services ---
    agent: {
        register: async (data: { fullName: string; mobile: string; email: string; password?: string; area?: string; city?: string; state?: string; }) => {
            logger.info({ action: 'agent_register', mobile: data.mobile }, 'Registering new agent');
            if (!data.password) throw new Error("PASSWORD_REQUIRED");
            const hashedPassword = await bcrypt.hash(data.password, 12);

            return await prisma.agent.create({
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
                    commissionRate: 5.0
                }
            });
        },

        login: async (mobile: string, password?: string) => {
            if (!password) throw new Error("PASSWORD_REQUIRED");
            const agent = await prisma.agent.findFirst({
                where: { mobile }
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
                    role: 'AGENT',
                    name: agent.fullName,
                    mobile: agent.mobile,
                    status: agent.accountStatus
                }
            };
        },

        getDashboardData: async (agentId: string) => {
            const hospitals = await prisma.hospitalsMaster.findMany({
                where: { agentId },
                select: {
                    id: true,
                    legalName: true,
                    verificationStatus: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' }
            });

            const patients = await prisma.patient.findMany({
                where: { agentId },
                select: {
                    id: true,
                    name: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return {
                hospitals,
                patients,
                stats: {
                    totalHospitals: hospitals.length,
                    approvedHospitals: hospitals.filter(h => h.verificationStatus === 'VERIFIED').length,
                    totalPatients: patients.length
                }
            };
        }
    },

    // --- AI Services ---
    ai: {
        processVisit: async (visitId: string, notes: string, imageData?: { mimeType: string; data: string }) => {
            logger.info({ action: 'process_visit_advanced_ai', visitId }, 'Starting advanced post-consultation AI processing');
            
            // 1. Get visit & patient context
            const visit = await prisma.visit.findUnique({
                where: { id: visitId },
                include: { 
                    appointment: { include: { patient: true, doctor: true } }
                }
            });

            if (!visit) throw new Error('Visit not found');

            const patient = visit.appointment?.patient;
            const patientAge = patient ? (new Date().getFullYear() - (patient.dob ? new Date(patient.dob).getFullYear() : 30)) : undefined;

            // 2. Trigger Advanced AI Engine
            const careJourney = await ConsultationAiEngine.process({
                visitId,
                clinicalNotes: notes,
                prescriptionImage: imageData,
                patientProfile: {
                    age: patientAge,
                    language: "English/Hindi" // Default for now
                }
            });

            // 3. Save raw notes for audit
            await prisma.visitNote.create({
                data: { visitId, content: notes, type: imageData ? 'OCR+NOTE' : 'CLINICAL_NOTE' }
            });

            logger.info({ action: 'process_visit_ai_complete', visitId }, 'Advanced Care Journey generated');
            return careJourney;
        },

        getVisitAnalysis: async (visitId: string) => {
            return await prisma.careJourney.findUnique({
                where: { visitId },
                include: { 
                    visit: { 
                        include: { 
                            observations: true ,
                            appointment: { include: { doctor: true } }
                        } 
                    },
                    medications: true,
                    followUp: true,
                    redFlags: true
                }
            });
        }
    }
};
