'use server'

import { services } from '@/lib/services';
import { CareLifecycleService } from '@/lib/services/care-lifecycle';
import { z } from 'zod';
import logger from '@/lib/logger';

const PasswordSchema = z.string().min(6, 'Password must be at least 6 characters long.');
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createSession, deleteSession, decrypt } from '@/lib/session';
import { requireRole } from '../lib/auth/requireRole';
import { UserRole } from '../types';

// ==================== HOSPITAL ACTIONS ====================

export async function loginHospital(prevState, formData) {
    const mobile = formData.get('mobile');
    const password = formData.get('password');

    if (!mobile || !password) {
        return { message: 'Please enter both mobile and password.' };
    }

    const result = await services.hospital.login(mobile, password);

    if (!result) {
        return { message: 'Invalid credentials.' };
    }

    await createSession('session_user', result);
    redirect('/hospital/dashboard');
}

export async function registerHospital(prevState, formData) {
    try {
        const data = {
            hospitalName: formData.get('hospitalName'),
            city: formData.get('city'),
            adminName: formData.get('adminName'),
            mobile: formData.get('mobile'),
            password: formData.get('password')
        };

        if (!data.hospitalName || !data.city || !data.adminName || !data.mobile || !data.password) {
            return { success: false, message: 'Please fill in all required fields.' };
        }

        const pwdCheck = PasswordSchema.safeParse(data.password);
        if (!pwdCheck.success) {
            return { success: false, message: pwdCheck.error.errors[0].message };
        }

        await services.hospital.register(data);
        return { success: true, message: 'Hospital registered successfully! Account is pending admin approval.' };
    } catch (e) {
        return { success: false, message: e.message || 'Registration failed.' };
    }
}

export async function logoutHospital() {
    await deleteSession('session_user');
    redirect('/hospital/login');
}

