import { services } from "@/lib/services";

export default async function AdminDashboard() {
    const stats = services.admin.getPlatformStats();
    const pendingCount = stats.pendingHospitals;

    const statCards = [
        { label: "Total Hospitals", value: stats.totalHospitals, icon: "🏥", color: "#0284c7", bg: "#e0f2fe" },
        { label: "Active", value: stats.activeHospitals, icon: "✅", color: "#15803d", bg: "#f0fdf4" },
        { label: "Pending Approval", value: pendingCount, icon: "⏳", color: "#ea580c", bg: "#fff7ed" },
        { label: "Total Doctors", value: stats.totalDoctors, icon: "👨‍⚕️", color: "#7c3aed", bg: "#ede9fe" },
        { label: "Total Patients", value: stats.totalPatients, icon: "👥", color: "#0d9488", bg: "#ccfbf1" },
        { label: "Total Visits", value: stats.totalVisits, icon: "📊", color: "#0369a1", bg: "#f0f9ff" },
        { label: "Cities Covered", value: stats.cities, icon: "📍", color: "#dc2626", bg: "#fef2f2" },
    ];

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>Platform Overview</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Haspataal admin control panel</p>

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

            {/* Revenue Placeholder */}
            <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>Platform Revenue & Growth</h2>
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
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-main)" }}>Analytics Engine Coming Soon</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Revenue split operations and investor dashboards will populate here.</p>
                    </div>
                </div>
            </div>

            {pendingCount > 0 && (
                <div className="alert alert-warning" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>⚠️ {pendingCount} hospital(s) pending approval</span>
                    <a href="/admin/dashboard/hospitals" style={{ color: "var(--primary)", fontWeight: "600" }}>Review →</a>
                </div>
            )}
        </div>
    );
}
