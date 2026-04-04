export default function OnboardedPatientsList({ patients }) {
    if (!patients || patients.length === 0) {
        return (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '2rem' }}>👥</div>
                <p className="empty-state-text">No patients onboarded yet.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {patients.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