export async function createVisitAction(prevState, formData) {
    let user;
    try {
        user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');
    } catch (e) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        const visitData = {
            doctorId: formData.get('doctorId'),
            patientName: formData.get('patientName'),
            patientMobile: formData.get('patientMobile'),
            age: formData.get('age'),
            gender: formData.get('gender'),
            date: new Date().toISOString()
        };

        if (!visitData.doctorId || !visitData.patientName || !visitData.patientMobile) {
            return { success: false, message: 'Please fill in all required fields.' };
        }

        await services.hospital.createVisit(user.hospitalId, visitData);
        return { success: true, message: 'Visit created successfully!' };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

export async function cancelVisitHospital(prevState, formData) {
    let user;
    try {
        user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');
    } catch (e) {
        return { success: false, message: 'Unauthorized' };
    }

    const visitId = formData.get('visitId');
    return { success: false, message: 'Feature pending migration.' };
}

export async function completeVisitHospital(prevState, formData) {
    let user;
    try {
        user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');
    } catch (e) {
        return { success: false, message: 'Unauthorized' };
    }

    const visitId = formData.get('visitId');
    const notes = formData.get('notes');
    const imageFile = formData.get('prescriptionImage');

    if (!visitId || !notes) {
        return { success: false, message: 'Visit ID and Clinical Notes are required for AI analysis.' };
    }

    let imageData = null;
    if (imageFile && imageFile.size > 0) {
        // Convert File to Base64 for processing
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        imageData = {
            mimeType: imageFile.type || 'image/jpeg',
            data: buffer.toString('base64')
        };
    }

    try {
        await services.ai.processVisit(visitId, notes, imageData);
        return { success: true, message: 'Visit completed and AI care journey generated!' };
    } catch (e) {
        return { success: false, message: `Failed to complete visit: ${e.message}` };
    }
}

export async function addDoctorAction(prevState, formData) {
    let user;
    try {
        user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
    } catch (e) {
        return { success: false, message: 'Only hospital admins can add doctors.' };
    }

    const doctorData = {
        name: formData.get('name'),
        mobile: formData.get('mobile'),
        speciality: formData.get('speciality'),
        experience: formData.get('experience'),
        fee: formData.get('fee'),
        password: formData.get('password') || '123',
        qualifications: formData.get('qualifications'),
        schedule: formData.get('schedule')
    };

    if (!doctorData.name || !doctorData.mobile || !doctorData.speciality) {
        return { success: false, message: 'Name, mobile, and speciality are required.' };
    }

    await services.hospital.addDoctor(user.hospitalId, doctorData);
    return { success: true, message: `Dr. ${doctorData.name} added successfully!` };
}

export async function removeDoctorAction(prevState, formData) {
    let user;
    try {
        user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
    } catch (e) {
        return { success: false, message: 'Only hospital admins can remove doctors.' };
    }

    const doctorId = formData.get('doctorId');
    await services.hospital.removeDoctor(user.hospitalId, doctorId);

    return { success: true, message: 'Doctor removed successfully.' };
}

export async function approveDoctorAffiliationAction(prevState, formData) {
    let user;
    try {
        user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
    } catch (e) {
        return { success: false, message: 'Only hospital admins can approve doctors.' };
    }

    const doctorId = formData.get('doctorId');
    await services.hospital.approveDoctorAffiliation(user.hospitalId, doctorId);
    return { success: true, message: 'Doctor approved successfully.' };
}

export async function getHospitalDashboardData(hospitalId) {
    try {
        const [stats, allVisits] = await Promise.all([
            services.hospital.getStats(hospitalId),
            services.hospital.getVisits(hospitalId)
        ]);
        return {
            stats,
            recentVisits: allVisits.slice(0, 5)
        };
    } catch (e) {
        console.error("Error fetching hospital dashboard data:", e);
        return { stats: { todayVisits: 0, totalPatients: 0, totalDoctors: 0, scheduledVisits: 0, totalVisits: 0, completedVisits: 0 }, recentVisits: [] };
    }
}

export async function getLabDashboardData(hospitalId) {
    try {
        const [catalog, orders] = await Promise.all([
            services.hospital.getDiagnosticCatalog(hospitalId),
            services.hospital.getLabOrders(hospitalId)
        ]);
        return { catalog, orders };
    } catch (e) {
        console.error("Error fetching lab dashboard data:", e);
        return { catalog: [], orders: [] };
    }
}

export async function rejectDoctorAffiliationAction(prevState, formData) {
    let user;
    try {
        user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
    } catch (e) {
        return { success: false, message: 'Only hospital admins can reject doctors.' };
    }

    const doctorId = formData.get('doctorId');
    await services.hospital.rejectDoctorAffiliation(user.hospitalId, doctorId);
    return { success: true, message: 'Doctor rejected successfully.' };
}

export async function getAdminDashboardData() {
    try {
        await requireRole(UserRole.ADMIN, 'session_admin');
        const stats = await services.admin.getPlatformStats();
        return { stats };
    } catch (e) {
        console.error("Error fetching admin dashboard data:", e);
        return { stats: { totalHospitals: 0, activeHospitals: 0, pendingHospitals: 0, totalDoctors: 0, totalPatients: 0, totalVisits: 0, cities: 0 } };
    }
}

export async function getAgentDashboardData(agentId) {
    try {
        await requireRole(UserRole.AGENT, 'session_agent');
        const data = await services.agent.getDashboardData(agentId);
        return data;
    } catch (e) {
        console.error("Error fetching agent dashboard data:", e);
        return { hospitals: [], patients: [], stats: { totalHospitals: 0, approvedHospitals: 0, totalPatients: 0 } };
    }
}

export async function registerDoctor(prevState, formData) {
    try {
        const data = {
            fullName: formData.get('fullName'),
            mobile: formData.get('mobile'),
            email: formData.get('email'),
            password: formData.get('password'),
            registrationNumber: formData.get('registrationNumber'),
            councilName: formData.get('councilName')
        };

        if (!data.fullName || !data.mobile || !data.email || !data.registrationNumber || !data.password) {
            return { success: false, message: 'Please fill in all required fields.' };
        }

        const pwdCheck = PasswordSchema.safeParse(data.password);
        if (!pwdCheck.success) {
            return { success: false, message: pwdCheck.error.errors[0].message };
        }

        await services.doctor.register(data);
        return { success: true, message: 'Doctor registered successfully! Complete your KYC inside the dashboard.' };
    } catch (e) {
        return { success: false, message: e.message || 'Registration failed.' };
    }
}

export async function registerAgent(prevState, formData) {
    try {
        const data = {
            fullName: formData.get('fullName'),
            mobile: formData.get('mobile'),
            email: formData.get('email'),
            password: formData.get('password'),
            area: formData.get('area'),
            city: formData.get('city'),
            state: formData.get('state'),
        };

        if (!data.fullName || !data.mobile || !data.email || !data.password) {
            return { success: false, message: 'Please fill in all required fields.' };
        }

        const pwdCheck = PasswordSchema.safeParse(data.password);
        if (!pwdCheck.success) {
            return { success: false, message: pwdCheck.error.errors[0].message };
        }

        await services.agent.register(data);
        return { success: true, message: 'Agent registered successfully! Partner approval is pending.' };
    } catch (e) {
        return { success: false, message: e.message || 'Registration failed.' };
    }
}

export async function registerLab(prevState, formData) {
    try {
        const data = {
            labName: formData.get('labName'),
            city: formData.get('city'),
            adminName: formData.get('adminName'),
            mobile: formData.get('mobile'),
            password: formData.get('password'),
            registrationNumber: formData.get('registrationNumber')
        };

        if (!data.labName || !data.city || !data.adminName || !data.mobile || !data.password) {
            return { success: false, message: 'Please fill in all required fields.' };
        }

        const pwdCheck = PasswordSchema.safeParse(data.password);
        if (!pwdCheck.success) {
            return { success: false, message: pwdCheck.error.errors[0].message };
        }

        await services.hospital.registerLab(data);
        return { success: true, message: 'Lab registered successfully! Account is pending admin approval.' };
    } catch (e) {
        return { success: false, message: e.message || 'Registration failed.' };
    }
}

export async function agentLogin(prevState, formData) {
    const mobile = formData.get('mobile');
    const password = formData.get('password');

    if (!mobile || !password) {
        return { message: 'Please enter mobile number and password.' };
    }

    try {
        const result = await services.agent.login(mobile, password);
        await createSession('session_agent', result);
    } catch (e) {
        return { message: e.message || 'Login failed.' };
    }

    redirect('/agent/dashboard');
}

// ==================== PATIENT ACTIONS ====================

export async function patientLogin(prevState, formData) {
    const mobile = formData.get('mobile');
    const otp = formData.get('otp');

    if (!mobile || !otp) {
        return { message: 'Please enter mobile number and OTP.' };
    }

    try {
        const result = await services.patient.login(mobile, otp);
        if (!result) {
            return { message: 'Login failed due to an unknown error.' };
        }
        await createSession('session_patient', result);
    } catch (e) {
        return { message: e.message || 'Login failed.' };
    }

    redirect('/');
}

export async function requestOtpAction(prevState, formData) {
    const mobile = formData.get('mobile');
    if (!mobile || mobile.length < 10) {
        return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    try {
        await services.patient.requestOtp(mobile);
        return { success: true, message: 'OTP sent successfully!' };
    } catch (e) {
        logger.error({ action: 'otp_request_failed', mobile, error: e.message, stack: e.stack }, 'Failed to send OTP');
        return { success: false, message: `Failed to send OTP: ${e.message}` };
    }
}

export async function patientRegister(prevState, formData) {
    const data = {
        mobile: formData.get('mobile'),
        name: formData.get('name'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        city: formData.get('city'),
        email: formData.get('email'),
    };

    if (!data.mobile || !data.name) {
        return { message: 'Mobile number and name are required.' };
    }

    const result = await services.patient.register(data);
    await createSession('session_patient', result);

    return { success: true, message: 'Profile saved successfully!' };
}

export async function patientLogout() {
    await deleteSession('session_patient');
    redirect('/login');
}

export async function getPatientFullProfile() {
    try {
        const patientCookie = await requireRole(UserRole.PATIENT, 'session_patient');
        const patientData = await services.patient.getById(patientCookie.id);

        if (!patientData) return null;

        // Fetch all related health details
        const results = await Promise.allSettled([
            services.patient.getFamilyMembers(patientCookie.id),
            services.patient.getMedicalHistory(patientCookie.id),
            services.patient.getMedications(patientCookie.id),
            services.patient.getVitals(patientCookie.id),
            services.patient.getVaccinations(patientCookie.id),
            services.patient.getPregnancyProfile(patientCookie.id),
            services.patient.getInsurance(patientCookie.id),
            services.patient.getAddresses(patientCookie.id),
            services.patient.getWallet(patientCookie.id),
            services.patient.getPrescriptions(patientCookie.id)
        ]);

        const [
            familyMembers, medicalHistory, medications, vitals,
            vaccinations, pregnancyProfile, insurance, addresses,
            wallet, prescriptions
        ] = results.map((r, i) => {
            if (r.status === 'fulfilled') return r.value;
            logger.error({ action: 'profile_subfetch_failed', index: i, error: r.reason?.message }, 'Sub-fetch during profile load failed');
            return null; // Graceful fallback per sub-section
        });

        return {
            ...patientData,
            familyMembers: familyMembers || [],
            medicalHistory: medicalHistory || null,
            medications: medications || [],
            vitals: vitals || [],
            vaccinations: vaccinations || [],
            pregnancyProfile: pregnancyProfile || null,
            insurance: insurance || [],
            addresses: addresses || [],
            wallet: wallet || { balance: 0, transactions: [] },
            prescriptions: prescriptions || []
        };
    } catch (e) {
        logger.error({ action: 'get_patient_profile_failed', error: e.message }, 'Failed to fetch full patient profile');
        return null;
    }
}

import { uploadProfilePhoto } from '@/lib/supabase';

export async function updatePatientProfile(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const updates = {
        name: formData.get('name'),
        nickname: formData.get('nickname') || undefined,
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        city: formData.get('city'),
        email: formData.get('email'),
        dob: formData.get('dob') ? new Date(formData.get('dob')) : undefined,
        address: formData.get('address') || undefined,
        state: formData.get('state') || undefined,
        country: formData.get('country') || undefined,
        pincode: formData.get('pincode') || undefined,
        occupation: formData.get('occupation') || undefined,
        maritalStatus: formData.get('maritalStatus') || undefined,
        emergencyContactName: formData.get('emergencyContactName') || undefined,
        emergencyContactRelation: formData.get('emergencyContactRelation') || undefined,
        emergencyContactPhone: formData.get('emergencyContactPhone') || undefined,
        emergencyContactAltPhone: formData.get('emergencyContactAltPhone') || undefined,
        preferredHospital: formData.get('preferredHospital') || undefined,
        preferredSpeciality: formData.get('preferredSpeciality') || undefined,
        preferredDoctor: formData.get('preferredDoctor') || undefined,
    };

    // Handle Profile Photo File Upload
    const photoFile = formData.get('profilePhotoFile');
    if (photoFile && photoFile.size > 0 && photoFile.name) {
        try {
            const uploadedUrl = await uploadProfilePhoto(photoFile, patient.id);
            if (uploadedUrl) updates.profilePhotoUrl = uploadedUrl;
        } catch (e) {
            console.error('DEBUG_PHOTO_UPLOAD_ERROR:', e);
            return { message: `Failed to upload profile photo: ${e.message || 'Unknown error'}` };
        }
    } else {
        // Fallback for direct URL input
        updates.profilePhotoUrl = formData.get('profilePhotoUrl') || undefined;
    }

    // Remove undefined values
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    try {
        const updated = await services.patient.updateProfile(patient.id, updates);
        if (updated) {
            await createSession('session_patient', {
                user: {
                    id: updated.id,
                    name: updated.name || 'Patient',
                    role: UserRole.PATIENT,
                    mobile: updated.phone,
                    nickname: updated.nickname || undefined,
                    profilePhotoUrl: updated.profilePhotoUrl || undefined
                }
            });
            return { success: true, message: 'Profile updated successfully!' };
        }
    } catch (error) {
        console.error("DEBUG_UPDATE_PROFILE_ERROR:", error);
    }

    return { message: 'Failed to update profile.' };
}

// ==================== FAMILY MEMBER ACTIONS ====================

export async function addFamilyMemberAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const data = {
        name: formData.get('name'),
        relation: formData.get('relation'),
        dob: formData.get('dob') || undefined,
        gender: formData.get('gender') || undefined,
        bloodGroup: formData.get('bloodGroup') || undefined,
    };

    if (!data.name || !data.relation) {
        return { message: 'Name and relation are required.' };
    }

    await services.patient.addFamilyMember(patient.id, data);
    return { success: true, message: 'Family member added!' };
}

export async function deleteFamilyMemberAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }
    const memberId = formData.get('memberId');
    await services.patient.deleteFamilyMember(patient.id, memberId);
    return { success: true, message: 'Family member removed.' };
}

