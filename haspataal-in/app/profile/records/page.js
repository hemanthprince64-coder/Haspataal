import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ROLES } from "@/lib/permissions";

export default async function PatientRecordsPage() {
    const session = await auth();
    if (!session || session.user.role !== ROLES.PATIENT) redirect('/login');

    const records = await prisma.patientRecord.findMany({
        where: { patientId: session.user.id },
        include: { doctor: { include: { hospital: true } } },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>My Health Records</h1>

            {records.length === 0 ? (
                <div className="card text-center" style={{ padding: "3rem" }}>
                    <p className="text-muted">No health records found.</p>
                </div>
            ) : (
                <div className="timeline-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {records.map(record => (
                        <div key={record.id} className="card" style={{ position: "relative", borderLeft: "4px solid var(--primary)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{new Date(record.createdAt).toLocaleDateString()}</h3>
                                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                                        Dr. {record.doctor.name} • {record.doctor.hospital.name}
                                    </p>
                                </div>
                                <button className="btn btn-sm btn-outline" style={{ height: "fit-content" }}
                                    onClick={() => window.print()}>
                                    ⬇️ PDF
                                </button>
                            </div>

                            <div style={{ marginTop: "1rem" }}>
                                <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                                {record.vitals && (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "0.5rem", marginTop: "0.5rem", background: "#f8f9fa", padding: "0.5rem", borderRadius: "4px" }}>
                                        {Object.entries(record.vitals).map(([key, value]) => (
                                            value && <div key={key}><span style={{ textTransform: "capitalize", color: "#666", fontSize: "0.85rem" }}>{key}:</span> <strong>{value}</strong></div>
                                        ))}
                                    </div>
                                )}
                                {record.prescription && (
                                    <div style={{ marginTop: "0.5rem", borderTop: "1px dashed #eee", paddingTop: "0.5rem" }}>
                                        <strong>Rx:</strong>
                                        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", color: "#444", marginTop: "0.25rem" }}>{record.prescription}</pre>
                                    </div>
                                )}
                                {record.notes && (
                                    <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
                                        <em>Note: {record.notes}</em>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
