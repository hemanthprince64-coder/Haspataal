'use client';

import { useState, useActionState } from 'react';
import { addDoctorAction, removeDoctorAction } from '@/app/actions';

const addInitialState = { message: '', success: false };
const removeInitialState = { message: '', success: false };

export default function DoctorManagement({ doctors: initialDoctors }) {
    const [addState, addAction, isAdding] = useActionState(addDoctorAction, addInitialState);
    const [removeState, removeAction, isRemoving] = useActionState(removeDoctorAction, removeInitialState);
    const [showForm, setShowForm] = useState(false);

    return (
        <div>
            {/* Add Doctor Section */}
            <div style={{ marginBottom: "2rem" }}>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                >
                    {showForm ? '✕ Close Form' : '➕ Add New Doctor'}
                </button>
            </div>

            {showForm && (
                <div className="card animate-slide-down" style={{ marginBottom: "2rem" }}>
                    <h3 style={{ fontWeight: "700", marginBottom: "1.25rem" }}>Add New Doctor</h3>
                    <form action={addAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div className="form-group">
                                <label className="form-label">Doctor Name *</label>
                                <input name="name" type="text" required className="form-input" placeholder="Dr. Full Name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile *</label>
                                <input name="mobile" type="tel" required className="form-input" placeholder="10-digit mobile" maxLength="10" />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                            <div className="form-group">
                                <label className="form-label">Speciality *</label>
                                <select name="speciality" required className="form-input">
                                    <option value="">Select</option>
                                    <option value="General Physician">General Physician</option>
                                    <option value="Gynecology">Gynecology</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="ENT">ENT</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Ophthalmology">Ophthalmology</option>
                                    <option value="Psychiatry">Psychiatry</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Experience (yrs)</label>
                                <input name="experience" type="number" className="form-input" placeholder="Years" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fee (₹)</label>
                                <input name="fee" type="number" className="form-input" placeholder="500" defaultValue="500" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input name="password" type="password" className="form-input" placeholder="Default: 123" />
                        </div>

                        {addState?.message && (
                            <div className={`alert ${addState.success ? 'alert-success' : 'alert-error'}`}>
                                {addState.success ? '✅' : '⚠️'} {addState.message}
                            </div>
                        )}

                        <button type="submit" disabled={isAdding} className="btn btn-primary" style={{ width: "100%" }}>
                            {isAdding ? '⏳ Adding...' : '✓ Add Doctor'}
                        </button>
                    </form>
                </div>
            )}

            {/* Doctor List */}
            <h3 style={{ fontWeight: "700", marginBottom: "1rem" }}>
                Current Doctors <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>({initialDoctors.length})</span>
            </h3>

            {initialDoctors.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">👨‍⚕️</div>
                    <p className="empty-state-title">No doctors added yet</p>
                    <p className="empty-state-text">Add your first doctor to the hospital.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                    {initialDoctors.map(doc => (
                        <div key={doc.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                <div style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.5rem",
                                    flexShrink: 0
                                }}>
                                    👨‍⚕️
                                </div>
                                <div>
                                    <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{doc.name}</div>
                                    <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>{doc.speciality}</span>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                        {doc.experience || 0} yrs • ₹{doc.fee}
                                    </div>
                                </div>
                            </div>
                            <form action={removeAction}>
                                <input type="hidden" name="doctorId" value={doc.id} />
                                <button
                                    type="submit"
                                    disabled={isRemoving}
                                    className="btn btn-sm"
                                    style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    ✕
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            )}

            {removeState?.message && (
                <div className={`alert ${removeState.success ? 'alert-success' : 'alert-error'}`} style={{ marginTop: "1rem" }}>
                    {removeState.success ? '✅' : '⚠️'} {removeState.message}
                </div>
            )}
        </div>
    );
}
