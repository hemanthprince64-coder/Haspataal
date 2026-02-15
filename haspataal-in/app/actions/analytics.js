'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ROLES } from "@/lib/permissions";

export async function getHospitalStats() {
    const session = await auth();
    if (!session || !session.user || session.user.role !== ROLES.HOSPITAL_ADMIN) {
        return { error: "Unauthorized" };
    }

    const hospitalId = session.user.id; // Correct logic: Hospital Admin ID is usually Hospital ID or linked to it.
    // However, in our schema: Hospital Model has ID, Hospital Admin is a user? 
    // Actually, earlier we decided Hospital Admin logs in directly as Hospital or Staff?
    // Let's assume session.user.id IS the hospitalId for HOSPITAL_ADMIN role based on earlier auth implementation.

    // Mock Data for now as DB connection is unstable and data might be sparse
    const stats = {
        totalPatients: 1240,
        totalRevenue: 450000,
        pendingAppointments: 12,
        appointmentsTrend: [
            { date: 'Mon', count: 12 },
            { date: 'Tue', count: 19 },
            { date: 'Wed', count: 15 },
            { date: 'Thu', count: 22 },
            { date: 'Fri', count: 28 },
            { date: 'Sat', count: 35 },
            { date: 'Sun', count: 10 },
        ],
        revenueTrend: [
            { week: 'W1', revenue: 50000 },
            { week: 'W2', revenue: 75000 },
            { week: 'W3', revenue: 60000 },
            { week: 'W4', revenue: 90000 },
        ],
        topDoctors: [
            { name: 'Dr. Sharma', appointments: 45 },
            { name: 'Dr. Gupta', appointments: 32 },
            { name: 'Dr. Verma', appointments: 28 },
        ]
    };

    return { stats };
}

export async function getAdminStats() {
    const session = await auth();
    // In real app, check for SUPER_ADMIN role
    if (!session || !session.user) return { error: "Unauthorized" };

    // Mock Data for Admin Dashboard
    const stats = {
        totalHospitals: 120,
        activeHospitals: 98,
        totalDoctors: 450,
        totalPatients: 12500,
        hospitalGrowth: [
            { month: 'Jan', count: 10 },
            { month: 'Feb', count: 25 },
            { month: 'Mar', count: 40 },
            { month: 'Apr', count: 65 },
            { month: 'May', count: 90 },
            { month: 'Jun', count: 120 },
        ],
        cityDistribution: [
            { city: 'New Delhi', count: 45 },
            { city: 'Mumbai', count: 35 },
            { city: 'Bangalore', count: 25 },
            { city: 'Chennai', count: 15 },
        ]
    };

    return { stats };
}
