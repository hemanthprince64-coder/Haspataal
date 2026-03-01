"use client";

import Link from "next/link";
import { useState } from "react";

export default function LabTestsPage() {
    const [activeTab, setActiveTab] = useState("packages");

    const packages = [
        {
            id: "pkg-1",
            name: "Comprehensive Full Body Checkup",
            includes: "82 parameters (CBC, Lipid, Thyroid, LFT, KFT)",
            price: 1499,
            originalPrice: 2999,
            discount: "50% OFF",
            tag: "Best Seller"
        },
        {
            id: "pkg-2",
            name: "Advanced Heart Care Package",
            includes: "ECG, Lipid Profile, Blood Sugar, HbA1c",
            price: 899,
            originalPrice: 1500,
            discount: "40% OFF"
        }
    ];

    return (
        <>
            <div className="page-header" style={{ padding: '32px 20px 24px', textAlign: 'left', background: 'var(--navy)' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Diagnostics</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>Book lab tests from trusted NABL certified labs</p>
            </div>

            <div className="section" style={{ paddingTop: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Search for tests or packages..."
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                </div>

                <div className="pills-scroll" style={{ marginBottom: '20px' }}>
                    <button className={`pill ${activeTab === 'packages' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab('packages')}>Health Packages</button>
                    <button className={`pill ${activeTab === 'blood' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab('blood')}>Blood Tests</button>
                    <button className={`pill ${activeTab === 'imaging' ? 'pill-active' : 'pill-inactive'}`} onClick={() => setActiveTab('imaging')}>Imaging (X-Ray/MRI)</button>
                </div>

                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Popular Packages</h3>
                <div>
                    {packages.map(pkg => (
                        <div key={pkg.id} className="card" style={{ marginBottom: '16px', position: 'relative' }}>
                            {pkg.tag && (
                                <div style={{ position: 'absolute', top: 0, right: 16, background: 'var(--amber)', color: 'white', padding: '4px 12px', fontSize: '10px', fontWeight: 'bold', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                                    {pkg.tag}
                                </div>
                            )}
                            <h3 style={{ fontSize: '16px', color: 'var(--navy)', marginBottom: '8px', paddingRight: pkg.tag ? '80px' : '0' }}>{pkg.name}</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Includes {pkg.includes}</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text)' }}>₹{pkg.price}</span>
                                        <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--grey3)' }}>₹{pkg.originalPrice}</span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold' }}>{pkg.discount}</span>
                                </div>
                                <button className="btn btn-primary" style={{ padding: '8px 24px', borderRadius: '12px' }}>Book Fast</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
