'use server'

import { services } from '@/lib/services';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createSession, deleteSession, decrypt } from '@/lib/session';

// ==================== ADMIN ACTIONS ====================

export async function adminLogin(prevState, formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        return { message: 'Please provide username and password.' };
    }

    const admin = await services.admin.login(username, password);
    if (!admin) {
        return { message: 'Invalid credentials.' };
    }

    await createSession('session_admin', admin);
    redirect('/dashboard');
}

export async function logoutAdmin() {
    (await cookies()).delete('session_admin');
    redirect('/');
}

export async function approveHospitalAction(prevState, formData) {
    const adminCookie = (await cookies()).get('session_admin');
    if (!adminCookie) return { message: 'Unauthorized' };

    const payload = await decrypt(adminCookie.value);
    if (!payload || payload.user?.role !== 'PLATFORM_ADMIN') {
        return { message: 'Unauthorized: Invalid session or insufficient permissions' };
    }

    const hospitalId = formData.get('hospitalId');
    const result = await services.admin.approveHospital(hospitalId);

    if (!result) {
        return { success: false, message: 'Hospital not found.' };
    }

    return { success: true, message: `${result.name} has been approved.` };
}

export async function rejectHospitalAction(prevState, formData) {
    const adminCookie = (await cookies()).get('session_admin');
    if (!adminCookie) return { message: 'Unauthorized' };

    const payload = await decrypt(adminCookie.value);
    if (!payload || payload.user?.role !== 'PLATFORM_ADMIN') {
        return { message: 'Unauthorized: Invalid session or insufficient permissions' };
    }

    const hospitalId = formData.get('hospitalId');
    const result = await services.admin.rejectHospital(hospitalId);

    if (!result) {
        return { success: false, message: 'Hospital not found.' };
    }

    return { success: true, message: `${result.name} has been rejected.` };
}

export async function suspendHospitalAction(prevState, formData) {
    const adminCookie = (await cookies()).get('session_admin');
    if (!adminCookie) return { message: 'Unauthorized' };

    const payload = await decrypt(adminCookie.value);
    if (!payload || payload.user?.role !== 'PLATFORM_ADMIN') {
        return { message: 'Unauthorized: Invalid session or insufficient permissions' };
    }

    const hospitalId = formData.get('hospitalId');
    const result = await services.admin.suspendHospital(hospitalId);

    if (!result) {
        return { success: false, message: 'Hospital not found.' };
    }

    return { success: true, message: `${result.name} has been suspended.` };
}
