import { services } from '@/lib/services';
import { requireRole } from '@/lib/auth/requireRole';
import { UserRole } from '@/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import AgentDashboardClient from "@/components/agent/AgentDashboardClient";

export default async function AgentDashboard() {
    let user;
    try {
        user = await requireRole(UserRole.AGENT, 'session_agent');
    } catch (e) {
        redirect('/agent/login');
    }

    if (user.status !== 'ACTIVE') {
        return (
            <div className="page-enter" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <h2 style={{ marginBottom: '1rem', fontWeight: '800' }}>Account Pending Approval</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Your partner account is currently being reviewed by an administrator. You will be able to access the dashboard once approved.
                    </p>
                </div>
            </div>
        );
    }

    return <AgentDashboardClient user={user} />;
}
