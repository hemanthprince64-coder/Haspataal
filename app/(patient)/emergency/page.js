"use client";

import Link from "next/link";
import { useState } from "react";

export default function EmergencyPage() {
    const [calling, setCalling] = useState(false);

    return (
        <div style={{ background: 'var(--red)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ padding: '32px 20px 24px', textAlign: 'left', background: 'transparent', border: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                    <Link href="/home" style={{ color: 'white', textDecoration: 'none', fontSize: '24px' }}>←</Link>
                    <h1 style={{ fontSize: '24px', margin: 0, color: 'white' }}>Emergency SOS</h1>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>

                <div
                    onClick={() => setCalling(true)}
                    style={{
                        width: '200px', height: '200px', borderRadius: '50%', background: 'white',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 0 20px rgba(255,255,255,0.2), 0 0 0 40px rgba(255,255,255,0.1)',
                        cursor: 'pointer', marginBottom: '40px',
                        animation: calling ? 'pulse 1s infinite' : 'none'
                    }}
                >
                    <div style={{ fontSize: '64px', marginBottom: '8px' }}>🚑</div>
                    <div style={{ color: 'var(--red)', fontWeight: '900', fontSize: '20px' }}>{calling ? 'Calling...' : 'TAP TO CALL'}</div>
                </div>

                <p style={{ color: 'white', textAlign: 'center', fontSize: '16px', opacity: 0.9, marginBottom: '40px' }}>
                    An ambulance from the nearest network hospital will be dispatched immediately.
                </p>

                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '16px' }}>Emergency Contacts</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', color: 'var(--navy)' }}>National Ambulance</div>
                            <div style={{ color: 'var(--text3)', fontSize: '12px' }}>Government Service</div>
                        </div>
                        <a href="tel:108" style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>108</a>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px', borderRadius: '12px' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', color: 'var(--navy)' }}>Apollo Hospital ER</div>
                            <div style={{ color: 'var(--text3)', fontSize: '12px' }}>Nearest Active ER (2.4km)</div>
                        </div>
                        <a href="tel:1066" style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>1066</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
