'use client'

import { useActionState } from 'react';
import { adminLogin } from '@/app/actions';
import Image from 'next/image';

const initialState = { message: '' };

export default function AdminLoginPage() {
    const [state, formAction, isPending] = useActionState(adminLogin, initialState);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
        }}>
            <div className="card animate-fade-in-up" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 1.25rem'
                    }}>
                        🛡️
                    </div>
                    <h2 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Admin Portal</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Haspataal Platform Administration</p>
                </div>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="form-label">👤 Username</label>
                        <input name="username" type="text" placeholder="Admin username" required className="form-input" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🔑 Password</label>
                        <input name="password" type="password" placeholder="Admin password" required className="form-input" />
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        💡 Demo: <strong>admin</strong> / <strong>admin123</strong>
                    </p>

                    {state?.message && (
                        <div className="alert alert-error">⚠️ {state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="btn btn-lg" style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                        color: 'white'
                    }}>
                        {isPending ? '⏳ Authenticating...' : '🛡️ Login as Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}
