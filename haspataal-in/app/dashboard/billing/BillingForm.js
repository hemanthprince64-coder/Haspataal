'use client';

import { useState, useActionState } from 'react';
import { createVisitAction } from '@/app/actions';

const initialState = { message: '', success: false };

export default function BillingForm({ doctors }) {
    const [state, formAction, isPending] = useActionState(createVisitAction, initialState);
    const [selectedDoctor, setSelectedDoctor] = useState('');

    const doctor = doctors.find(d => d.id === selectedDoctor);
    const fee = doctor?.fee || 0;

    if (state?.success) {
        return (
            <div className="card animate-fade-in-up" style={{ textAlign: "center", padding: "2.5rem", borderLeft: "4px solid var(--success)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <h2 style={{ color: "var(--success)", marginBottom: "0.5rem", fontWeight: "700" }}>Visit Created!</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>{state.message}</p>

                {/* Receipt */}
                <div className="card" style={{ textAlign: "left", marginBottom: "1.5rem", background: "#f8fafc" }}>
                    <h4 style={{ marginBottom: "0.75rem", fontWeight: "700", fontSize: "0.9rem" }}>💳 Receipt Summary</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                        <span style={{ color: "var(--text-muted)" }}>Consultation Fee</span>
                        <span style={{ fontWeight: "600" }}>₹{fee}</span>
                    </div>
                    <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", fontSize: "1rem" }}>
                        <span style={{ fontWeight: "700" }}>Total</span>
                        <span style={{ fontWeight: "800", color: "var(--accent)" }}>₹{fee}</span>
                    </div>
                </div>

                <button onClick={() => window.location.reload()} className="btn btn-primary">
                    ➕ Create Another Visit
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
            {/* Main Form */}
            <div className="card">
                <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <h3 style={{ fontWeight: "700", marginBottom: "0.25rem", fontSize: "1.1rem" }}>Patient Details</h3>

                    <div className="form-group">
                        <label className="form-label">Patient Name *</label>
                        <input name="patientName" type="text" required className="form-input" placeholder="Full name" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label className="form-label">Mobile *</label>
                            <input name="patientMobile" type="tel" required className="form-input" placeholder="Mobile" maxLength="10" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Age</label>
                            <input name="age" type="number" className="form-input" placeholder="Years" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select name="gender" className="form-input">
                                <option value="">Select</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                    </div>

                    <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.25rem 0" }} />
                    <h3 style={{ fontWeight: "700", marginBottom: "0.25rem", fontSize: "1.1rem" }}>Consultation Details</h3>

                    <div className="form-group">
                        <label className="form-label">Doctor *</label>
                        <select
                            name="doctorId"
                            required
                            className="form-input"
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                        >
                            <option value="">Select Doctor</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.name} — {d.speciality} (₹{d.fee})
                                </option>
                            ))}
                        </select>
                    </div>

                    {state?.message && !state.success && (
                        <div className="alert alert-error">⚠️ {state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                        {isPending ? '⏳ Creating...' : '✓ Create Visit & Generate Receipt'}
                    </button>
                </form>
            </div>

            {/* Fee Summary (Sidebar) */}
            <div className="card" style={{ position: "sticky", top: "1rem" }}>
                <h4 style={{ fontWeight: "700", marginBottom: "1rem", fontSize: "0.95rem" }}>💳 Fee Summary</h4>
                {selectedDoctor ? (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Doctor</span>
                            <span style={{ fontWeight: "600" }}>{doctor?.name}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Speciality</span>
                            <span>{doctor?.speciality}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Consultation Fee</span>
                            <span style={{ fontWeight: "600" }}>₹{fee}</span>
                        </div>
                        <div style={{
                            borderTop: "2px solid var(--primary)",
                            paddingTop: "0.75rem",
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "1.1rem"
                        }}>
                            <span style={{ fontWeight: "700" }}>Total</span>
                            <span style={{ fontWeight: "800", color: "var(--accent)" }}>₹{fee}</span>
                        </div>
                    </>
                ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "1rem 0" }}>
                        Select a doctor to see fee details
                    </p>
                )}
            </div>
        </div>
    );
}
