import prisma from './prisma';

// Available Cities (Static for now)
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
        getCities: () => CITIES,

        getHospitals: async (city) => {
            const where = { status: 'APPROVED' };
            if (city) {
                where.city = { equals: city, mode: 'insensitive' };
            }
            return await prisma.hospital.findMany({ where });
        },

        getHospitalsByCity: async (city) => {
            if (!city) return [];
            return await prisma.hospital.findMany({
                where: {
                    city: { equals: city, mode: 'insensitive' },
                    status: 'APPROVED'
                }
            });
        },

        searchDoctors: async (city, speciality, query) => {
            // Search via Affiliations (Doctor at Hospital)
            const where = {
                isCurrent: true,
                hospital: { status: 'APPROVED' }
            };

            if (city) {
                where.hospital.city = { equals: city, mode: 'insensitive' };
            }

            if (speciality) {
                where.department = { equals: speciality, mode: 'insensitive' }; // Mapping department -> speciality
            }

            if (query) {
                where.OR = [
                    { doctor: { fullName: { contains: query, mode: 'insensitive' } } },
                    { department: { contains: query, mode: 'insensitive' } }
                ];
            }

            const affiliations = await prisma.doctorHospitalAffiliation.findMany({
                where,
                include: {
                    doctor: true,
                    hospital: true
                }
            });

            // Map to frontend-compatible format
            return affiliations.map(aff => ({
                id: aff.doctor.id, // DoctorMaster ID
                name: aff.doctor.fullName,
                speciality: aff.department || 'General',
                qualification: 'MBBS', // Placeholder, ideally from Registration
                experience: 10, // Placeholder
                fee: 500, // Placeholder
                hospital: aff.hospital,
                hospitalId: aff.hospitalId,
                image: aff.doctor.profilePhotoUrl
            }));
        },

        getDoctorById: async (id) => {
            const doc = await prisma.doctorMaster.findUnique({
                where: { id },
                include: {
                    affiliations: {
                        where: { isCurrent: true },
                        include: { hospital: true }
                    },
                    registration: true
                }
            });

            if (!doc) return null;

            // Use primary (first) affiliation for hospital context
            const primaryAff = doc.affiliations[0] || {};

            return {
                id: doc.id,
                name: doc.fullName,
                speciality: primaryAff.department || 'General',
                qualification: doc.registration?.degree || 'MBBS',
                experience: 10,
                fee: 500,
                hospital: primaryAff.hospital,
                affiliations: doc.affiliations // Expose all for profile if needed
            };
        },

        getHospitalById: async (id) => {
            return await prisma.hospital.findUnique({ where: { id } });
        },

        getAllSpecialities: async () => {
            // Get distinct departments from affiliations
            const affs = await prisma.doctorHospitalAffiliation.findMany({
                distinct: ['department'],
                select: { department: true },
                where: {
                    isCurrent: true,
                    hospital: { status: 'APPROVED' }
                }
            });
            return affs.map(a => a.department).filter(Boolean);
        },

        getHospitalDoctors: async (hospitalId) => {
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

        getHospitalReviews: async (hospitalId) => {
            return []; // Stub
        },
    },

    // --- Patient Services ---
    patient: {
        login: async (mobile, otp) => {
            if (otp !== '1234') return null;

            let patient = await prisma.patient.findUnique({ where: { phone: mobile } });
            if (!patient) {
                patient = await prisma.patient.create({
                    data: {
                        phone: mobile,
                        name: 'Guest User',
                        password: 'temp-password',
                        role: 'PATIENT'
                    }
                });
            }
            return patient;
        },

        register: async (data) => {
            // Check if patient exists
            let patient = await prisma.patient.findUnique({ where: { phone: data.mobile } });
            if (patient) return patient; // Or throw error?

            return await prisma.patient.create({
                data: {
                    phone: data.mobile,
                    name: data.name,
                    email: data.email,
                    city: data.city,
                    password: 'temp-password', // Schema requirement
                    role: 'PATIENT'
                    // Note: age, gender, bloodGroup are not in Patient model! 
                    // They might be in MedicalRecord or just missing. 
                    // For now, we store what we can. 
                    // To support age/gender, we need to add fields to Patient model or use Profile.
                    // User schema had dob/gender in DoctorMaster but not Patient? 
                    // Patient model: name, phone, email, city, role, abhaAddress. 
                    // No age/gender/bloodGroup.
                }
            });
        },

        updateProfile: async (id, updates) => {
            return await prisma.patient.update({
                where: { id },
                data: {
                    name: updates.name,
                    email: updates.email,
                    city: updates.city
                }
            });
        },

        getById: async (id) => {
            return await prisma.patient.findUnique({ where: { id } });
        },

        getVisits: async (patientId) => {
            return await prisma.appointment.findMany({
                where: { patientId },
                include: { doctor: true, visit: { include: { hospital: true } } },
                orderBy: { date: 'desc' }
            });
        },

        createVisit: async (hospitalId, data) => {
            const appointment = await prisma.appointment.create({
                data: {
                    patientId: data.patientId,
                    doctorId: data.doctorId, // DoctorMaster ID
                    date: new Date(data.date),
                    slot: data.time || "09:00 AM",
                    status: 'PENDING'
                }
            });
            return appointment;
        },

        cancelVisit: async () => null,

        getHospitalReviews: async (hospitalId) => {
            const reviews = await prisma.review.findMany({
                where: { hospitalId },
                include: { patient: true },
                orderBy: { createdAt: 'desc' }
            });
            return reviews.map(r => ({
                id: r.id,
                patientMobile: r.patient.phone || 'Anonymous',
                rating: r.rating,
                comment: r.comment,
                date: r.createdAt
            }));
        },
    }
};

