'use client'

import { useActionState } from 'react';
import { loginAction } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '' };

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState);

    return (
        <div style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card animate-fade-in-up" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 1.25rem'
                    }}>
                        🏥
                    </div>
                    <h2 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Login</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hospital admins and patients</p>
                </div>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="form-label">📱 Mobile Number</label>
                        <input name="mobile" type="tel" placeholder="Admin mobile number" required className="form-input" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🔑 Password</label>
                        <input name="password" type="password" placeholder="Enter password" required className="form-input" />
                    </div>

                    {state?.message && (
                        <div className="alert alert-error">⚠️ {state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                        {isPending ? '⏳ Logging in...' : '→ Login'}
                    </button>
                </form>

                <div className="divider" />

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        New hospital? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register here →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
