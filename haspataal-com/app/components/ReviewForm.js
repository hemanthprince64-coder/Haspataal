'use client'

import { useState } from 'react';
import { submitReview } from '@/app/actions-reviews';

export default function ReviewForm({ hospitalId, doctorId }) {
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    async function handleSubmit(formData) {
        setLoading(true);
        setMessage('');

        // We need patient ID. In real app, from session. 
        // For demo, we might need a workaround or ask user.
        // Let's ask user for Patient ID simply for MVP.

        const result = await submitReview(null, formData);

        if (result?.success) {
            setMessage(`✅ ${result.message}`);
            // Reset form?
        } else {
            setMessage(`❌ ${result?.message || 'Failed.'}`);
        }
        setLoading(false);
    }

    return (
        <div className="card" style={{ marginTop: '2rem', border: '2px solid #f0fdf4' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Write a Review</h3>

            {message && (
                <div style={{
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    borderRadius: '6px',
                    background: message.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                    color: message.startsWith('✅') ? '#047857' : '#b91c1c',
                    fontSize: '0.9rem'
                }}>
                    {message}
                </div>
            )}

            <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="hidden" name="hospitalId" value={hospitalId || ''} />
                <input type="hidden" name="doctorId" value={doctorId || ''} />

                {/* Temporary Patient ID Input for Demo */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Patient ID (For Verification)</label>
                    <input type="text" name="patientId" required className="form-input" placeholder="Enter your Patient ID" style={{ padding: '0.5rem' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Rating</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                style={{
                                    fontSize: '1.5rem',
                                    color: star <= rating ? '#eab308' : '#e5e7eb',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <input type="hidden" name="rating" value={rating} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Comment</label>
                    <textarea
                        name="comment"
                        required
                        className="form-input"
                        rows="3"
                        placeholder="Share your experience..."
                        style={{ resize: 'none' }}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-sm"
                    style={{ alignSelf: 'flex-start' }}
                >
                    {loading ? 'Submitting...' : 'Post Review'}
                </button>
            </form>
        </div>
    );
}