// ==================== MEDICAL HISTORY ACTIONS ====================

export async function saveMedicalHistoryAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const data = {
        chronicDiseases: formData.get('chronicDiseases') || undefined,
        pastIllnesses: formData.get('pastIllnesses') || undefined,
        surgeries: formData.get('surgeries') || undefined,
        allergies: formData.get('allergies') || undefined,
        drugAllergies: formData.get('drugAllergies') || undefined,
        hospitalizations: formData.get('hospitalizations') || undefined,
    };

    await services.patient.saveMedicalHistory(patient.id, data);
    return { success: true, message: 'Medical history saved!' };
}

// ==================== MEDICATION ACTIONS ====================

export async function addMedicationAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const data = {
        drugName: formData.get('drugName'),
        dose: formData.get('dose') || undefined,
        frequency: formData.get('frequency') || undefined,
        startDate: formData.get('startDate') || undefined,
    };

    if (!data.drugName) {
        return { message: 'Drug name is required.' };
    }

    await services.patient.addMedication(patient.id, data);
    return { success: true, message: 'Medication added!' };
}

export async function deleteMedicationAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }
    const medicationId = formData.get('medicationId');
    await services.patient.deleteMedication(patient.id, medicationId);
    return { success: true, message: 'Medication removed.' };
}

