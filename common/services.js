import { db, CITIES, saveDb } from './data';

export const services = {
    // --- Platform Services ---
    platform: {
        getCities: () => CITIES,

        getHospitals: (city) => {
            let hospitals = db.hospitals.filter(h => h.status === 'ACTIVE');
            if (city) {
                hospitals = hospitals.filter(h => h.city.toLowerCase() === city.toLowerCase());
            }
            return hospitals;
        },

        getHospitalsByCity: (city) => {
            return db.hospitals.filter(h => h.city.toLowerCase() === city.toLowerCase() && h.status === 'ACTIVE');
        },

        searchDoctors: (city, speciality, query) => {
            let hospitalIds = db.hospitals.filter(h => h.status === 'ACTIVE');
            if (city) {
                hospitalIds = hospitalIds.filter(h => h.city.toLowerCase() === city.toLowerCase());
            }
            hospitalIds = hospitalIds.map(h => h.id);

            let doctors = db.users.filter(u => u.role === 'DOCTOR' && hospitalIds.includes(u.hospitalId));
            if (speciality) {
                doctors = doctors.filter(u => u.speciality === speciality);
            }
            // Search by name
            if (query) {
                const q = query.toLowerCase();
                doctors = doctors.filter(u =>
                    u.name.toLowerCase().includes(q) ||
                    (u.speciality && u.speciality.toLowerCase().includes(q))
                );
            }
            return doctors;
        },

        getDoctorById: (id) => db.users.find(u => u.id === id && u.role === 'DOCTOR'),

        getHospitalById: (id) => db.hospitals.find(h => h.id === id),

        getDoctorCount: (city) => {
            const hospitalIds = db.hospitals.filter(h => h.city.toLowerCase() === city.toLowerCase() && h.status === 'ACTIVE').map(h => h.id);
            return db.users.filter(u => u.role === 'DOCTOR' && hospitalIds.includes(u.hospitalId)).length;
        },

        getHospitalCount: (city) => {
            return db.hospitals.filter(h => h.city.toLowerCase() === city.toLowerCase() && h.status === 'ACTIVE').length;
        },

        getAllSpecialities: () => {
            return [...new Set(db.users.filter(u => u.role === 'DOCTOR' && u.speciality).map(u => u.speciality))];
        },

        getHospitalDoctors: (hospitalId) => {
            return db.users.filter(u => u.role === 'DOCTOR' && u.hospitalId === hospitalId);
        },

        getHospitalReviews: (hospitalId) => {
            return db.reviews ? db.reviews.filter(r => r.hospitalId === hospitalId) : [];
        },
    },

    // --- Hospital Services (Scoped) ---
    hospital: {
        getStats: (hospitalId) => {
            if (!hospitalId) throw new Error("Hospital ID Required");
            const visits = db.visits.filter(v => v.hospitalId === hospitalId);
            const patients = db.hospitalPatients.filter(p => p.hospitalId === hospitalId);
            const doctors = db.users.filter(u => u.role === 'DOCTOR' && u.hospitalId === hospitalId);
            const todayStr = new Date().toISOString().split('T')[0];
            const todayVisits = visits.filter(v => v.date && v.date.startsWith(todayStr));
            const scheduledVisits = visits.filter(v => v.status === 'SCHEDULED');
            return {
                totalVisits: visits.length,
                totalPatients: patients.length,
                totalDoctors: doctors.length,
                todayVisits: todayVisits.length,
                scheduledVisits: scheduledVisits.length,
                completedVisits: visits.filter(v => v.status === 'COMPLETED').length,
                cancelledVisits: visits.filter(v => v.status === 'CANCELLED').length,
            };
        },

        getDoctors: (hospitalId) => {
            return db.users.filter(u => u.role === 'DOCTOR' && u.hospitalId === hospitalId);
        },

        addDoctor: (hospitalId, doctorData) => {
            const id = `u_${Date.now()}`;
            const doctor = {
                id,
                mobile: doctorData.mobile,
                name: doctorData.name,
                role: 'DOCTOR',
                hospitalId,
                password: doctorData.password || '123',
                speciality: doctorData.speciality,
                experience: parseInt(doctorData.experience) || 0,
                fee: parseInt(doctorData.fee) || 500,
            };
            db.users.push(doctor);
            saveDb();
            return doctor;
        },

        removeDoctor: (hospitalId, doctorId) => {
            const idx = db.users.findIndex(u => u.id === doctorId && u.hospitalId === hospitalId && u.role === 'DOCTOR');
            if (idx !== -1) {
                db.users.splice(idx, 1);
                saveDb();
                return true;
            }
            return false;
        },

        getVisits: (hospitalId, filters = {}) => {
            let v = db.visits.filter(visit => visit.hospitalId === hospitalId);
            if (filters.doctorId) v = v.filter(visit => visit.doctorId === filters.doctorId);
            if (filters.date) v = v.filter(visit => visit.date.startsWith(filters.date));
            if (filters.status) v = v.filter(visit => visit.status === filters.status);
            // Sort by date descending
            v.sort((a, b) => new Date(b.date) - new Date(a.date));
            return v;
        },

        createVisit: (hospitalId, data) => {
            let hp = db.hospitalPatients.find(p => p.hospitalId === hospitalId && p.mobile === data.patientMobile);

            if (!hp) {
                let gp = db.globalPatients.find(p => p.mobile === data.patientMobile);
                if (!gp) {
                    gp = { id: `gp_${Date.now()}`, mobile: data.patientMobile, city: 'Unknown' };
                    db.globalPatients.push(gp);
                }

                hp = {
                    id: `hp_${Date.now()}`,
                    globalId: gp.id,
                    hospitalId,
                    name: data.patientName,
                    age: data.age,
                    gender: data.gender,
                    mobile: data.patientMobile
                };
                db.hospitalPatients.push(hp);
            }

            const visit = {
                id: `v_${Date.now()}`,
                hospitalId,
                doctorId: data.doctorId,
                patientId: hp.id,
                date: data.date,
                status: 'SCHEDULED'
            };
            db.visits.push(visit);
            saveDb();
            return visit;
        },

        cancelVisit: (hospitalId, visitId) => {
            const visit = db.visits.find(v => v.id === visitId && v.hospitalId === hospitalId);
            if (!visit) return null;
            if (visit.status === 'CANCELLED') return visit;
            visit.status = 'CANCELLED';
            saveDb();
            return visit;
        },

        completeVisit: (hospitalId, visitId) => {
            const visit = db.visits.find(v => v.id === visitId && v.hospitalId === hospitalId);
            if (!visit) return null;
            visit.status = 'COMPLETED';
            saveDb();
            return visit;
        },

        rescheduleVisit: (hospitalId, visitId, newDate) => {
            const visit = db.visits.find(v => v.id === visitId && v.hospitalId === hospitalId);
            if (!visit) return null;
            visit.date = newDate;
            visit.status = 'SCHEDULED';
            saveDb();
            return visit;
        },

        login: (mobile, password) => {
            const user = db.users.find(u => u.mobile === mobile && u.password === password);
            if (user) return { ...user, token: 'mock-token' };
            return null;
        },

        getPatients: (hospitalId) => {
            return db.hospitalPatients.filter(p => p.hospitalId === hospitalId);
        },

        getPatientById: (hospitalId, patientId) => {
            return db.hospitalPatients.find(p => p.id === patientId && p.hospitalId === hospitalId);
        },
    },

    // --- Patient Services ---
    patient: {
        login: (mobile, otp) => {
            if (otp !== '1234') return null;
            let gp = db.globalPatients.find(p => p.mobile === mobile);
            if (!gp) {
                gp = { id: `gp_${Date.now()}`, mobile, city: 'Select City' };
                db.globalPatients.push(gp);
                saveDb();
            }
            return gp;
        },

        getById: (id) => {
            return db.globalPatients.find(p => p.id === id);
        },

        getVisits: (globalId) => {
            const hps = db.hospitalPatients.filter(hp => hp.globalId === globalId).map(hp => hp.id);
            const visits = db.visits.filter(v => hps.includes(v.patientId));
            // Sort by date descending
            visits.sort((a, b) => new Date(b.date) - new Date(a.date));
            return visits;
        },

        cancelVisit: (globalId, visitId) => {
            const hps = db.hospitalPatients.filter(hp => hp.globalId === globalId).map(hp => hp.id);
            const visit = db.visits.find(v => v.id === visitId && hps.includes(v.patientId));
            if (!visit) return null;
            if (visit.status === 'COMPLETED') return null;
            visit.status = 'CANCELLED';
            saveDb();
            return visit;
        },

        updateProfile: (id, updates) => {
            const idx = db.globalPatients.findIndex(p => p.id === id);
            if (idx !== -1) {
                db.globalPatients[idx] = { ...db.globalPatients[idx], ...updates };
                saveDb();
                return db.globalPatients[idx];
            }
            return null;
        },

        register: (data) => {
            // Check if mobile already exists
            let gp = db.globalPatients.find(p => p.mobile === data.mobile);
            if (gp) {
                // Update existing
                gp.name = data.name || gp.name;
                gp.age = data.age || gp.age;
                gp.gender = data.gender || gp.gender;
                gp.bloodGroup = data.bloodGroup || gp.bloodGroup;
                gp.city = data.city || gp.city;
                gp.email = data.email || gp.email;
                saveDb();
                return gp;
            }
            gp = {
                id: `gp_${Date.now()}`,
                mobile: data.mobile,
                name: data.name || '',
                age: data.age || '',
                gender: data.gender || '',
                bloodGroup: data.bloodGroup || '',
                city: data.city || '',
                email: data.email || '',
            };
            db.globalPatients.push(gp);
            saveDb();
            return gp;
        }
    },

    // --- Admin Services ---
    admin: {
        login: (username, password) => {
            if (username === 'admin' && password === 'admin123') {
                return { id: 'admin', role: 'PLATFORM_ADMIN', name: 'Platform Admin' };
            }
            return null;
        },

        getPendingHospitals: () => {
            return db.hospitals.filter(h => h.status === 'PENDING');
        },

        getAllHospitals: () => {
            return db.hospitals;
        },

        approveHospital: (hospitalId) => {
            const h = db.hospitals.find(h => h.id === hospitalId);
            if (h) {
                h.status = 'ACTIVE';
                saveDb();
                return h;
            }
            return null;
        },

        rejectHospital: (hospitalId) => {
            const h = db.hospitals.find(h => h.id === hospitalId);
            if (h) {
                h.status = 'REJECTED';
                saveDb();
                return h;
            }
            return null;
        },

        suspendHospital: (hospitalId) => {
            const h = db.hospitals.find(h => h.id === hospitalId);
            if (h) {
                h.status = 'SUSPENDED';
                saveDb();
                return h;
            }
            return null;
        },

        getPlatformStats: () => {
            return {
                totalHospitals: db.hospitals.length,
                activeHospitals: db.hospitals.filter(h => h.status === 'ACTIVE').length,
                pendingHospitals: db.hospitals.filter(h => h.status === 'PENDING').length,
                totalDoctors: db.users.filter(u => u.role === 'DOCTOR').length,
                totalPatients: db.globalPatients.length,
                totalVisits: db.visits.length,
                cities: [...new Set(db.hospitals.filter(h => h.status === 'ACTIVE').map(h => h.city))].length,
            };
        },
    }
};
