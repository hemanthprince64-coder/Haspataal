export default function RecordsList({ records }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {records.map(rec => (
                <div key={rec.id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'var(--blue-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        {rec.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{rec.type}</div>
                        <h4 style={{ fontSize: '15px', margin: '0 0 4px 0', fontFamily: 'var(--font-sans)', color: 'var(--navy)' }}>{rec.title || rec.doctor}</h4>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{rec.date}</div>
                    </div>
                    <button style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--grey3)', cursor: 'pointer' }}>
                        ⋮
                    </button>
                </div>
            ))}
        </div>
    );
}