// ==================== VITAL ACTIONS ====================

export async function addVitalAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const data = {
        weight: formData.get('weight') ? parseFloat(formData.get('weight')) : undefined,
        height: formData.get('height') ? parseFloat(formData.get('height')) : undefined,
        bloodPressure: formData.get('bloodPressure') || undefined,
        pulse: formData.get('pulse') ? parseInt(formData.get('pulse')) : undefined,
        bloodSugar: formData.get('bloodSugar') ? parseFloat(formData.get('bloodSugar')) : undefined,
        spo2: formData.get('spo2') ? parseFloat(formData.get('spo2')) : undefined,
        temperature: formData.get('temperature') ? parseFloat(formData.get('temperature')) : undefined,
    };

    await services.patient.addVital(patient.id, data);
    return { success: true, message: 'Vitals recorded!' };
}

// ==================== VACCINATION ACTIONS ====================

export async function addVaccinationAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const data = {
        vaccineName: formData.get('vaccineName'),
        dateGiven: formData.get('dateGiven') || undefined,
        nextDueDate: formData.get('nextDueDate') || undefined,
    };

    if (!data.vaccineName) {
        return { message: 'Vaccine name is required.' };
    }

    await services.patient.addVaccination(patient.id, data);
    return { success: true, message: 'Vaccination record added!' };
}

