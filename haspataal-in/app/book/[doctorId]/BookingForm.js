'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function BookingForm({ doctor }) {
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const router = useRouter();

    const generateSlots = () => {
        const slots = [];
        let start = 9; // 9 AM
        for (let i = 0; i < 16; i++) { // 8 hours * 2 slots
            const hour = Math.floor(start + i / 2);
            const minute = (i % 2) === 0 ? '00' : '30';
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            slots.push(`${displayHour}:${minute} ${ampm}`);
        }
        return slots;
    };

    const slots = generateSlots();

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedSlot) {
            alert('Please select a time slot');
            return;
        }
        setLoading(true);

        const formData = new FormData(e.target);
        const patientName = formData.get('patientName');
        const patientMobile = formData.get('patientMobile');
        const date = formData.get('date');

        try {
            // 1. Create Pending Appointment (Server Action would be better, using API for now to keep flow)
            // Ideally we call an API that creates APPT -> Returns ID -> Then Create Order

            // For MVP speed: We pass details to create-order and it creates the appointment? 
            // OR we create a new API route /api/appointments/create

            // Let's use the existing flow but enhance the payload to create-order
            const orderRes = await fetch('/api/payments/create-order', {
                method: 'POST',
                body: JSON.stringify({
                    amount: doctor.fee,
                    doctorId: doctor.id,
                    patientName,
                    patientMobile,
                    date,
                    slot: selectedSlot
                }),
            });

            if (!orderRes.ok) throw new Error('Failed to initiate booking');
            const data = await orderRes.json(); // returns { orderId, appointmentId, ... }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'test_key_id',
                amount: data.amount,
                currency: data.currency,
                name: 'Haspataal',
                description: `Consultation with ${doctor.name}`,
                order_id: data.id, // Razorpay Order ID
                handler: async function (response) {
                    const verifyRes = await fetch('/api/payments/verify', {
                        method: 'POST',
                        body: JSON.stringify({
                            orderCreationId: data.id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            appointmentId: data.appointmentId // Critical linkage
                        }),
                    });

                    if (verifyRes.ok) {
                        alert('Booking Confirmed! Redirecting...');
                        router.push('/profile'); // Redirect to profile to see appt
                    } else {
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: patientName,
                    contact: patientMobile,
                },
                theme: { color: '#0ea5e9' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error);
            alert('Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: '2rem' }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Book Appointment</h2>

            <div style={{
                background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ fontWeight: '600' }}>{doctor.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{doctor.specialty} • {doctor.hospital.name}</div>
                <div style={{ marginTop: '0.5rem', fontWeight: '700', color: 'var(--primary)' }}>Fees: ₹{doctor.fee}</div>
            </div>

            <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Patient Name</label>
                    <input name="patientName" required className="form-input" placeholder="Enter full name" />
                </div>

                <div className="form-group">
                    <label className="form-label">Patient Mobile</label>
                    <input name="patientMobile" type="tel" required className="form-input" placeholder="10-digit number" />
                </div>

                <div className="form-group">
                    <label className="form-label">Preferred Date</label>
                    <input name="date" type="date" required className="form-input" />
                </div>

                <div className="form-group">
                    <label className="form-label">Select Time Slot</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {slots.map(slot => (
                            <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '5px',
                                    border: '1px solid #cbd5e1',
                                    background: selectedSlot === slot ? '#0284c7' : 'white',
                                    color: selectedSlot === slot ? 'white' : '#334155',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg"
                    style={{ marginTop: '1rem' }}
                >
                    {loading ? 'Processing...' : `Pay ₹${doctor.fee} & Book`}
                </button>
            </form>
        </div>
    );
}
