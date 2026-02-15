import { services } from "@/lib/services";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ReportActions from "./ReportActions";

export default async function ReportsPage() {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("session_user");

    if (!userCookie) redirect("/login");
    const user = JSON.parse(userCookie.value);

    const visits = services.hospital.getVisits(user.hospitalId);

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
                                {visits.map(v => {
                                    const doctor = services.platform.getDoctorById(v.doctorId);
                                    const patient = services.hospital.getPatientById(user.hospitalId, v.patientId);
                                    return (
                                        <tr key={v.id}>
                                            <td style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                                                {v.id}
                                            </td>
                                            <td>
                                                {new Date(v.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                <br />
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                    {new Date(v.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td>
                                                <strong>{patient?.name || 'Unknown'}</strong>
                                                <br />
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                    📱 {patient?.mobile || '—'}
                                                </span>
                                            </td>
                                            <td>
                                                <strong>{doctor?.name || v.doctorId}</strong>
                                                <br />
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                    {doctor?.speciality || ''}
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
