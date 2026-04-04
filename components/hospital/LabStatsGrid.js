export default function LabStatsGrid({ orderCount, catalogCount, patientCount }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card">
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Lab Orders</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{orderCount}</div>
            </div>
            <div className="card">
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Catalog Items</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>{catalogCount}</div>
            </div>
            <div className="card">
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Patients</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)' }}>{patientCount}</div>
            </div>
        </div>
    );
}
