'use client';

import { useActionState } from 'react';
import { updatePatientProfile } from '@/app/actions';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function EditProfile() {
    const [state, formAction, isPending] = useActionState(updatePatientProfile, initialState);
    const [patient, setPatient] = useState(null);

    useEffect(() => {
        // Read patient data from cookie
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find(c => c.trim().startsWith('session_patient='));
        if (sessionCookie) {
            try {
                const val = decodeURIComponent(sessionCookie.split('=').slice(1).join('='));
                setPatient(JSON.parse(val));
            } catch { }
        }
    }, []);

    if (state?.success) {
        return (
            <div className="container page-enter" style={{ padding: "3rem 1rem", maxWidth: "600px", margin: "0 auto" }}>
                <div className="card animate-fade-in-up" style={{ textAlign: "center", padding: "2.5rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                    <h2 style={{ color: "var(--success)", marginBottom: "0.5rem", fontWeight: "700" }}>Profile Updated!</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{state.message}</p>
                    <Link href="/profile" className="btn btn-primary">← Back to Profile</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container page-enter" style={{ padding: "2rem 1rem", maxWidth: "600px", margin: "0 auto" }}>
            <Link href="/profile" style={{ color: "var(--primary)", fontSize: "0.9rem", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "1.5rem" }}>
                ← Back to Profile
            </Link>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "2rem" }}>Edit Profile</h1>

            <div className="card">
                <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input name="name" type="text" defaultValue={patient?.name || ''} required className="form-input" placeholder="Enter your full name" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label className="form-label">Age</label>
                            <input name="age" type="number" defaultValue={patient?.age || ''} className="form-input" placeholder="Years" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select name="gender" defaultValue={patient?.gender || ''} className="form-input">
                                <option value="">Select</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label className="form-label">Blood Group</label>
                            <select name="bloodGroup" defaultValue={patient?.bloodGroup || ''} className="form-input">
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input name="city" type="text" defaultValue={patient?.city || ''} className="form-input" placeholder="Your city" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input name="email" type="email" defaultValue={patient?.email || ''} className="form-input" placeholder="your@email.com" />
                    </div>

                    {state?.message && !state.success && (
                        <div className="alert alert-error">⚠️ {state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                        {isPending ? '⏳ Saving...' : '✓ Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