// ==================== PREGNANCY PROFILE ACTIONS ====================

export async function savePregnancyProfileAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const data = {
        lmp: formData.get('lmp') || undefined,
        edd: formData.get('edd') || undefined,
        gestationalAge: formData.get('gestationalAge') ? parseInt(formData.get('gestationalAge')) : undefined,
        highRisk: formData.get('highRisk') === 'true',
        ancVisits: formData.get('ancVisits') ? parseInt(formData.get('ancVisits')) : undefined,
        dangerSigns: formData.get('dangerSigns') || undefined,
        deliveryPlan: formData.get('deliveryPlan') || undefined,
    };

    await services.patient.savePregnancyProfile(patient.id, data);
    return { success: true, message: 'Pregnancy profile saved!' };
}

// ==================== INSURANCE ACTIONS ====================

export async function saveInsuranceAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const data = {
        id: formData.get('insuranceId') || undefined,
        company: formData.get('company'),
        policyNumber: formData.get('policyNumber') || undefined,
        coverageAmount: formData.get('coverageAmount') ? parseFloat(formData.get('coverageAmount')) : undefined,
        expiryDate: formData.get('expiryDate') || undefined,
    };

    if (!data.company) {
        return { message: 'Insurance company name is required.' };
    }

    await services.patient.saveInsurance(patient.id, data);
    return { success: true, message: 'Insurance details saved!' };
}

