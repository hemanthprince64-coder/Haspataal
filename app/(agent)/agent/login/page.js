'use client'

import { useActionState } from 'react';
import { agentLogin } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '' };

export default function AgentLogin() {
    const [state, formAction, isPending] = useActionState(agentLogin, initialState);

    return (
        <div style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
            <div className="card animate-fade-in-up" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧑‍💼</div>
                    <h2 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Partner Login</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome back to Haspataal</p>
                </div>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="form-label">📱 Mobile Number</label>
                        <input name="mobile" type="tel" required className="form-input" placeholder="10-digit mobile number" maxLength="10" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🔑 Password</label>
                        <input name="password" type="password" required className="form-input" placeholder="Enter your password" />
                    </div>

                    {state?.message && (
                        <div className="alert alert-error">⚠️ {state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                        {isPending ? '⏳ Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="divider" />

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Don&apos;t have a partner account? <br />
                        <Link href="/agent/register" style={{ color: 'var(--primary)', fontWeight: '600', display: 'inline-block', marginTop: '0.5rem' }}>Apply Now →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
