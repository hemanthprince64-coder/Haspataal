export default function RecentVisitsTable({ visits }) {
    if (!visits || visits.length === 0) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                <p>No visits yet. Create your first OPD visit.</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: "auto" }}>
            <table className="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {visits.map(v => (
                        <tr key={v.id}>
                            <td>{new Date(v.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                            <td>{v.patientId}</td>
                            <td>{v.doctorId}</td>
                            <td>
                                <span className={`badge ${v.status === 'COMPLETED' ? 'badge-success' : v.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                                    {v.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
