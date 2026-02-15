import { services } from "@/lib/services";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileActions from "./ProfileActions";

export default async function PatientProfile() {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("session_patient");

    if (!userCookie) {
        redirect("/login");
    }

    const patient = JSON.parse(userCookie.value);
    const freshPatient = services.patient.getById(patient.id) || patient;
    const visits = services.patient.getVisits(patient.id);

    return (
        <div className="container page-enter" style={{ padding: "2rem 1rem", maxWidth: "900px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "2rem" }}>My Profile</h1>

            {/* Profile Card */}
            <div className="card" style={{ marginBottom: "2rem", display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "var(--primary)",
                    flexShrink: 0,
                }}>
                    {freshPatient.name ? freshPatient.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: "700", fontSize: "1.2rem", marginBottom: "0.25rem" }}>
                        {freshPatient.name || 'Patient'}
                    </h3>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        <span>📱 {freshPatient.mobile}</span>
                        {freshPatient.city && <span>📍 {freshPatient.city}</span>}
                        {freshPatient.age && <span>🎂 {freshPatient.age} yrs</span>}
                        {freshPatient.gender && <span>⚤ {freshPatient.gender === 'M' ? 'Male' : freshPatient.gender === 'F' ? 'Female' : 'Other'}</span>}
                        {freshPatient.bloodGroup && <span>🩸 {freshPatient.bloodGroup}</span>}
                    </div>
                </div>
                <Link href="/profile/edit" className="btn btn-outline btn-sm">
                    ✏️ Edit Profile
                </Link>
            </div>

            {/* Visit History */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Visit History</h2>
                <span className="badge badge-primary">{visits.length} visits</span>
            </div>

            {visits.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p className="empty-state-title">No visits yet</p>
                    <p className="empty-state-text">Book your first appointment to see your visit history here.</p>
                    <Link href="/search" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>Find a Doctor</Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {visits.map(v => {
                        const hospital = services.platform.getHospitalById(v.hospitalId);
                        const doctor = services.platform.getDoctorById(v.doctorId);
                        const isUpcoming = v.status === 'SCHEDULED';
                        const isCancelled = v.status === 'CANCELLED';

                        return (
                            <div key={v.id} className="card" style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "1rem",
                                flexWrap: "wrap",
                                borderLeft: `4px solid ${isUpcoming ? 'var(--primary)' : isCancelled ? 'var(--danger)' : 'var(--success)'}`,
                                opacity: isCancelled ? 0.7 : 1,
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                        <h4 style={{ fontWeight: "600" }}>{doctor?.name || v.doctorId}</h4>
                                        <span className={`badge ${isUpcoming ? 'badge-primary' : isCancelled ? 'badge-danger' : 'badge-success'}`}>
                                            {v.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                        <span>🏥 {hospital?.name || v.hospitalId}</span>
                                        <span>📅 {new Date(v.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span>🕐 {new Date(v.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                {isUpcoming && (
                                    <ProfileActions visitId={v.id} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
