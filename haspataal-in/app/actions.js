'use server'

import { services } from '@/lib/services';
import { db } from '@/lib/data';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { sendSMS } from '@/lib/notifications';
import { logAction } from "@/lib/audit";

// ==================== HOSPITAL ACTIONS ====================

export async function loginAction(prevState, formData) {
    const mobile = formData.get('mobile');
    const password = formData.get('password');

    if (!mobile || !password) {
        return { message: 'Please enter both mobile and password.' };
    }

    try {
        await signIn('credentials', {
            mobile,
            password,
            redirect: false,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { message: 'Invalid credentials.' };
                default:
                    return { message: 'Something went wrong.' };
            }
        }
        throw error;
    }

    // Check session to determine redirect
    // Check session to determine redirect
    const session = await auth();

    if (session?.user) {
        await logAction(session.user.id, 'LOGIN', 'User', session.user.id, { role: session.user.role });
    }

    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'HOSPITAL_ADMIN') {
        redirect('/dashboard');
    } else if (session?.user?.role === 'DOCTOR') {
        redirect('/dashboard/doctor'); // New Doctor Dashboard
    } else {
        redirect('/'); // Patients
    }
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

    const lat = parseFloat(formData.get('lat') || '0');
    const lng = parseFloat(formData.get('lng') || '0');

    try {
        const newHospital = await prisma.hospital.create({
            data: {
                name,
                city,
                phone: mobile,
                password,
                lat: lat !== 0 ? lat : null,
                lng: lng !== 0 ? lng : null,
                status: 'PENDING'
            }
        });

        // Log Registration (System user or Pending user?)
        // Since no user is logged in, we use 'SYSTEM' or the new ID
        await logAction(newHospital.id, 'REGISTER_HOSPITAL', 'Hospital', newHospital.id, { name, city });

        return { success: true, message: 'Registration submitted! Pending approval.' };
    } catch (error) {
        if (error.code === 'P2002') {
            return { message: 'A hospital with this mobile number already exists.' };
        }
        return { message: 'Registration failed.' };
    }
}

export async function logoutHospital() {
    await signOut({ redirectTo: '/login' });
}

export async function createVisitAction(prevState, formData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') return { message: 'Unauthorized' };
    const user = session.user;

    const patientName = formData.get('patientName');
    const patientMobile = formData.get('patientMobile');
    const doctorId = formData.get('doctorId');
    const age = formData.get('age');
    const gender = formData.get('gender');

    if (!patientName || !patientMobile || !doctorId) {
        return { success: false, message: 'All required fields must be filled.' };
    }

    try {
        // 1. Upsert Patient
        const patient = await prisma.patient.upsert({
            where: { phone: patientMobile },
            update: { name: patientName },
            create: {
                name: patientName,
                phone: patientMobile,
                password: 'password123'
            }
        });

        // 2. Create Appointment (COMPLETED)
        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: doctorId,
                date: new Date(),
                slot: 'OPD-WALKIN',
                status: 'COMPLETED',
                notes: `Age: ${age}, Gender: ${gender}`
            }
        });

        // 3. Create Visit
        const visit = await prisma.visit.create({
            data: {
                hospitalId: user.hospitalId,
                appointmentId: appointment.id,
                patientName: patientName,
                patientPhone: patientMobile,
                amount: 500
            }
        });

        // Send Notification
        await sendSMS(patientMobile, `Welcome to ${user.name}. Your OPD Visit ID is ${visit.id.slice(0, 8)}. Please wait for your turn.`);

        return { success: true, message: `Visit #${visit.id.slice(0, 8)} created successfully!` };

    } catch (e) {
        console.error('Create Visit Error:', e);
        return { success: false, message: 'Failed to create visit.' };
    }
}

export async function cancelVisitHospital(prevState, formData) {
    const session = await auth();
    if (!session?.user) return { message: 'Unauthorized' };
    const user = session.user;

    const visitId = formData.get('visitId');
    const result = services.hospital.cancelVisit(user.hospitalId, visitId);
    if (!result) return { success: false, message: 'Visit not found or already cancelled.' };
    return { success: true, message: 'Visit cancelled successfully.' };
}

export async function completeVisitHospital(prevState, formData) {
    const session = await auth();
    if (!session?.user) return { message: 'Unauthorized' };
    const user = session.user;

    const visitId = formData.get('visitId');
    const result = services.hospital.completeVisit(user.hospitalId, visitId);
    if (!result) return { success: false, message: 'Visit not found.' };
    return { success: true, message: 'Visit marked as completed.' };
}

export async function addDoctorAction(prevState, formData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') return { message: 'Unauthorized' };
    const user = session.user;

    const name = formData.get('name');
    const mobile = formData.get('mobile');
    const speciality = formData.get('speciality');
    const experience = parseInt(formData.get('experience') || '0');
    const fee = parseInt(formData.get('fee') || '500');
    const password = formData.get('password') || '123';

    if (!name || !mobile || !speciality) {
        return { success: false, message: 'Name, mobile, and speciality are required.' };
    }

    try {
        const newDoctor = await prisma.doctor.create({
            data: {
                name,
                mobile,
                specialty: speciality,
                experience,
                fee,
                password,
                hospitalId: user.hospitalId,
                qualification: `${experience} years exp`
            }
        });

        await logAction(user.id, 'ADD_DOCTOR', 'Doctor', newDoctor.id, { name, speciality });
        return { success: true, message: `Dr. ${name} added successfully!` };
    } catch (error) {
        console.error('Add Doctor Error:', error);
        if (error.code === 'P2002') return { message: 'A doctor with this mobile number already exists.' };
        return { success: false, message: 'Failed to add doctor.' };
    }
}

export async function removeDoctorAction(prevState, formData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') return { message: 'Unauthorized' };
    const user = session.user;

    const doctorId = formData.get('doctorId');

    try {
        await prisma.doctor.delete({
            where: {
                id: doctorId,
                hospitalId: user.hospitalId
            }
        });
        return { success: true, message: 'Doctor removed successfully.' };
    } catch (error) {
        console.error('Remove Doctor Error:', error);
        return { success: false, message: 'Failed to remove doctor.' };
    }
}
export async function approveHospitalAction(formData) {
    const id = formData.get('id');
    await prisma.hospital.update({
        where: { id },
        data: { status: 'APPROVED' }
    });
    redirect('/admin'); // Refresh page
}

export async function rejectHospitalAction(formData) {
    const id = formData.get('id');
    await prisma.hospital.update({
        where: { id },
        data: { status: 'REJECTED' } // Or delete?
    });
    redirect('/admin');
}

// ==================== DOCTOR ACTIONS ====================

export async function updateAppointmentStatus(formData) {
    const session = await auth();
    if (!session || session.user.role !== 'DOCTOR') return { message: 'Unauthorized' };

    const appointmentId = formData.get('appointmentId');
    const status = formData.get('status');

    try {
        // Verify ownership
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        });

        if (!appointment || appointment.doctorId !== session.user.id) {
            return { message: 'Unauthorized access to this appointment.' };
        }

        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: status }
        });

        await logAction(session.user.id, 'UPDATE_APPOINTMENT_STATUS', 'Appointment', appointmentId, { status });

        // Revalidate? For now, standard server action redirect refreshes the page
        return { success: true };
    } catch (e) {
        console.error("Update Status Error", e);
        return { message: 'Failed to update status' };
    }
}
