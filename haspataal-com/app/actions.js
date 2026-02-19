'use server'

import { services } from '@/lib/services';
// import { db } from '@/lib/data';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createSession, deleteSession, decrypt } from '@/lib/session';

// ==================== PATIENT ACTIONS ====================

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

    const patient = await services.patient.login(mobile, otp);
    await createSession('session_patient', patient);
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

    const patient = await services.patient.register(data);
    await createSession('session_patient', patient);

    return { success: true, message: 'Profile saved successfully!' };
}

export async function updatePatientProfile(prevState, formData) {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('session_patient');
    if (!userCookie) return { message: 'Please login first.' };
    const patient = await decrypt(userCookie.value);
    if (!patient) return { message: 'Please login first.' };

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
        await createSession('session_patient', updated);
        return { success: true, message: 'Profile updated successfully!' };
    }

    return { message: 'Failed to update profile.' };
}

export async function logoutPatient() {
    await deleteSession('session_patient');
    redirect('/');
}

export async function bookAppointment(prevState, formData) {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('session_patient');
    if (!userCookie) return { message: 'Please login to book an appointment.' };
    const patient = await decrypt(userCookie.value);
    if (!patient) return { message: 'Please login to book an appointment.' };

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
            age: patient.age || 0,
            gender: patient.gender || 'O',
            date: `${date}T${slot}`
        };

        await services.patient.createVisit(hospitalId, visitData);
        return { success: true, message: 'Appointment booked successfully!' };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

export async function cancelAppointmentPatient(prevState, formData) {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('session_patient');
    if (!userCookie) return { message: 'Please login first.' };
    const patient = await decrypt(userCookie.value);
    if (!patient) return { message: 'Please login first.' };

    const visitId = formData.get('visitId');
    const result = await services.patient.cancelVisit(patient.id, visitId);

    if (!result) {
        return { success: false, message: 'Cannot cancel this appointment.' };
    }

    return { success: true, message: 'Appointment cancelled.' };
}

export async function addReview(prevState, formData) {
    // Reviews disabled
    return { success: true, message: 'Reviews are temporarily disabled during upgrade' };
}
