import { services } from '@/lib/services';
import { requireRole } from '@/lib/auth/requireRole';
import { UserRole } from '@/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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

    const catalog = await services.hospital.getDiagnosticCatalog(user.hospitalId);
    const orders = await services.hospital.getLabOrders(user.hospitalId);

    return (
        <div className="page-enter" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>{hospital.legalName} Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Diagnostics Management Portal</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Lab Orders</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{orders.length}</div>
                </div>
                <div className="card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Catalog Items</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>{catalog.length}</div>
                </div>
                <div className="card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Patients</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)' }}>{new Set(orders.map(o => o.patientId)).size}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Recent Orders List */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700' }}>Recent Test Orders</h3>
                    </div>

                    {orders.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem 0' }}>
                            <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🧪</div>
                            <p className="empty-state-text">No test orders received yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.slice(0, 10).map(o => (
                                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Order #{o.id.substring(0, 8)}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Patient: {o.patient?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {o.status} | Total: ₹{o.totalAmount}</div>
                                    </div>
                                    <button className="btn btn-sm btn-outline">View Details</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Catalog Overview List */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700' }}>Test Catalog Overview</h3>
                        <button className="btn btn-sm btn-primary">Manage</button>
                    </div>

                    {catalog.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem 0' }}>
                            <div className="empty-state-icon" style={{ fontSize: '2rem' }}>📋</div>
                            <p className="empty-state-text">Catalog is empty. Add tests to start receiving orders.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {catalog.map(c => (
                                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{c.category?.name || 'Test Item'}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available</div>
                                    </div>
                                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{c.price}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
