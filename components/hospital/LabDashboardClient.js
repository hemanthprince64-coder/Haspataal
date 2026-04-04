"use client";

import { useEffect, useState } from "react";
import { Skeleton } from 'boneyard-js/react';
import LabStatsGrid from "@/components/hospital/LabStatsGrid";
import LabOrdersList from "@/components/hospital/LabOrdersList";
import LabCatalogOverview from "@/components/hospital/LabCatalogOverview";

export default function LabDashboardClient({ hospital, user }) {
    const [catalog, setCatalog] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getLabDashboardData }) => {
            getLabDashboardData(user.hospitalId).then(data => {
                setCatalog(data.catalog);
                setOrders(data.orders);
                setLoading(false);
            });
        });
    }, [user.hospitalId]);

    const activePatientCount = new Set(orders.map(o => o.patientId)).size;

    return (
        <div className="page-enter" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>{hospital.legalName} Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Diagnostics Management Portal</p>
                </div>
            </div>

            <Skeleton name="lab-stats-grid" loading={loading}>
                <LabStatsGrid orderCount={orders.length} catalogCount={catalog.length} patientCount={activePatientCount} />
            </Skeleton>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700' }}>Recent Test Orders</h3>
                    </div>
                    <Skeleton name="lab-orders-list" loading={loading}>
                        <LabOrdersList orders={orders} />
                    </Skeleton>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700' }}>Test Catalog Overview</h3>
                        <button className="btn btn-sm btn-primary">Manage</button>
                    </div>
                    <Skeleton name="lab-catalog-overview" loading={loading}>
                        <LabCatalogOverview catalog={catalog} />
                    </Skeleton>
                </div>
            </div>
        </div>
    );
}
