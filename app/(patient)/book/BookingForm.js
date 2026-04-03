'use client'

import { useActionState, useState, useEffect } from 'react';
import { bookAppointment, getAvailableSlotsAction } from '@/app/actions';
import Link from 'next/link';

const initialState = {
    message: '',
    success: false
};

export default function BookingForm({ doctorId, hospitalId }) {
    const [state, formAction, isPending] = useActionState(bookAppointment, initialState);

    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [slots, setSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchSlots() {
            if (!doctorId || !selectedDate) return;
            setIsLoadingSlots(true);
            try {
                const available = await getAvailableSlotsAction(doctorId, selectedDate);
                if (isMounted) setSlots(available);
            } catch (error) {
                console.error('Failed to load slots', error);
            } finally {
                if (isMounted) setIsLoadingSlots(false);
            }
        }

        fetchSlots();

        return () => { isMounted = false; };
    }, [doctorId, selectedDate]);


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

    return (
        <div className="card">
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <input type="hidden" name="doctorId" value={doctorId || ''} />
                <input type="hidden" name="hospitalId" value={hospitalId || ''} />

                <div className="form-group">
                    <label className="form-label">📅 Select Date</label>
                    <input
                        name="date"
                        type="date"
                        required
                        min={today}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">
                        🕐 Select Time Slot
                        {isLoadingSlots && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)' }}>Loading...</span>}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {slots.length > 0 ? slots.map(slot => {
                            const isAvailable = slot.available;
                            return (
                                <label key={slot.time} style={{
                                    border: `1.5px solid ${isAvailable ? 'var(--border)' : '#e5e7eb'}`,
                                    background: isAvailable ? 'transparent' : '#f9fafb',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    textAlign: 'center',
                                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    transition: 'all 0.15s',
                                    opacity: isAvailable ? 1 : 0.5,
                                    position: 'relative'
                                }}>
                                    <input
                                        type="radio"
                                        name="slot"
                                        value={slot.time}
                                        required
                                        disabled={!isAvailable}
                                        style={{ display: 'none' }}
                                    />
                                    {/* Formatting HH:mm for simple AM/PM display */}
                                    {parseInt(slot.time.split(':')[0]) > 12
                                        ? `${parseInt(slot.time.split(':')[0]) - 12}:${slot.time.split(':')[1]} PM`
                                        : parseInt(slot.time.split(':')[0]) === 12
                                            ? `12:${slot.time.split(':')[1]} PM`
                                            : `${parseInt(slot.time.split(':')[0])}:${slot.time.split(':')[1]} AM`
                                    }
                                </label>
                            );
                        }) : !isLoadingSlots && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                                No slots available for this date.
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group border border-emerald-100 bg-emerald-50 p-4 rounded-xl">
                    <label className="form-label flex items-center gap-3 cursor-pointer m-0">
                        <input type="checkbox" name="payWithWallet" value="true" className="w-5 h-5 text-emerald-600 rounded" />
                        <span className="font-bold text-emerald-800">Pay from Haspataal Wallet (₹500)</span>
                    </label>
                    <p className="text-xs text-emerald-600 mt-1 ml-8">Deducts ₹500 from Wallet and automatically confirms appointment.</p>
                </div>

                {state?.message && !state.success && (
                    <div className="alert alert-error">⚠️ {state.message}</div>
                )}

                <button type="submit" disabled={isPending || isLoadingSlots || slots.filter(s => s.available).length === 0} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    {isPending ? '⏳ Booking...' : '✓ Confirm Appointment'}
                </button>
            </form>
        </div>
    );
}
