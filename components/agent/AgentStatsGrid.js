export default function AgentStatsGrid({ stats }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card">
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Hospitals Onboarded</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.totalHospitals}</div>
            </div>
            <div className="card">
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Approved Hospitals</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>{stats.approvedHospitals}</div>
            </div>
            <div className="card">
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Patients Onboarded</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>{stats.totalPatients}</div>
            </div>
        </div>
    );
}
