import { services } from "@/lib/services";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types";
import Link from "next/link";

export default async function DashboardPage() {
    const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], "session_user");

    const stats = await services.hospital.getStats(user.hospitalId);
    const hospital = await services.platform.getHospitalById(user.hospitalId);

    // getVisits is now completely async and awaited.
    const allVisits = await services.hospital.getVisits(user.hospitalId);
    const recentVisits = allVisits.slice(0, 5);

    const statCards = [
        { label: "Today's Visits", value: stats.todayVisits, icon: "📅", color: "#0284c7", bg: "#e0f2fe" },
        { label: "Total Patients", value: stats.totalPatients, icon: "👥", color: "#0d9488", bg: "#ccfbf1" },
        { label: "Total Doctors", value: stats.totalDoctors, icon: "👨‍⚕️", color: "#7c3aed", bg: "#ede9fe" },
        { label: "Scheduled", value: stats.scheduledVisits, icon: "⏰", color: "#ea580c", bg: "#fff7ed" },
        { label: "Total Visits", value: stats.totalVisits, icon: "📊", color: "#0369a1", bg: "#f0f9ff" },
        { label: "Completed", value: stats.completedVisits, icon: "✅", color: "#15803d", bg: "#f0fdf4" },
    ];

    return (
        <div className="page-enter">
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem" }}>Dashboard</h1>
                <p style={{ color: "var(--text-muted)" }}>Welcome back, {user.name} • {hospital?.name}</p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.5rem",
                marginBottom: "3rem"
            }}>
                {statCards.map(s => (
                    <div key={s.label} className="card card-interactive" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1.25rem",
                        padding: "1.5rem",
                        borderLeft: `4px solid ${s.color}`
                    }}>
                        <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "14px",
                            background: s.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.75rem",
                            flexShrink: 0,
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
                        }}>
                            {s.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                                {s.label}
                            </div>
                            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-main)", lineHeight: 1 }}>
                                {s.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                <Link href="/hospital/dashboard/billing" className="btn btn-primary">
                    ➕ New OPD Visit
                </Link>
                <Link href="/hospital/dashboard/reports" className="btn btn-outline">
                    📊 View Reports
                </Link>
                {user.role === 'HOSPITAL_ADMIN' && (
                    <Link href="/hospital/dashboard/doctors" className="btn btn-outline">
                        👨‍⚕️ Manage Doctors
                    </Link>
                )}
            </div>

            {/* Recent Visits */}
            <div className="card" style={{ padding: "0", overflow: "hidden", marginBottom: "2rem" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontWeight: "700" }}>Recent Visits</h3>
                    <Link href="/hospital/dashboard/reports" style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "600" }}>
                        View All →
                    </Link>
                </div>
                {recentVisits.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                        <p>No visits yet. Create your first OPD visit.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentVisits.map(v => {
                                    return (
                                        <tr key={v.id}>
                                            <td>{new Date(v.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                            <td>{v.patientId}</td>
                                            <td>{v.doctorId}</td>
                                            <td>
                                                <span className={`badge ${v.status === 'COMPLETED' ? 'badge-success' : v.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                                                    {v.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Revenue Placeholder */}
            <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>Earnings & Revenue</h2>
                <div className="card" style={{
                    height: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--bg-card)",
                    backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
                    backgroundSize: "20px 20px"
                }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💰</div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-main)" }}>Revenue Dashboard Coming Soon</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Track OPD income, platform fees, and settlements here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
