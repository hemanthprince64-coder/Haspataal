import prisma from './prisma';
import logger from './logger';
import { z } from 'zod';
import { Hospital, Doctor, Appointment, Review, UserRole, BookingStatus } from '../types';

// Zod schemas for runtime validation
const HospitalArraySchema = z.array(z.any());
const DoctorArraySchema = z.array(z.any());

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
            const data = await prisma.hospital.findMany({ where });

            // Runtime validation layer
            if (!Array.isArray(data)) throw new Error('getHospitals must return an array');

            return HospitalArraySchema.parse(data) as Hospital[];
        },

        getHospitalsByCity: async (city: string): Promise<Hospital[]> => {
            const data = await prisma.hospital.findMany({
                where: {
                    city: { equals: city, mode: 'insensitive' },
                    accountStatus: 'active'
                }
            });

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
            return (await prisma.doctorMaster.findUnique({
                where: { id },
                include: {
                    affiliations: { include: { hospital: true } },
                    reviews: true
                }
            })) as Doctor | null;
        },

        getHospitalById: async (id: string): Promise<Hospital | null> => {
            return (await prisma.hospital.findUnique({
                where: { id },
                include: {
                    facilities: true,
                    services: true,
                    departments: true
                }
            })) as Hospital | null;
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
                patient = await prisma.patient.create({
                    data: {
                        phone: mobile,
                        name: 'New User',
                        password: 'password123'
                    }
                });
            }
            logger.info({ action: 'patient_login', patientId: patient.id }, 'Patient logged in successfully');
            return patient;
        },

        register: async (data: { mobile: string; name: string; age?: string; gender?: string; bloodGroup?: string; city?: string; email?: string; }) => {
            logger.info({ action: 'patient_register', data }, 'Patient registering profile');
            return await prisma.patient.upsert({
                where: { phone: data.mobile },
                update: {
                    name: data.name,
                    gender: data.gender,
                    bloodGroup: data.bloodGroup,
                    city: data.city,
                    email: data.email
                },
                create: {
                    phone: data.mobile,
                    name: data.name,
                    password: 'password123'
                }
            });
        },

        updateProfile: async (id: string, updates: any) => {
            return await prisma.patient.update({
                where: { id },
                data: updates
            });
        },

        createVisit: async (hospitalId: string, data: { patientMobile: string; patientName: string; doctorId: string; date: string; }) => {
            logger.info({ action: 'create_booking', hospitalId, doctorId: data.doctorId }, 'Creating new appointment booking');

            const patient = await prisma.patient.upsert({
                where: { phone: data.patientMobile },
                update: { name: data.patientName },
                create: {
                    phone: data.patientMobile,
                    name: data.patientName,
                    password: 'password123'
                }
            });

            const appointment = await prisma.appointment.create({
                data: {
                    patientId: patient.id,
                    doctorId: data.doctorId,
                    date: new Date(data.date),
                    slot: 'ONLINE',
                    status: 'PENDING'
                }
            });

            return appointment;
        },

        cancelVisit: async (patientId: string, visitId: string) => {
            logger.info({ action: 'cancel_booking', patientId, visitId }, 'Cancelling appointment booking');
            return await prisma.appointment.update({
                where: { id: visitId, patientId },
                data: { status: 'CANCELLED' }
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

        login: async (mobile: string, password?: string) => {
            const hospital = await prisma.hospital.findFirst({
                where: { contactNumber: mobile }
            });
            // legacy plain text password check for hospital login prototype
            if (hospital && (hospital as any).password === password) {
                logger.info({ action: 'hospital_login', hospitalId: hospital.id }, 'Hospital logged in successfully');
                return {
                    id: hospital.id,
                    name: hospital.legalName || (hospital as any).name,
                    role: UserRole.HOSPITAL_ADMIN,
                    hospitalId: hospital.id
                };
            }
            logger.warn({ action: 'hospital_login_failed', mobile }, 'Failed hospital login attempt');
            return null;
        },

        createVisit: async (hospitalId: string, data: { patientMobile: string; patientName: string; doctorId?: string; date: string; }) => {
            logger.info({ action: 'hospital_create_visit', hospitalId, doctorId: data.doctorId }, 'Hospital staff creating new visit');
            const patient = await prisma.patient.upsert({
                where: { phone: data.patientMobile },
                update: { name: data.patientName },
                create: {
                    phone: data.patientMobile,
                    name: data.patientName,
                    password: 'password123'
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

        addDoctor: async (hospitalId: string, data: { name: string; mobile: string; }) => {
            return await prisma.doctorMaster.create({
                data: {
                    fullName: data.name,
                    mobile: data.mobile,
                    email: `${data.mobile}@example.com`,
                    affiliations: {
                        create: {
                            hospitalId,
                            role: 'DOCTOR',
                            isCurrent: true
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
            if (username === 'admin' && password === 'admin123') {
                logger.info({ action: 'admin_login', username }, 'Admin logged in successfully');
                return { id: 'admin', role: UserRole.PLATFORM_ADMIN, name: 'Platform Admin' };
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
        }
    }
};