export async function deleteInsuranceAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }
    const insuranceId = formData.get('insuranceId');
    await services.patient.deleteInsurance(patient.id, insuranceId);
    return { success: true, message: 'Insurance removed.' };
}

// ==================== APPOINTMENT ACTIONS ====================
export async function getMyAppointmentsAction() {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { success: false, message: 'Please login first.' };
    }
    const visits = await services.patient.getVisits(patient.id);
    return { success: true, data: visits };
}

// ==================== ADDRESS ACTIONS ====================

export async function addAddressAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const data = {
        type: formData.get('type') || 'Home',
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state') || undefined,
        pincode: formData.get('pincode'),
        landmark: formData.get('landmark') || undefined,
        isDefault: formData.get('isDefault') === 'true',
    };

    if (!data.address || !data.city || !data.pincode) {
        return { message: 'Address, city, and pincode are required.' };
    }

    await services.patient.addAddress(patient.id, data);
    return { success: true, message: 'Address saved!' };
}

export async function deleteAddressAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }
    const addressId = formData.get('addressId');
    await services.patient.deleteAddress(patient.id, addressId);
    return { success: true, message: 'Address removed.' };
}

export async function setDefaultAddressAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }
    const addressId = formData.get('addressId');
    await services.patient.setDefaultAddress(patient.id, addressId);
    return { success: true, message: 'Default address updated.' };
}

// ==================== WALLET ACTIONS ====================

export async function addWalletTransactionAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const data = {
        type: formData.get('type'), // CREDIT, DEBIT
        amount: parseFloat(formData.get('amount')),
        source: formData.get('source'), // TOPUP, APPOINTMENT, etc
        description: formData.get('description') || undefined
    };

    if (!data.type || !data.amount || !data.source || isNaN(data.amount)) {
        return { message: 'Missing or invalid transaction details.' };
    }
    await services.patient.addWalletTransaction(patient.id, data);
    return { success: true, message: 'Transaction successful!' };
}

// ==================== PRESCRIPTION ACTIONS ====================

export async function uploadPrescriptionAction(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const fileUrl = formData.get('fileUrl');
    if (!fileUrl) return { message: 'File URL is required' };

    await services.patient.uploadPrescriptionFile(patient.id, {
        fileUrl,
        notes: formData.get('notes') || undefined,
        doctorId: formData.get('doctorId') || undefined
    });

    return { success: true, message: 'Prescription uploaded!' };
}

export async function logoutPatient() {
    await deleteSession('session_patient');
    redirect('/');
}

