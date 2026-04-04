import { services } from '@/lib/services';
import { requireRole } from '@/lib/auth/requireRole';
import { UserRole } from '@/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import LabDashboardClient from "@/components/hospital/LabDashboardClient";

export default async function LabDashboard() {
    let user;
    try {
        user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
    } catch (e) {
        redirect('/hospital/login');
    }

    const hospital = await services.admin.getHospitalById(user.hospitalId);

    // Verify it's actually a lab
    if (hospital.type !== 'DIAGNOSTIC_CENTER') {
        return (
            <div className="page-enter" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <h2 style={{ marginBottom: '1rem', fontWeight: '800' }}>Invalid Access</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        This account is not registered as a diagnostic center.
                    </p>
                </div>
            </div>
        );
    }

    if (hospital.verificationStatus === 'pending') {
        return (
            <div className="page-enter" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <h2 style={{ marginBottom: '1rem', fontWeight: '800' }}>Account Pending Approval</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Your lab account is currently being reviewed by an administrator. You will be able to access the dashboard once approved.
                    </p>
                </div>
            </div>
        );
    }

    return <LabDashboardClient hospital={hospital} user={user} />;
}
