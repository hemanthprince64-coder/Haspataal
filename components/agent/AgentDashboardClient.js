"use client";

import { useEffect, useState } from "react";
import { Skeleton } from 'boneyard-js/react';
import AgentStatsGrid from "@/components/agent/AgentStatsGrid";
import OnboardedHospitalsList from "@/components/agent/OnboardedHospitalsList";
import OnboardedPatientsList from "@/components/agent/OnboardedPatientsList";

export default function AgentDashboardClient({ user }) {
    const [hospitals, setHospitals] = useState([]);
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState({ totalHospitals: 0, approvedHospitals: 0, totalPatients: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getAgentDashboardData }) => {
            getAgentDashboardData(user.id).then(data => {
                setHospitals(data.hospitals);
                setPatients(data.patients);
                setStats(data.stats);
                setLoading(false);
            });
        });
    }, [user.id]);

    return (
        <div className="page-enter" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>Partner Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name}</p>
                </div>
            </div>

            <Skeleton name="agent-stats-grid" loading={loading}>
                <AgentStatsGrid stats={stats} />
            </Skeleton>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700' }}>Onboarded Hospitals</h3>
                    </div>
                    <Skeleton name="agent-hospitals-list" loading={loading}>
                        <OnboardedHospitalsList hospitals={hospitals} />
                    </Skeleton>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700' }}>Onboarded Patients</h3>
                    </div>
                    <Skeleton name="agent-patients-list" loading={loading}>
                        <OnboardedPatientsList patients={patients} />
                    </Skeleton>
                </div>
            </div>
        </div>
    );
}
