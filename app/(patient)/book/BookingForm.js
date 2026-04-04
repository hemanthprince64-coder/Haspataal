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
    const [selectedSlot, setSelectedSlot] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function fetchSlots() {
            if (!doctorId || !selectedDate) return;
            setIsLoadingSlots(true);
            try {
                const available = await getAvailableSlotsAction(doctorId, selectedDate);
                if (isMounted) {
                    setSlots(available);
                    // Clear selection if the current selected slot is no longer available
                    if (selectedSlot && !available.find(s => s.time === selectedSlot && s.available)) {
                        setSelectedSlot('');
                    }
                }
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
        <div className="card shadow-xl border-t-4 border-blue-600">
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <input type="hidden" name="doctorId" value={doctorId || ''} />
                <input type="hidden" name="hospitalId" value={hospitalId || ''} />

                <div className="form-group">
                    <label className="form-label font-bold text-slate-700">📅 Select Date</label>
                    <input
                        name="date"
                        type="date"
                        required
                        min={today}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="form-input focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label font-bold text-slate-700 flex justify-between items-center">
                        <span>🕐 Select Time Slot</span>
                        {isLoadingSlots && <span className="text-xs text-blue-600 animate-pulse">Checking availability...</span>}
                    </label>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                        {slots.length > 0 ? slots.map(slot => {
                            const isAvailable = slot.available;
                            const isSelected = selectedSlot === slot.time;
                            
                            return (
                                <label 
                                    key={slot.time} 
                                    className={`
                                        relative flex flex-row items-baseline justify-center p-3 gap-1 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                                        ${isAvailable 
                                            ? isSelected 
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg ring-2 ring-blue-200 scale-105 z-10' 
                                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                                            : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-60'}
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="slot"
                                        value={slot.time}
                                        required
                                        disabled={!isAvailable}
                                        checked={isSelected}
                                        onChange={() => setSelectedSlot(slot.time)}
                                        className="sr-only"
                                    />
                                    
                                    <span className="text-lg font-black leading-none">
                                        {parseInt(slot.time.split(':')[0]) > 12
                                            ? `${parseInt(slot.time.split(':')[0]) - 12}:${slot.time.split(':')[1]}`
                                            : parseInt(slot.time.split(':')[0]) === 0
                                                ? `12:${slot.time.split(':')[1]}`
                                                : `${parseInt(slot.time.split(':')[0])}:${slot.time.split(':')[1]}`
                                        }
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {parseInt(slot.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                    </span>

                                    {isSelected && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-white text-blue-600 rounded-full p-0.5 shadow-md">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </label>
                            );
                        }) : !isLoadingSlots && (
                            <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-500">
                                <p className="text-4xl mb-2">😴</p>
                                <p className="font-bold">No slots available</p>
                                <p className="text-sm">Try selecting a different date.</p>
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