export async function bookAppointment(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login to book an appointment.' };
    }

    const doctorId = formData.get('doctorId');
    const hospitalId = formData.get('hospitalId');
    const date = formData.get('date');
    const slot = formData.get('slot');

    if (!doctorId || !hospitalId || !date || !slot) {
        return { success: false, message: 'Please fill in all booking details.' };
    }

    try {
        const payWithWallet = formData.get('payWithWallet') === 'true';
        let assignedStatus = 'BOOKED';

        if (payWithWallet) {
            const wallet = await services.patient.getWallet(patient.id);
            if (wallet.balance < 500) { // Assuming 500 consultation fee
                return { success: false, message: 'Insufficient wallet balance. Please top up your wallet.' };
            }
            await services.patient.addWalletTransaction(patient.id, {
                type: 'DEBIT',
                amount: 500,
                source: 'APPOINTMENT',
                description: `Payment for appointment on ${date} at ${slot}`
            });
            assignedStatus = 'CONFIRMED';
        }

        const visitData = {
            doctorId,
            patientName: patient.name || patient.mobile,
            patientMobile: patient.mobile,
            age: 0,
            gender: 'O',
            date: date,
            slot: slot,
            status: assignedStatus
        };

        await services.patient.createVisit(hospitalId, visitData);
        return { success: true, message: payWithWallet ? 'Appointment confirmed and paid via wallet!' : 'Appointment booked successfully! (Awaiting Payment)' };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

export async function cancelAppointmentPatient(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
        const visitId = formData.get('visitId');
        await services.patient.cancelVisit(patient.id, visitId);
        return { success: true, message: 'Appointment cancelled and refund processed.' };
    } catch (e) {
        logger.error({ action: 'cancel_appointment_failed', error: e.message }, 'Cancellation failed');
        return { success: false, message: e.message || 'Cannot cancel this appointment.' };
    }
}

export const cancelAppointmentAction = cancelAppointmentPatient;

export async function addReview(prevState, formData) {
    return { success: true, message: 'Reviews are temporarily disabled during upgrade' };
}

// ==================== ADMIN ACTIONS ====================

export async function adminLogin(prevState, formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        return { message: 'Please provide username and password.' };
    }

    const result = await services.admin.login(username, password);
    if (!result) {
        return { message: 'Invalid credentials.' };
    }

    await createSession('session_admin', result);
    redirect('/admin/dashboard');
}

export async function logoutAdmin() {
    await deleteSession('session_admin');
    redirect('/admin');
}

export async function approveHospitalAction(prevState, formData) {
    try {
        await requireRole(UserRole.PLATFORM_ADMIN, 'session_admin');
    } catch (e) {
        return { message: 'Unauthorized' };
    }

    const hospitalId = formData.get('hospitalId');
    await services.admin.approveHospital(hospitalId);

    return { success: true, message: `Hospital approved.` };
}

export async function rejectHospitalAction(prevState, formData) {
    try {
        await requireRole(UserRole.PLATFORM_ADMIN, 'session_admin');
    } catch (e) {
        return { message: 'Unauthorized' };
    }

    const hospitalId = formData.get('hospitalId');
    await services.admin.rejectHospital(hospitalId);

    return { success: true, message: `Hospital rejected.` };
}

export async function suspendHospitalAction(prevState, formData) {
    try {
        await requireRole(UserRole.PLATFORM_ADMIN, 'session_admin');
    } catch (e) {
        return { message: 'Unauthorized' };
    }

    const hospitalId = formData.get('hospitalId');
    await services.admin.suspendHospital(hospitalId);

    return { success: true, message: `Hospital suspended.` };
}

export async function getAvailableSlotsAction(doctorId, date) {
    if (!doctorId || !date) return [];
    try {
        const slots = await services.patient.getAvailableSlots(doctorId, date);
        return slots;
    } catch (error) {
        logger.error({ action: 'get_available_slots_failed', error: error.message }, 'Failed to get slots');
        return [];
    }
}

