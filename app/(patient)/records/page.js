"use client";

import { useState, useEffect } from "react";
import { Skeleton } from 'boneyard-js/react';
import RecordsList from "@/components/patient/RecordsList";

export default function RecordsPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating data fetch
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const records = [
        {
            id: "rec-1",
            type: "Prescription",
            doctor: "Dr. Arvind Sharma",
            date: "12 Oct, 2023",
            icon: "💊"
        },
        {
            id: "rec-2",
            type: "Lab Report",
            title: "Lipid Profile & Glucose",
            date: "05 Sep, 2023",
            icon: "🔬"
        },
        {
            id: "rec-3",
            type: "Invoice",
            title: "Apollo Pharmacy",
            date: "05 Sep, 2023",
            icon: "🧾"
        }
    ];

    return (
        <>
            <div className="page-header" style={{ padding: '32px 20px 24px', textAlign: 'left', background: 'var(--navy)' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Health Records</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>All your medical history in one secure place</p>
            </div>

            <div className="section" style={{ paddingTop: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Search documents..."
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                    <button style={{ background: 'var(--blue)', color: 'white', border: 'none', padding: '0 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <span>⬆️</span>
                    </button>
                </div>

                <div className="pills-scroll" style={{ marginBottom: '20px' }}>
                    <button className={`pill ${activeTab === 'all' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab('all')}>All Records</button>
                    <button className={`pill ${activeTab === 'prescriptions' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab('prescriptions')}>Prescriptions</button>
                    <button className={`pill ${activeTab === 'labs' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab('labs')}>Lab Reports</button>
                    <button className={`pill ${activeTab === 'bills' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab('bills')}>Bills</button>
                </div>

                <Skeleton name="records-list" loading={loading}>
                    <RecordsList records={records} />
                </Skeleton>
            </div>
        </>
    );
}
