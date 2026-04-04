export default function LabCatalogOverview({ catalog }) {
    if (!catalog || catalog.length === 0) {
        return (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '2rem' }}>📋</div>
                <p className="empty-state-text">Catalog is empty. Add tests to start receiving orders.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {catalog.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{c.category?.name || 'Test Item'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available</div>
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{c.price}</div>
                </div>
            ))}
        </div>
    );
}
