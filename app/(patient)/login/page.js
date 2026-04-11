'use client'

import { useState, useActionState } from 'react';
import { patientLogin, requestOtpAction } from '@/app/actions';
import Link from 'next/link';

const initialState = {
    message: '',
};

export default function PatientLogin() {
    const [state, formAction, isPending] = useActionState(patientLogin, initialState);

    const [step, setStep] = useState(1);
    const [mobile, setMobile] = useState('');
    const [otpMessage, setOtpMessage] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setOtpMessage('');
        setIsRequesting(true);

        const fd = new FormData();
        fd.append('mobile', mobile);

        const res = await requestOtpAction(null, fd);
        setIsRequesting(false);

        if (res.success) {
            setStep(2);
        } else {
            setOtpMessage(res.message);
        }
    };

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
                        👤
                    </div>
                    <h2 style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Patient Login</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Login to book appointments and view your health history</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">📱 Mobile Number</label>
                            <input
                                suppressHydrationWarning
                                name="mobile"
                                type="tel"
                                placeholder="10-digit mobile number"
                                required
                                className="form-input"
                                maxLength="10"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                            />
                        </div>

                        {otpMessage && (
                            <div className="alert alert-error">⚠️ {otpMessage}</div>
                        )}

                        <button suppressHydrationWarning type="submit" disabled={isRequesting} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                            {isRequesting ? '⏳ Sending OTP...' : 'Get OTP'}
                        </button>
                    </form>
                ) : (
                    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">📱 Mobile Number</label>
                            <input suppressHydrationWarning name="mobile" type="tel" readOnly value={mobile} className="form-input" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">🔑 OTP</label>
                            <input suppressHydrationWarning name="otp" type="text" placeholder="Enter 4-digit OTP" required className="form-input" maxLength="4" autoFocus />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                💡 Check console logs for the demo OTP code
                            </p>
                        </div>

                        {state?.message && (
                            <div className="alert alert-error">⚠️ {state.message}</div>
                        )}

                        <button suppressHydrationWarning type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                            {isPending ? '⏳ Verifying...' : '→ Login'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
                                Incorrect number? Go back
                            </button>
                        </div>
                    </form>
                )}

                <div className="divider" />

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Are you a hospital? <Link href="/hospital" style={{ color: 'var(--primary)', fontWeight: '600' }}>Partner Portal →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
