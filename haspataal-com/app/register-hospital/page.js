'use client'

import { useState } from 'react';
import { registerHospital } from '@/app/actions-onboarding';
import Link from 'next/link';

export default function RegisterHospitalPage() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData) {
        setLoading(true);
        setMessage('');

        const result = await registerHospital(null, formData);

        if (result?.success) {
            setMessage(`✅ ${result.message}`);
        } else {
            setMessage(`❌ ${result?.message || 'Registration failed.'}`);
        }
        setLoading(false);
    }

    return (
        <main className="container page-enter" style={{ maxWidth: '600px', padding: '2rem 1rem', margin: '0 auto' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                    🏥 Register Hospital
                </h1>

                {message && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        borderRadius: '8px',
                        background: message.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                        color: message.startsWith('✅') ? '#047857' : '#b91c1c',
                        fontWeight: '500'
                    }}>
                        {message}
                    </div>
                )}

                <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <section>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>Organization Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Legal Name</label>
                                <input type="text" name="legalName" required className="form-input" placeholder="e.g. Apollo Hospitals Enterprise Ltd" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Registration Number</label>
                                <input type="text" name="registrationNumber" required className="form-input" placeholder="e.g. REG-2024-001" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>City</label>
                                <select name="city" required className="form-input">
                                    <option value="">Select City</option>
                                    <option value="Mumbai">Mumbai</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Bangalore">Bangalore</option>
                                    <option value="Pune">Pune</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>Facilities</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>OT Count</label>
                                <input type="number" name="otCount" defaultValue="0" min="0" className="form-input" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" name="icuAvailable" style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '0.95rem' }}>ICU Available</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>Primary Admin</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Admin Name</label>
                                <input type="text" name="adminName" required className="form-input" placeholder="Full Name" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Mobile</label>
                                    <input type="tel" name="adminMobile" required className="form-input" placeholder="+91..." />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Email</label>
                                    <input type="email" name="adminEmail" required className="form-input" placeholder="admin@hospital.com" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '1rem' }}
                    >
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already registered? <Link href="/login/hospital" style={{ color: 'var(--primary)' }}>Login here</Link>
                    </p>
                </form>
            </div>
        </main>
    );
}
