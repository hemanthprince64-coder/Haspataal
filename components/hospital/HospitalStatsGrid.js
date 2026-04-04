export default function HospitalStatsGrid({ stats }) {
    const statCards = [
        { label: "Today's Visits", value: stats.todayVisits, icon: "📅", color: "#0284c7", bg: "#e0f2fe" },
        { label: "Total Patients", value: stats.totalPatients, icon: "👥", color: "#0d9488", bg: "#ccfbf1" },
        { label: "Total Doctors", value: stats.totalDoctors, icon: "👨‍⚕️", color: "#7c3aed", bg: "#ede9fe" },
        { label: "Scheduled", value: stats.scheduledVisits, icon: "⏰", color: "#ea580c", bg: "#fff7ed" },
        { label: "Total Visits", value: stats.totalVisits, icon: "📊", color: "#0369a1", bg: "#f0f9ff" },
        { label: "Completed", value: stats.completedVisits, icon: "✅", color: "#15803d", bg: "#f0fdf4" },
    ];

    return (
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
    );
}
