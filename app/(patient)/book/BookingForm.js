'use client'

import { useActionState } from 'react';
import { bookAppointment } from '@/app/actions';
import Link from 'next/link';

const initialState = {
    message: '',
    success: false
};

export default function BookingForm({ doctorId, hospitalId }) {
    const [state, formAction, isPending] = useActionState(bookAppointment, initialState);

    if (state?.success) {
        return (
            <div className="card animate-fade-in-up" style={{ borderLeft: "4px solid var(--success)", textAlign: "center", padding: "2.5rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <h2 style={{ color: "var(--success)", marginBottom: "0.5rem", fontWeight: "700" }}>Booking Confirmed!</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{state.message}</p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/profile" className="btn btn-primary">View My Appointments</Link>
                    <Link href="/search" className="btn btn-outline">Book Another</Link>
                </div>
            </div>
        );
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="card">
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <input type="hidden" name="doctorId" value={doctorId || ''} />
                <input type="hidden" name="hospitalId" value={hospitalId || ''} />

                <div className="form-group">
                    <label className="form-label">📅 Select Date</label>
                    <input name="date" type="date" required min={today} className="form-input" />
                </div>

                <div className="form-group">
                    <label className="form-label">🕐 Select Time Slot</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {[
                            { time: '09:00', label: '9:00 AM' },
                            { time: '10:00', label: '10:00 AM' },
                            { time: '11:00', label: '11:00 AM' },
                            { time: '14:00', label: '2:00 PM' },
                            { time: '16:00', label: '4:00 PM' },
                            { time: '18:00', label: '6:00 PM' },
                        ].map(slot => (
                            <label key={slot.time} style={{
                                border: '1.5px solid var(--border)',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                transition: 'all 0.15s',
                            }}>
                                <input type="radio" name="slot" value={slot.time} required style={{ display: 'none' }} />
                                {slot.label}
                            </label>
                        ))}
                    </div>
                </div>

                {state?.message && !state.success && (
                    <div className="alert alert-error">⚠️ {state.message}</div>
                )}

                <button type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    {isPending ? '⏳ Booking...' : '✓ Confirm Appointment'}
                </button>
            </form>
        </div>
    );
}
