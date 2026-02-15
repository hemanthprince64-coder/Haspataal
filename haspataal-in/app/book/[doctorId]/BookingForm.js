'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function BookingForm({ doctor }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleBooking = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const patientName = formData.get('patientName');
        const patientMobile = formData.get('patientMobile');
        const date = formData.get('date');

        // 1. Create Order
        try {
            const orderRes = await fetch('/api/payments/create-order', {
                method: 'POST',
                body: JSON.stringify({ amount: doctor.fee, appointmentId: 'temp_id_placeholder' }), // API expects JSON
            });

            if (!orderRes.ok) throw new Error('Failed to create order');
            const order = await orderRes.json();

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'test_key_id',
                amount: order.amount,
                currency: order.currency,
                name: 'Haspataal',
                description: `Consultation with ${doctor.name}`,
                order_id: order.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    const verifyRes = await fetch('/api/payments/verify', {
                        method: 'POST',
                        body: JSON.stringify({
                            orderCreationId: order.id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            // Pass appointment details for creation
                            patientName,
                            patientMobile,
                            date,
                            doctorId: doctor.id,
                            amount: doctor.fee
                        }),
                    });

                    if (verifyRes.ok) {
                        alert('Payment Successful! Booking confirmed.');
                        // Logic to actually create appointment in DB would go here 
                        // or trigger a server action with payment details.
                        // For now, redirect home.
                        router.push('/');
                    } else {
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: patientName,
                    contact: patientMobile,
                },
                theme: {
                    color: '#0ea5e9',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
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