// ==================== MEDCHAT AI TRIAGE ====================

import { MedChatInputSchema } from '@/lib/medchat/schemas';
import { triagePatient } from '@/lib/medchat/triage-engine';

export async function medchatTriageAction(prevState, formData) {
    try {
        const rawInput = {
            age: formData.get('age'),
            gender: formData.get('gender'),
            city: formData.get('city'),
            duration: formData.get('duration'),
            symptoms: formData.get('symptoms'),
            fever: formData.get('fever'),
            breathingDifficulty: formData.get('breathingDifficulty'),
            seizure: formData.get('seizure'),
            consciousnessNormal: formData.get('consciousnessNormal'),
        };

        const parsed = MedChatInputSchema.safeParse(rawInput);
        if (!parsed.success) {
            const firstError = parsed.error.errors[0];
            return { success: false, message: `Invalid input: ${firstError.path.join('.')} — ${firstError.message}` };
        }

        const result = await triagePatient(parsed.data);

        // Strip internal-only fields from client response
        const { probable_differentials_hidden, risk_score_internal, ...clientResult } = result;

        return { success: true, result: clientResult };
    } catch (e) {
        logger.error({ action: 'medchat_triage_failed', error: e.message }, 'MedChat triage error');
        return { success: false, message: 'An error occurred during symptom analysis. Please try again.' };
    }
}

export async function getTopDoctorsBySpeciality(speciality, city) {
    try {
        if (!speciality) return [];
        const doctors = await services.platform.searchDoctors(city, speciality);
        return doctors.slice(0, 3).map(doc => ({
            id: doc.id,
            name: doc.fullName,
            fullName: doc.fullName,
            speciality: speciality,
            hospital: doc.affiliations?.[0]?.hospital?.legalName || 'Haspataal Partner',
            stars: 4.5,
            distance: 'Near you'
        }));
    } catch (e) {
        logger.error({ action: 'get_top_doctors_failed', error: e.message });
        return [];
    }
}
// ==================== AI & VISIT ANALYSIS ====================

export async function getVisitAnalysisAction(visitId) {
    try {
        await requireRole(UserRole.PATIENT, 'session_patient');
        return await services.ai.getVisitAnalysis(visitId);
    } catch (e) {
        logger.error({ action: 'get_visit_analysis_failed', visitId, error: e.message }, 'Failed to fetch visit analysis');
        return null;
    }
}

export async function processVisitAiAction(visitId, notes) {
    try {
        await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], 'session_user');
        return await services.ai.processVisit(visitId, notes);
    } catch (e) {
        logger.error({ action: 'process_visit_ai_failed', visitId, error: e.message }, 'Failed to process visit AI');
        throw e;
    }
}

// --- Continuous Care Actions ---

export async function getCareTimelineAction(visitId) {
    try {
        await requireRole(UserRole.PATIENT, 'session_patient');
        const state = await CareLifecycleService.getRecoveryState(visitId);
        if (!state) return null;
        const drift = await CareLifecycleService.analyzeRecoveryDrift(state.journeyId);
        return { ...state, drift };
    } catch (e) {
        logger.error({ action: 'get_care_timeline_failed', visitId, error: e.message });
        return null;
    }
}

export async function logMedicationAction(careJourneyId, medName, schedule) {
    try {
        await requireRole(UserRole.PATIENT, 'session_patient');
        return await CareLifecycleService.logMedication(careJourneyId, medName, schedule);
    } catch (e) {
        logger.error({ action: 'log_medication_failed', careJourneyId, error: e.message });
        throw e;
    }
}

export async function submitCheckInAction(careJourneyId, dayNumber, status) {
    try {
        await requireRole(UserRole.PATIENT, 'session_patient');
        return await CareLifecycleService.submitCheckIn(careJourneyId, dayNumber, status);
    } catch (e) {
        logger.error({ action: 'submit_checkin_failed', careJourneyId, error: e.message });
        throw e;
    }
}
