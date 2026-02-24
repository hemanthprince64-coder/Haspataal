'use client'

import { useActionState } from 'react';
import { registerLab } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function LabRegister() {
    const [state, formAction, isPending] = useActionState(registerLab, initialState);

    if (state?.success) {
        return (
            <div style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <div className="card animate-fade-in-up" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontWeight: '700' }}>Registration Submitted!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{state.message}</p>
                    <Link href="/hospital/login" className="btn btn-primary">
                        → Go to Admin Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '3rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card animate-fade-in-up" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Diagnostic Lab Registration</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join Haspataal&apos;s network of diagnostic service providers.</p>
                </div>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lab Details</h3>

                    <div className="form-group">
                        <label className="form-label">🔬 Lab / Business Name *</label>
                        <input name="labName" type="text" required className="form-input" placeholder="e.g., City Diagnostics" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">📜 Registration / License *</label>
                        <input name="registrationNumber" type="text" className="form-input" placeholder="e.g., Clinical Estb. No." />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🏙️ City *</label>
                        <input name="city" type="text" required className="form-input" placeholder="e.g., New Delhi" />
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                    <h3 style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Details</h3>

                    <div className="form-group">
                        <label className="form-label">👤 Admin Name *</label>
                        <input name="adminName" type="text" required className="form-input" placeholder="e.g., John Doe" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">📱 Official Mobile Number *</label>
                        <input name="mobile" type="tel" required className="form-input" placeholder="10-digit mobile" maxLength="10" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🔑 Admin Password *</label>
                        <input name="password" type="password" required className="form-input" placeholder="Set a secure password" />
                    </div>

                    {state?.message && !state.success && (
                        <div className="alert alert-error">⚠️ {state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                        {isPending ? '⏳ Submitting...' : '✨ Complete Registration'}
                    </button>
                </form>

                <div className="divider" />

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Already registered? <Link href="/hospital/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
