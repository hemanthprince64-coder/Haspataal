import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createHealthRecord } from "@/app/actions/ehr";
import { ROLES } from "@/lib/permissions";

export default async function AddHealthRecordPage({ params }) {
    const session = await auth();
    if (!session || session.user.role !== ROLES.DOCTOR) redirect('/login/doctor');

    const { patientId } = params;

    // Fetch patient details
    const patient = await prisma.patient.findUnique({
        where: { id: patientId }
    });

    if (!patient) return <div className="page-enter">Patient not found</div>;

    // Fetch previous records
    const history = await prisma.patientRecord.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: { doctor: true }
    });

    return (
        <div className="page-enter" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
                Health Record: {patient.name}
            </h1>

            <div className="card">
                <form action={createHealthRecord}>
                    <input type="hidden" name="patientId" value={patientId} />

                    <div className="form-group">
                        <label className="form-label">Diagnosis</label>
                        <input name="diagnosis" required className="form-input" placeholder="e.g. Viral Fever" />
                    </div>

                    <div className="grid-layout" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label className="form-label">Blood Pressure</label>
                            <input name="bp" className="form-input" placeholder="120/80" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Pulse (bpm)</label>
                            <input name="pulse" className="form-input" placeholder="72" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Temperature (°F)</label>
                            <input name="temperature" className="form-input" placeholder="98.6" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Weight (kg)</label>
                            <input name="weight" className="form-input" placeholder="70" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Prescription</label>
                        <textarea name="prescription" className="form-input" rows="4" placeholder="Rx: Paracetamol 500mg BID..."></textarea>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea name="notes" className="form-input" rows="2" placeholder="Private notes..."></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Save Record</button>
                </form>
            </div>

            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: "2rem 0 1rem" }}>History</h2>
            <div className="history-list">
                {history.length === 0 ? <p className="text-muted">No previous records.</p> : (
                    history.map(record => (
                        <div key={record.id} className="card" style={{ marginBottom: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <span style={{ fontWeight: "bold" }}>{new Date(record.createdAt).toLocaleDateString()}</span>
                                <span className="badge badge-primary">{record.doctor.name}</span>
                            </div>
                            <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                            <p><strong>Rx:</strong> {record.prescription}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
