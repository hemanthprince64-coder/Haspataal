"use client";

import Link from "next/link";
import { useState } from "react";

export default function TrackerPage() {
    const [week, setWeek] = useState(24);

    return (
        <>
            <div className="page-header" style={{ padding: '32px 20px 24px', textAlign: 'left', background: 'var(--navy)' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Pregnancy Tracker</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>Week {week} • Trimester 2</p>
            </div>

            <div className="section" style={{ paddingTop: '16px' }}>
                <div className="card" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px', background: 'linear-gradient(135deg, var(--teal-pale) 0%, white 100%)', border: '1px solid var(--teal-light)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>👶</div>
                    <h2 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '8px' }}>Your baby is the size of a Cantaloupe!</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text3)', margin: 0 }}>Approx. 30cm long • 600g weight</p>
                </div>

                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>This Week's Checklist</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--teal)' }}></div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--text)' }}>Schedule Glucose Screening</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text3)', margin: 0 }}>Between weeks 24-28</p>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--grey3)' }}></div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--text)' }}>Start counting baby kicks</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text3)', margin: 0 }}>Daily monitoring recommended</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center', background: 'var(--blue-light)', border: 'none' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--blue)' }}>Next Scan</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>In 2 weeks</div>
                    </div>
                    <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center', background: 'var(--amber-light)', border: 'none' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚖️</div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--amber)' }}>Weight Log</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>+ 6.2 kg total</div>
                    </div>
                </div>
            </div>
        </>
    );
}
