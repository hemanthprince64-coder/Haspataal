import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ROLES } from "@/lib/permissions";
import { grantConsentAction } from "@/app/actions/consent";

// Simulated pending requests
const PENDING_REQUESTS = [
    { id: 'REQ-101', hospital: 'AIIMS Delhi', purpose: 'Care Context Linking', date: '2025-04-09' },
    { id: 'REQ-102', hospital: 'Max Super Speciality', purpose: 'Remote Consultation', date: '2025-04-08' }
];

export default async function ConsentManagerPage() {
    const session = await auth();
    if (!session || session.user.role !== ROLES.PATIENT) redirect('/login');

    return (
        <div className="page-enter">
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Consent Manager (ABDM)</h1>

            <div className="card" style={{ marginBottom: "2rem", borderLeft: "4px solid #f59e0b" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>⚠️ Pending Requests</h2>
                <div style={{ display: "grid", gap: "1rem" }}>
                    {PENDING_REQUESTS.map(req => (
                        <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "#fffaf0", border: "1px solid #fcd34d", borderRadius: "8px" }}>
                            <div>
                                <div style={{ fontWeight: "bold" }}>{req.hospital}</div>
                                <div style={{ fontSize: "0.9rem", color: "#666" }}>Purpose: {req.purpose} • {req.date}</div>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <form action={grantConsentAction}>
                                    <input type="hidden" name="requestId" value={req.id} />
                                    <input type="hidden" name="hospitalName" value={req.hospital} />
                                    <input type="hidden" name="decision" value="DENY" />
                                    <button className="btn btn-sm btn-outline">Deny</button>
                                </form>
                                <form action={grantConsentAction}>
                                    <input type="hidden" name="requestId" value={req.id} />
                                    <input type="hidden" name="hospitalName" value={req.hospital} />
                                    <input type="hidden" name="decision" value="APPROVE" />
                                    <button className="btn btn-sm btn-primary">Approve</button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>✅ Active Consents</h2>
                <p className="text-muted">No active consents found.</p>
            </div>
        </div>
    );
}
