'use client'

import { useActionState } from 'react';
import { loginAction } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '' };

export default function DoctorLoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState);

    return (
        <div style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center', background: '#f8fafc', minHeight: '100vh' }}>
            <div className="card animate-fade-in-up" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem', background: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 1.25rem'
                    }}>
                        👨‍⚕️
                    </div>
                    <h2 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Doctor Login</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Access your appointments & profile</p>
                </div>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="form-label">📱 Mobile Number</label>
                        <input name="mobile" type="tel" placeholder="Registered mobile" required className="form-input" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🔑 Password</label>
                        <input name="password" type="password" placeholder="Enter password" required className="form-input" />
                    </div>

                    {state?.message && (
                        <div className="alert alert-error">⚠️ {state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ width: '100%', background: '#16a34a', borderColor: '#16a34a' }}>
                        {isPending ? '⏳ Logging in...' : '→ Access Dashboard'}
                    </button>
                </form>

                <div className="divider" />

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Hospital Staff? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
