'use client'

import { useActionState } from 'react';
import { registerAgent } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function AgentRegister() {
    const [state, formAction, isPending] = useActionState(registerAgent, initialState);

    if (state?.success) {
        return (
            <div style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <div className="card animate-fade-in-up" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontWeight: '700' }}>Registration Submitted!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{state.message}</p>
                    <Link href="/agent/login" className="btn btn-primary">
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
                    <h2 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Partner/Agent Registration</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join Haspataal's network to onboard hospitals and patients.</p>
                </div>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Details</h3>

                    <div className="form-group">
                        <label className="form-label">🧑‍💼 Full Name *</label>
                        <input name="fullName" type="text" required className="form-input" placeholder="e.g., John Doe" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">📱 Mobile Number *</label>
                        <input name="mobile" type="tel" required className="form-input" placeholder="10-digit mobile" maxLength="10" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">✉️ Email Address *</label>
                        <input name="email" type="email" required className="form-input" placeholder="agent@example.com" />
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                    <h3 style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service Area & Security</h3>

                    <div className="form-group">
                        <label className="form-label">📍 Area/Locality</label>
                        <input name="area" type="text" className="form-input" placeholder="e.g., Connaught Place" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label className="form-label">🏙️ City</label>
                            <input name="city" type="text" className="form-input" placeholder="e.g., New Delhi" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">🗺️ State</label>
                            <input name="state" type="text" className="form-input" placeholder="e.g., Delhi" />
                        </div>
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
                        Already registered? <Link href="/agent/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
