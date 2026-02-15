'use client'

import { useActionState } from 'react';
import { registerHospital } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function HospitalRegister() {
    const [state, formAction, isPending] = useActionState(registerHospital, initialState);

    if (state?.success) {
        return (
            <div style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <div className="card animate-fade-in-up" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontWeight: '700' }}>Registration Submitted!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{state.message}</p>
                    <Link href="/login" className="btn btn-primary">
                        → Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '3rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card animate-fade-in-up" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Register Hospital</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join Haspataal's growing hospital network</p>
                </div>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hospital Details</h3>

                    <div className="form-group">
                        <label className="form-label">🏥 Hospital Name *</label>
                        <input name="hospitalName" type="text" required className="form-input" placeholder="e.g., City General Hospital" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">📍 City *</label>
                        <input name="city" type="text" required className="form-input" placeholder="e.g., Mumbai" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location (Optional)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input name="lat" type="number" step="any" className="form-input" placeholder="Latitude (e.g., 19.076)" />
                            <input name="lng" type="number" step="any" className="form-input" placeholder="Longitude (e.g., 72.877)" />
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                    <h3 style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Contact</h3>

                    <div className="form-group">
                        <label className="form-label">👤 Admin Name *</label>
                        <input name="adminName" type="text" required className="form-input" placeholder="Full name" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">📱 Mobile Number *</label>
                        <input name="mobile" type="tel" required className="form-input" placeholder="10-digit mobile" maxLength="10" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🔑 Password *</label>
                        <input name="password" type="password" required className="form-input" placeholder="Set a password" />
                    </div>

                    {state?.message && !state.success && (
                        <div className="alert alert-error">⚠️ {state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                        {isPending ? '⏳ Registering...' : '✨ Register Hospital'}
                    </button>
                </form>

                <div className="divider" />

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Already registered? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
