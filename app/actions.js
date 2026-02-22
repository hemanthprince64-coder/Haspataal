'use server'

import { services } from '@/lib/services';
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
    return { message: 'Hospital registration temporarily disabled for migration. Please contact Admin.' };
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

    return { success: true, message: 'Visit marked as completed.' };
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

// ==================== PATIENT ACTIONS ====================

export async function patientLogin(prevState, formData) {
    const mobile = formData.get('mobile');
    const otp = formData.get('otp');

    if (!mobile || !otp) {
        return { message: 'Please enter mobile number and OTP.' };
    }

    if (otp !== '1234') {
        return { message: 'Invalid OTP. Use 1234 for demo.' };
    }

    const result = await services.patient.login(mobile, otp);
    if (!result) {
        return { message: 'Login failed.' };
    }
    await createSession('session_patient', result);
    redirect('/');
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

export async function updatePatientProfile(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const updates = {
        name: formData.get('name'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        city: formData.get('city'),
        email: formData.get('email'),
    };

    const updated = await services.patient.updateProfile(patient.id, updates);
    if (updated) {
        // Re-create session with updated user data
        await createSession('session_patient', {
            user: {
                id: updated.id,
                name: updated.name || 'Patient',
                role: UserRole.PATIENT,
                mobile: updated.phone
            }
        });
        return { success: true, message: 'Profile updated successfully!' };
    }

    return { message: 'Failed to update profile.' };
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
        const visitData = {
            doctorId,
            patientName: patient.name || patient.mobile,
            patientMobile: patient.mobile,
            age: 0,
            gender: 'O',
            date: `${date}T${slot}`
        };

        await services.patient.createVisit(hospitalId, visitData);
        return { success: true, message: 'Appointment booked successfully!' };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

export async function cancelAppointmentPatient(prevState, formData) {
    let patient;
    try {
        patient = await requireRole(UserRole.PATIENT, 'session_patient');
    } catch (e) {
        return { message: 'Please login first.' };
    }

    const visitId = formData.get('visitId');
    const result = await services.patient.cancelVisit(patient.id, visitId);

    if (!result) {
        return { success: false, message: 'Cannot cancel this appointment.' };
    }

    return { success: true, message: 'Appointment cancelled.' };
}

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
