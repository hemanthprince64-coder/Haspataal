'use client'

import { useActionState } from 'react';
import { registerDoctor } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function DoctorRegister() {
    const [state, formAction, isPending] = useActionState(registerDoctor, initialState);

    if (state?.success) {
        return (
            <div style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <div className="card animate-fade-in-up" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontWeight: '700' }}>Registration Submitted!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{state.message}</p>
                    <Link href="/doctor/login" className="btn btn-primary">
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
                    <h2 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Doctor Registration</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join Haspataal's network of healthcare professionals</p>
                </div>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Details</h3>

                    <div className="form-group">
                        <label className="form-label">🧑‍⚕️ Full Name *</label>
                        <input name="fullName" type="text" required className="form-input" placeholder="e.g., Dr. Jane Doe" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">📱 Mobile Number *</label>
                        <input name="mobile" type="tel" required className="form-input" placeholder="10-digit mobile" maxLength="10" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">✉️ Email Address *</label>
                        <input name="email" type="email" required className="form-input" placeholder="doctor@example.com" />
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                    <h3 style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Professional Details</h3>

                    <div className="form-group">
                        <label className="form-label">📜 Registration Number *</label>
                        <input name="registrationNumber" type="text" required className="form-input" placeholder="e.g., 12345" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🏛️ Medical Council *</label>
                        <input name="councilName" type="text" required className="form-input" placeholder="e.g., Medical Council of India" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🔑 Password *</label>
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
                        Already registered? <Link href="/doctor/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
