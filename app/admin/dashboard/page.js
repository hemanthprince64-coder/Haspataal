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
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem"
            }}>
                {statCards.map(s => (
                    <div key={s.label} className="card" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1.25rem"
                    }}>
                        <div style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "12px",
                            background: s.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem",
                            flexShrink: 0
                        }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: "800", color: s.color }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>
                                {s.label}
                            </div>
                        </div>
                    </div>
                ))}
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
