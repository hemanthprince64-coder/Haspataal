import { services } from '@/lib/services';
import { requireRole } from '@/lib/auth/requireRole';
import { UserRole } from '@/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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

    const { hospitals, patients, stats } = await services.agent.getDashboardData(user.id);

    return (
        <div className="page-enter" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>Partner Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Hospitals Onboarded</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.totalHospitals}</div>
                </div>
                <div className="card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Approved Hospitals</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>{stats.approvedHospitals}</div>
                </div>
                <div className="card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Patients Onboarded</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>{stats.totalPatients}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Hospitals List */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700' }}>Onboarded Hospitals</h3>
                    </div>

                    {hospitals.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem 0' }}>
                            <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🏥</div>
                            <p className="empty-state-text">No hospitals onboarded yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {hospitals.map(h => (
                                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{h.legalName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(h.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <span className={`badge badge-${h.verificationStatus === 'VERIFIED' ? 'success' : h.verificationStatus === 'REJECTED' ? 'danger' : 'warning'}`}>
                                        {h.verificationStatus}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Patients List */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700' }}>Onboarded Patients</h3>
                    </div>

                    {patients.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem 0' }}>
                            <div className="empty-state-icon" style={{ fontSize: '2rem' }}>👥</div>
                            <p className="empty-state-text">No patients onboarded yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {patients.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
