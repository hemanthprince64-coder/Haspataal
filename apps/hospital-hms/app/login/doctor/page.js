'use client';

import { useState, useActionState, useTransition } from 'react';

import Link from 'next/link';

import { requestDoctorOtp, loginDoctorWithOtp } from '@/app/actions';

export default function DoctorLoginPage() {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [requestError, setRequestError] = useState('');
  const [isRequesting, startRequestTransition] = useTransition();

  const [verifyState, verifyAction, isVerifying] = useActionState(loginDoctorWithOtp, {
    message: '',
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setRequestError('');

    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setRequestError('Please enter a valid 10-digit mobile number.');
      return;
    }

    startRequestTransition(async () => {
      const formData = new FormData();
      formData.append('mobile', cleaned);
      const res = await requestDoctorOtp(null, formData);
      if (res?.success) {
        setStep(2);
      } else {
        setRequestError(res?.message || 'Failed to send OTP.');
      }
    });
  };

  return (
    <div
      style={{
        padding: '4rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        background: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      <div
        className="card animate-fade-in-up"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '2.5rem',
          background: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '70px',
              height: '70px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 1.25rem',
            }}
          >
            👨‍⚕️
          </div>
          <h2
            style={{
              fontWeight: '800',
              color: 'var(--text-main)',
              marginBottom: '0.5rem',
              fontSize: '1.5rem',
            }}
          >
            Doctor Login
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Access your appointments & profile via secure OTP
          </p>
        </div>

        {step === 1 ? (
          <form
            onSubmit={handleSendOtp}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div className="form-group">
              <label className="form-label">📱 Mobile Number</label>
              <input
                name="mobile"
                type="tel"
                placeholder="10-digit mobile number"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="form-input"
                autoFocus
              />
            </div>

            {requestError && <div className="alert alert-error">⚠️ {requestError}</div>}

            <button
              type="submit"
              disabled={isRequesting || mobile.length < 10}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', background: '#16a34a', borderColor: '#16a34a' }}
            >
              {isRequesting ? '⏳ Sending OTP...' : '→ Send Secure OTP'}
            </button>
          </form>
        ) : (
          <form
            action={verifyAction}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <input type="hidden" name="mobile" value={mobile} />

            <div className="form-group">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.25rem',
                }}
              >
                <label className="form-label" style={{ margin: 0 }}>
                  📱 Mobile Number
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#16a34a',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </div>
              <div
                style={{
                  padding: '0.75rem',
                  background: '#f1f5f9',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  color: '#334155',
                }}
              >
                {mobile}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">🔑 6-Digit Verification Code</label>
              <input
                name="otp"
                type="tel"
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                className="form-input"
                style={{
                  textAlign: 'center',
                  fontSize: '1.25rem',
                  letterSpacing: '0.25rem',
                  fontWeight: '700',
                }}
                autoFocus
              />
            </div>

            {verifyState?.message && (
              <div className="alert alert-error">⚠️ {verifyState.message}</div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', background: '#16a34a', borderColor: '#16a34a' }}
            >
              {isVerifying ? '⏳ Verifying...' : '🛡️ Verify & Login'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isRequesting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {isRequesting ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="divider" />

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Hospital Staff?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Login here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
