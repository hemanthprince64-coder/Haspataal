export default function OnboardedHospitalsList({ hospitals }) {
    if (!hospitals || hospitals.length === 0) {
        return (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '2rem' }}>🏥</div>
                <p className="empty-state-text">No hospitals onboarded yet.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {hospitals.map(h => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{h.legalName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(h.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge badge-${h.verificationStatus === 'VERIFIED' ? 'success' : h.verificationStatus === 'REJECTED' ? 'danger' : 'warning'}`}>
                        {h.verificationStatus}
                    </span>
                </div>
            ))}
        </div>
    );
}
