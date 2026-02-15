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
    redirect('/dashboard');
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
    redirect('/login');
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
