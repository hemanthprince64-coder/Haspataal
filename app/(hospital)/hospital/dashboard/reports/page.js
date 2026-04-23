import { services } from "@/lib/services";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types";
import ReportActions from "./ReportActions";

export default async function ReportsPage() {
    const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], "session_user");

    const rawVisits = await services.hospital.getVisits(user.hospitalId);
    const visits = rawVisits.map((v) => {
        const doctor = v.appointment?.doctor || null;
        const patient = v.appointment?.patient || null;
        return { 
            ...v, 
            displayPatientName: patient?.name || v.patientName || 'Unknown',
            displayPatientMobile: patient?.phone || v.patientPhone || '—',
            displayDoctorName: doctor?.fullName || 'Walk-in / No Doctor',
            displayDoctorSpeciality: v.appointment?.doctor?.affiliations?.[0]?.department || ''
        };
    });

    return (
        <div className="page-enter">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem" }}>Visit Reports</h1>
                    <p style={{ color: "var(--text-muted)" }}>{visits.length} total visits</p>
                </div>
            </div>

            {visits.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">📊</div>
                    <p className="empty-state-title">No visits recorded</p>
                    <p className="empty-state-text">Create your first OPD visit from the Billing page.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Visit ID</th>
                                    <th>Date & Time</th>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visits.map(v => (
                                    <tr key={v.id}>
                                        <td style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                                            {v.id.substring(0, 8)}...
                                        </td>
                                        <td>
                                            {new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            <br />
                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                {new Date(v.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{v.displayPatientName}</strong>
                                            <br />
                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                📱 {v.displayPatientMobile}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{v.displayDoctorName}</strong>
                                            <br />
                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                {v.displayDoctorSpeciality}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${v.status === 'COMPLETED' ? 'badge-success' : v.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td>
                                            <ReportActions visitId={v.id} status={v.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
