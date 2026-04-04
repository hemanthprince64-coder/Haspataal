export default function LabOrdersList({ orders }) {
    if (!orders || orders.length === 0) {
        return (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🧪</div>
                <p className="empty-state-text">No test orders received yet.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.slice(0, 10).map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Order #{o.id.substring(0, 8)}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Patient: {o.patient?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {o.status} | Total: ₹{o.totalAmount}</div>
                    </div>
                    <button className="btn btn-sm btn-outline">View Details</button>
                </div>
            ))}
        </div>
    );
}
