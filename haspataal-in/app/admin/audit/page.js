import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ROLES } from "@/lib/permissions";

export default async function AuditLogsPage() {
    const session = await auth();
    if (!session || session.user.role !== ROLES.SUPER_ADMIN) redirect('/login');

    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit to last 100 for MVP
    });

    return (
        <div className="page-enter" style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "2rem" }}>System Audit Logs</h1>

            <div className="card">
                <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                            <th style={{ padding: "1rem" }}>Timestamp</th>
                            <th style={{ padding: "1rem" }}>User</th>
                            <th style={{ padding: "1rem" }}>Action</th>
                            <th style={{ padding: "1rem" }}>Entity</th>
                            <th style={{ padding: "1rem" }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                <td style={{ padding: "1rem" }}>{new Date(log.createdAt).toLocaleString()}</td>
                                <td style={{ padding: "1rem" }}>{log.userId}</td>
                                <td style={{ padding: "1rem" }}><span className="badge badge-primary">{log.action}</span></td>
                                <td style={{ padding: "1rem" }}>{log.entity} ({log.entityId.slice(0, 8)})</td>
                                <td style={{ padding: "1rem", fontSize: "0.85rem", color: "#666" }}>
                                    {JSON.stringify(log.details)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>No logs found.</p>}
            </div>
        </div>
    );
}
