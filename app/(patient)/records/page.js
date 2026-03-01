"use client";

import Link from "next/link";
import { useState } from "react";

export default function RecordsPage() {
    const [activeTab, setActiveTab] = useState("all");

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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {records.map(rec => (
                        <div key={rec.id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'var(--blue-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                {rec.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{rec.type}</div>
                                <h4 style={{ fontSize: '15px', margin: '0 0 4px 0', fontFamily: 'var(--font-sans)', color: 'var(--navy)' }}>{rec.title || rec.doctor}</h4>
                                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{rec.date}</div>
                            </div>
                            <button style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--grey3)', cursor: 'pointer' }}>
                                ⋮
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
