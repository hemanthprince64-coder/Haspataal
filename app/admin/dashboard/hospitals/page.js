import { services } from "@/lib/services";
import HospitalActions from "./HospitalActions";

export default async function AdminHospitalsPage() {
    const rawHospitals = await services.admin.getAllHospitals();

    // Fetch doctor counts concurrently
    const hospitals = await Promise.all(
        rawHospitals.map(async (h) => {
            const doctors = await services.platform.getHospitalDoctors(h.id);
            return { ...h, doctorCount: doctors.length };
        })
    );

    const pending = hospitals.filter(h => h.verificationStatus === 'pending');
    const active = hospitals.filter(h => h.accountStatus === 'active' && h.verificationStatus === 'verified');
    const others = hospitals.filter(h => h.verificationStatus !== 'pending' && h.accountStatus !== 'active');

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>Hospital Management</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
                {hospitals.length} total hospitals • {pending.length} pending • {active.length} active
            </p>

            {/* Pending Approvals */}
            {pending.length > 0 && (
                <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        ⏳ Pending Approval
                        <span className="badge badge-warning">{pending.length}</span>
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {pending.map(h => (
                            <div key={h.id} className="card" style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "1rem",
                                borderLeft: "4px solid #f59e0b"
                            }}>
                                <div>
                                    <h3 style={{ fontWeight: "700" }}>{h.name}</h3>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                        📍 {h.city} • ID: {h.id}
                                    </p>
                                </div>
                                <HospitalActions hospitalId={h.id} name={h.name} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Hospitals */}
            <div style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>
                    ✅ Active Hospitals
                </h2>
                <div className="card" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Hospital</th>
                                    <th>City</th>
                                    <th>Rating</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {active.map(h => (
                                    <tr key={h.id}>
                                        <td>
                                            <strong>{h.name || h.legalName}</strong>
                                            <br />
                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                👨‍⚕️ {h.doctorCount} doctors
                                            </span>
                                        </td>
                                        <td>{h.city}</td>
                                        <td>⭐ {h.rating}</td>
                                        <td><span className="badge badge-success">ACTIVE</span></td>
                                        <td>
                                            <HospitalActions hospitalId={h.id} name={h.name} isActive />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Other Hospitals */}
            {
                others.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>
                            Other Hospitals
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {others.map(h => (
                                <div key={h.id} className="card" style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    opacity: 0.7
                                }}>
                                    <div>
                                        <h3 style={{ fontWeight: "700" }}>{h.name || h.legalName}</h3>
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>📍 {h.city}</p>
                                    </div>
                                    <span className="badge badge-danger">{h.accountStatus}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
