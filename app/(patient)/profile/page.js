"use client";

import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
    const user = {
        name: "Ravi Kumar",
        phone: "+91 98765 43210",
        email: "ravi.kumar@example.com",
        bloodGroup: "O+",
        dob: "14 Aug 1990"
    };

    return (
        <>
            <div className="page-header" style={{ padding: '32px 20px 60px', textAlign: 'center', background: 'var(--navy)' }}>
                <h1 style={{ fontSize: '20px', margin: 0, color: 'white' }}>Profile</h1>
            </div>

            <div className="section" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
                <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
                        {user.name.charAt(0)}
                    </div>
                    <h2 style={{ fontSize: '20px', margin: '0 0 4px 0', fontFamily: 'var(--font-serif)' }}>{user.name}</h2>
                    <p style={{ color: 'var(--text3)', margin: '0 0 16px 0', fontSize: '14px' }}>{user.phone}</p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>🩸 {user.bloodGroup}</span>
                        <span style={{ background: 'var(--grey1)', color: 'var(--text2)', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>🎂 {user.dob}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    <Link href="/records" className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '20px' }}>📋</span>
                            <span style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '500' }}>Medical Records</span>
                        </div>
                        <span style={{ color: 'var(--grey3)' }}>→</span>
                    </Link>

                    <Link href="/family" className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '20px' }}>👨‍👩‍👧‍👦</span>
                            <span style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '500' }}>Family Members</span>
                        </div>
                        <span style={{ color: 'var(--grey3)' }}>→</span>
                    </Link>

                    <Link href="/payments" className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '20px' }}>💳</span>
                            <span style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '500' }}>Payment Methods</span>
                        </div>
                        <span style={{ color: 'var(--grey3)' }}>→</span>
                    </Link>

                    <Link href="/settings" className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '20px' }}>⚙️</span>
                            <span style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '500' }}>Settings</span>
                        </div>
                        <span style={{ color: 'var(--grey3)' }}>→</span>
                    </Link>
                </div>

                <button className="btn btn-outline" style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '15px', color: 'var(--red)', borderColor: 'var(--red-light)', background: 'var(--red-light)' }}>
                    Log Out
                </button>
            </div>
        </>
    );
}
