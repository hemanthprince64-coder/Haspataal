'use server'

import { services } from '@/lib/services';
import { db } from '@/lib/data';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// ==================== HOSPITAL ACTIONS ====================

export async function loginHospital(prevState, formData) {
    const mobile = formData.get('mobile');
    const password = formData.get('password');

    if (!mobile || !password) {
        return { message: 'Please enter both mobile and password.' };
    }

    const user = services.hospital.login(mobile, password);

    if (!user) {
        return { message: 'Invalid credentials.' };
    }

    (await cookies()).set('session_user', JSON.stringify(user));
    redirect('/hospital/dashboard');
}

export async function registerHospital(prevState, formData) {
    const name = formData.get('hospitalName');
    const city = formData.get('city');
    const adminName = formData.get('adminName');
    const mobile = formData.get('mobile');
    const password = formData.get('password');

    if (!name || !city || !adminName || !mobile || !password) {
        return { message: 'All fields are required.' };
    }

    const hId = `h_${Date.now()}`;
    const newHospital = { id: hId, name, city, area: city, status: 'PENDING', rating: 0, image: '🏥' };

    const uId = `u_${Date.now()}`;
    const newUser = {
        id: uId,
        mobile,
        name: adminName,
        role: 'ADMIN',
        hospitalId: hId,
        password
    };

    db.hospitals.push(newHospital);
    db.users.push(newUser);

    return { success: true, message: 'Registration submitted! Your hospital is pending approval by the platform admin.' };
}

export async function logoutHospital() {
    (await cookies()).delete('session_user');
    redirect('/hospital/login');
}

export async function createVisitAction(prevState, formData) {
    const userCookie = (await cookies()).get('session_user');
    if (!userCookie) return { message: 'Unauthorized' };
    const user = JSON.parse(userCookie.value);

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

        services.hospital.createVisit(user.hospitalId, visitData);
        return { success: true, message: 'Visit created successfully!' };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

export async function cancelVisitHospital(prevState, formData) {
    const userCookie = (await cookies()).get('session_user');
    if (!userCookie) return { message: 'Unauthorized' };
    const user = JSON.parse(userCookie.value);

    const visitId = formData.get('visitId');
    const result = services.hospital.cancelVisit(user.hospitalId, visitId);

    if (!result) {
        return { success: false, message: 'Visit not found or already cancelled.' };
    }

    return { success: true, message: 'Visit cancelled successfully.' };
}

export async function completeVisitHospital(prevState, formData) {
    const userCookie = (await cookies()).get('session_user');
    if (!userCookie) return { message: 'Unauthorized' };
    const user = JSON.parse(userCookie.value);

    const visitId = formData.get('visitId');
    const result = services.hospital.completeVisit(user.hospitalId, visitId);

    if (!result) {
        return { success: false, message: 'Visit not found.' };
    }

    return { success: true, message: 'Visit marked as completed.' };
}

export async function addDoctorAction(prevState, formData) {
    const userCookie = (await cookies()).get('session_user');
    if (!userCookie) return { message: 'Unauthorized' };
    const user = JSON.parse(userCookie.value);

    if (user.role !== 'ADMIN') {
        return { success: false, message: 'Only admins can add doctors.' };
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

    services.hospital.addDoctor(user.hospitalId, doctorData);
    return { success: true, message: `Dr. ${doctorData.name} added successfully!` };
}

export async function removeDoctorAction(prevState, formData) {
    const userCookie = (await cookies()).get('session_user');
    if (!userCookie) return { message: 'Unauthorized' };
    const user = JSON.parse(userCookie.value);

    if (user.role !== 'ADMIN') {
        return { success: false, message: 'Only admins can remove doctors.' };
    }

    const doctorId = formData.get('doctorId');
    const result = services.hospital.removeDoctor(user.hospitalId, doctorId);

    if (!result) {
        return { success: false, message: 'Doctor not found.' };
    }

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

// ==================== ADMIN ACTIONS ====================

export async function adminLogin(prevState, formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        return { message: 'Please provide username and password.' };
    }

    const admin = services.admin.login(username, password);
    if (!admin) {
        return { message: 'Invalid credentials.' };
    }

    (await cookies()).set('session_admin', JSON.stringify(admin));
    redirect('/admin/dashboard');
}

export async function logoutAdmin() {
    (await cookies()).delete('session_admin');
    redirect('/admin');
}

export async function approveHospitalAction(prevState, formData) {
    const adminCookie = (await cookies()).get('session_admin');
    if (!adminCookie) return { message: 'Unauthorized' };

    const hospitalId = formData.get('hospitalId');
    const result = services.admin.approveHospital(hospitalId);

    if (!result) {
        return { success: false, message: 'Hospital not found.' };
    }

    return { success: true, message: `${result.name} has been approved.` };
}

export async function rejectHospitalAction(prevState, formData) {
    const adminCookie = (await cookies()).get('session_admin');
    if (!adminCookie) return { message: 'Unauthorized' };

    const hospitalId = formData.get('hospitalId');
    const result = services.admin.rejectHospital(hospitalId);

    if (!result) {
        return { success: false, message: 'Hospital not found.' };
    }

    return { success: true, message: `${result.name} has been rejected.` };
}

export async function suspendHospitalAction(prevState, formData) {
    const adminCookie = (await cookies()).get('session_admin');
    if (!adminCookie) return { message: 'Unauthorized' };

    const hospitalId = formData.get('hospitalId');
    const result = services.admin.suspendHospital(hospitalId);

    if (!result) {
        return { success: false, message: 'Hospital not found.' };
    }

    return { success: true, message: `${result.name} has been suspended.` };
}
