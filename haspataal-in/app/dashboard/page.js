import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { redis } from "@/lib/redis";

export default async function HospitalDashboard() {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("session_user");

    if (!userCookie) redirect("/login");
    const user = JSON.parse(userCookie.value);
    const hospitalId = user.hospitalId;

    // Fetch constraints
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Real-time Data (Recent Visits & Hospital Info)
    // We want these fresh.
    const [hospital, recentVisitsData] = await Promise.all([
        prisma.hospital.findUnique({ where: { id: hospitalId } }),
        prisma.visit.findMany({
            where: { hospitalId },
            orderBy: { date: 'desc' },
            take: 5,
            include: { doctor: true }
        })
    ]);

    // 2. Statistics (Cached)
    let stats = null;
    const cacheKey = `dashboard:stats:${hospitalId}`;

    try {
        stats = await redis.get(cacheKey);
    } catch (e) {
        console.error("Redis Get Error:", e);
    }

    if (!stats) {
        console.log("Cache Miss: Fetching Stats from DB");
        const [
            totalVisits,
            todayVisits,
            scheduledVisits,
            completedVisits,
            totalDoctors,
            uniquePatients
        ] = await Promise.all([
            prisma.visit.count({ where: { hospitalId } }),
            prisma.visit.count({ where: { hospitalId, date: { gte: today, lt: tomorrow } } }),
            prisma.visit.count({ where: { hospitalId, status: 'PENDING' } }),
            prisma.visit.count({ where: { hospitalId, status: 'COMPLETED' } }),
            prisma.doctor.count({ where: { hospitalId } }),
            prisma.visit.groupBy({
                by: ['patientPhone'],
                where: { hospitalId },
            }),
        ]);

        stats = {
            totalVisits,
            todayVisits,
            scheduledVisits,
            completedVisits,
            totalDoctors,
            totalPatients: uniquePatients.length
        };

        try {
            await redis.set(cacheKey, stats, { ex: 60 }); // Cache for 60 seconds
        } catch (e) {
            console.error("Redis Set Error:", e);
        }
    } else {
        console.log("Cache Hit: Data from Redis");
    }

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

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                <Link href="/dashboard/billing" className="btn btn-primary">
                    ➕ New OPD Visit
                </Link>
                <Link href="/dashboard/reports" className="btn btn-outline">
                    📊 View Reports
                </Link>
                {user.role === 'ADMIN' && (
                    <Link href="/dashboard/doctors" className="btn btn-outline">
                        👨‍⚕️ Manage Doctors
                    </Link>
                )}
            </div>

            {/* Recent Visits */}
            <div className="card" style={{ padding: "0", overflow: "hidden" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontWeight: "700" }}>Recent Visits</h3>
                    <Link href="/dashboard/reports" style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "600" }}>
                        View All →
                    </Link>
                </div>
                {recentVisitsData.length === 0 ? (
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
                                {recentVisitsData.map(v => (
                                    <tr key={v.id}>
                                        <td>{new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                        <td>{v.patientName || v.patientPhone}</td>
                                        <td>{v.doctor?.name || 'Dr. Unknown'}</td>
                                        <td>
                                            <span className={`badge ${v.status === 'COMPLETED' ? 'badge-success' : v.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
