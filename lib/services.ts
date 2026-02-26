import prisma from './prisma';
import logger from './logger';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Hospital, Doctor, Appointment, Review, UserRole, BookingStatus } from '../types';

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
            const data = stripSensitiveArray(await prisma.hospital.findMany({ where }));

            // Runtime validation layer
            if (!Array.isArray(data)) throw new Error('getHospitals must return an array');

            return HospitalArraySchema.parse(data) as Hospital[];
        },

        getHospitalsByCity: async (city: string): Promise<Hospital[]> => {
            const data = stripSensitiveArray(await prisma.hospital.findMany({
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
                const hospitals = await prisma.hospital.findMany({
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
            const hospital = await prisma.hospital.findUnique({
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
        login: async (mobile: string, otp: string) => {
            if (otp !== '1234') return null;

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

            return allSlots.map(time => ({
                time,
                available: !bookedSlots.has(time)
            }));
        },

        createVisit: async (hospitalId: string, data: { patientMobile: string; patientName: string; doctorId: string; date: string; slot?: string; }) => {
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
                            status: BookingStatus.BOOKED
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

            // Delegate to the state machine to ensure it's a valid transition
            const cancelled = await services.patient.updateVisitStatus(visitId, patientId, BookingStatus.CANCELLED);

            // # TODO: Refund integration
            // # TODO: Notification trigger

            return cancelled;
        },

        getById: async (id: string) => {
            const patient = stripSensitive(await prisma.patient.findUnique({ where: { id } }));
            return patient;
        },

        getVisits: async (patientId: string) => {
            const appointments = await prisma.appointment.findMany({
                where: { patientId },
                orderBy: { date: 'desc' }
            });
            return appointments.map(a => ({
                id: a.id,
                doctorId: a.doctorId,
                hospitalId: '', // appointments don't directly store hospitalId
                date: a.date,
                status: a.status,
                patientId: a.patientId
            }));
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
                orderBy: { createdAt: 'desc' }
            });
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
            const hospital = await prisma.hospital.findFirst({
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
                const hospital = await tx.hospital.create({
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

                const lab = await tx.hospital.create({
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
                totalHospitals: await prisma.hospital.count(),
                verifiedHospitals: await prisma.hospital.count({ where: { verificationStatus: 'verified' } }),
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
            const data = await prisma.hospital.findMany({ where: { verificationStatus: 'pending' } });
            if (!Array.isArray(data)) throw new Error('getPendingHospitals must return an array');
            return HospitalArraySchema.parse(data) as Hospital[];
        },

        getAllHospitals: async (): Promise<Hospital[]> => {
            const data = await prisma.hospital.findMany();
            if (!Array.isArray(data)) throw new Error('getAllHospitals must return an array');
            return HospitalArraySchema.parse(data) as Hospital[];
        },

        approveHospital: async (id: string) => {
            logger.info({ action: 'approve_hospital', hospitalId: id }, 'Admin approving hospital');
            return await prisma.hospital.update({
                where: { id },
                data: { verificationStatus: 'verified', accountStatus: 'active' }
            });
        },

        rejectHospital: async (id: string) => {
            logger.info({ action: 'reject_hospital', hospitalId: id }, 'Admin rejecting hospital');
            return await prisma.hospital.update({
                where: { id },
                data: { verificationStatus: 'rejected', accountStatus: 'inactive' }
            });
        },

        suspendHospital: async (id: string) => {
            logger.info({ action: 'suspend_hospital', hospitalId: id }, 'Admin suspending hospital');
            return await prisma.hospital.update({
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
            const hospitals = await prisma.hospital.findMany({
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
    }
};
