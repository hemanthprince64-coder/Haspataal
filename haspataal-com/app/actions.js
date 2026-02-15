'use server'

import { services } from '@/lib/services';
import { db } from '@/lib/data';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

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

    const patient = services.patient.login(mobile, otp);
    (await cookies()).set('session_patient', JSON.stringify(patient));
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

    const patient = services.patient.register(data);
    (await cookies()).set('session_patient', JSON.stringify(patient));

    return { success: true, message: 'Profile saved successfully!' };
}

export async function updatePatientProfile(prevState, formData) {
    const userCookie = (await cookies()).get('session_patient');
    if (!userCookie) return { message: 'Please login first.' };
    const patient = JSON.parse(userCookie.value);

    const updates = {
        name: formData.get('name'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        bloodGroup: formData.get('bloodGroup'),
        city: formData.get('city'),
        email: formData.get('email'),
    };

    const updated = services.patient.updateProfile(patient.id, updates);
    if (updated) {
        (await cookies()).set('session_patient', JSON.stringify(updated));
        return { success: true, message: 'Profile updated successfully!' };
    }

    return { message: 'Failed to update profile.' };
}

export async function logoutPatient() {
    (await cookies()).delete('session_patient');
    redirect('/');
}

export async function bookAppointment(prevState, formData) {
    const userCookie = (await cookies()).get('session_patient');
    if (!userCookie) return { message: 'Please login to book an appointment.' };
    const patient = JSON.parse(userCookie.value);

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

        services.hospital.createVisit(hospitalId, visitData);
        return { success: true, message: 'Appointment booked successfully!' };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

export async function cancelAppointmentPatient(prevState, formData) {
    const userCookie = (await cookies()).get('session_patient');
    if (!userCookie) return { message: 'Please login first.' };
    const patient = JSON.parse(userCookie.value);

    const visitId = formData.get('visitId');
    const result = services.patient.cancelVisit(patient.id, visitId);

    if (!result) {
        return { success: false, message: 'Cannot cancel this appointment.' };
    }

    return { success: true, message: 'Appointment cancelled.' };
}

export async function addReview(prevState, formData) {
    const userCookie = (await cookies()).get('session_patient');
    if (!userCookie) return { message: 'Please login to leave a review.' };
    const patient = JSON.parse(userCookie.value);

    const hospitalId = formData.get('hospitalId');
    const rating = parseInt(formData.get('rating'));
    const comment = formData.get('comment');

    if (!hospitalId || !rating) {
        return { success: false, message: 'Please provide a rating.' };
    }

    const review = {
        id: `r_${Date.now()}`,
        hospitalId,
        patientMobile: patient.mobile,
        rating,
        comment: comment || '',
        date: new Date().toISOString().split('T')[0],
    };

    db.reviews.push(review);
    return { success: true, message: 'Review submitted! Thank you.' };
}
