"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from 'boneyard-js/react';
import HospitalStatsGrid from "@/components/hospital/HospitalStatsGrid";
import RecentVisitsTable from "@/components/hospital/RecentVisitsTable";

export default function HospitalDashboardClient({ user, initialHospital }) {
    const [stats, setStats] = useState({ todayVisits: 0, totalPatients: 0, totalDoctors: 0, scheduledVisits: 0, totalVisits: 0, completedVisits: 0 });
    const [recentVisits, setRecentVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real data from actions or API
        import('@/app/actions').then(({ getHospitalDashboardData }) => {
            getHospitalDashboardData(user.hospitalId).then(data => {
                setStats(data.stats);
                setRecentVisits(data.recentVisits);
                setLoading(false);
            });
        });
    }, [user.hospitalId]);

    return (
        <div className="page-enter">
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem" }}>Dashboard</h1>
                <p style={{ color: "var(--text-muted)" }}>Welcome back, {user.name} • {initialHospital?.name}</p>
            </div>

            <Skeleton name="hospital-stats-grid" loading={loading}>
                <HospitalStatsGrid stats={stats} />
            </Skeleton>

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

            <div className="card" style={{ padding: "0", overflow: "hidden", marginBottom: "2rem" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontWeight: "700" }}>Recent Visits</h3>
                    <Link href="/hospital/dashboard/reports" style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "600" }}>
                        View All →
                    </Link>
                </div>
                <Skeleton name="recent-visits-table" loading={loading}>
                    <RecentVisitsTable visits={recentVisits} />
                </Skeleton>
            </div>

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
