"use client";

import { useEffect, useState } from "react";
import { Skeleton } from 'boneyard-js/react';
import AdminStatsGrid from "@/components/admin/AdminStatsGrid";
import PlatformGrowthCard from "@/components/admin/PlatformGrowthCard";

export default function AdminDashboardClient() {
    const [stats, setStats] = useState({ 
        totalHospitals: 0, 
        activeHospitals: 0, 
        pendingHospitals: 0, 
        totalDoctors: 0, 
        totalPatients: 0, 
        totalVisits: 0, 
        cities: 0 
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getAdminDashboardData }) => {
            getAdminDashboardData().then(data => {
                setStats(data.stats);
                setLoading(false);
            });
        });
    }, []);

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem" }}>Platform Overview</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Haspataal admin control panel</p>

            <Skeleton name="admin-stats-grid" loading={loading}>
                <AdminStatsGrid stats={stats} />
            </Skeleton>

            <div style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>Platform Revenue & Growth</h2>
                <Skeleton name="platform-growth-card" loading={loading}>
                    <PlatformGrowthCard />
                </Skeleton>
            </div>

            {stats.pendingHospitals > 0 && !loading && (
                <div className="alert alert-warning" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>⚠️ {stats.pendingHospitals} hospital(s) pending approval</span>
                    <a href="/admin/dashboard/hospitals" style={{ color: "var(--primary)", fontWeight: "600" }}>Review →</a>
                </div>
            )}
        </div>
    );
}
