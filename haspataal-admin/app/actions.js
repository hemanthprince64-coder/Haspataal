'use server'

import { services } from '@/lib/services';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

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
    redirect('/dashboard');
}

export async function logoutAdmin() {
    (await cookies()).delete('session_admin');
    redirect('/');
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
