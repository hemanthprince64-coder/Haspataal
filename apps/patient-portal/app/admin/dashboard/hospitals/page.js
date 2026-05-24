import { services } from '@/lib/services';

import HospitalActions from './HospitalActions';

export const dynamic = 'force-dynamic';

export default async function AdminHospitalsPage() {
  const rawHospitals = await services.admin.getAllHospitals();

  // Fetch doctor counts concurrently
  const hospitals = await Promise.all(
    rawHospitals.map(async (h) => {
      const doctors = await services.platform.getHospitalDoctors(h.id);
      return { ...h, doctorCount: doctors.length };
    }),
  );

  const pending = hospitals.filter((h) => h.verificationStatus === 'pending');
  const active = hospitals.filter(
    (h) => h.accountStatus === 'active' && h.verificationStatus === 'verified',
  );
  const others = hospitals.filter(
    (h) => h.verificationStatus !== 'pending' && h.accountStatus !== 'active',
  );

  return (
    <div className="page-enter">
      <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
        Hospital Management
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        {hospitals.length} total hospitals • {pending.length} pending • {active.length} active
      </p>

      {/* Pending Approvals */}
      {pending.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ⏳ Pending Approval
            <span className="badge badge-warning">{pending.length}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pending.map((h) => (
              <div
                key={h.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  borderLeft: '4px solid #f59e0b',
                  padding: '1.25rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: '700', fontSize: '1.05rem', margin: '0 0 0.5rem 0' }}>
                    {h.legalName || h.name}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      fontSize: '0.82rem',
                      color: '#64748b',
                    }}
                  >
                    <span>
                      📍 <strong>City:</strong> {h.city || '—'}
                    </span>
                    <span>
                      🆔 <strong>Reg No:</strong> {h.registrationNumber || '—'}
                    </span>
                    <span>
                      🩺 <strong>Medical Council No:</strong> {h.medicalCouncilNumber || '—'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      marginTop: '0.75rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    {h.googleLocationUrl && (
                      <a
                        href={h.googleLocationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'underline' }}
                      >
                        📍 View Map Location
                      </a>
                    )}
                    {h.approvalDocumentUrl && (
                      <a
                        href={h.approvalDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0d9488', fontWeight: '600', textDecoration: 'underline' }}
                      >
                        📄 Preview Legal License
                      </a>
                    )}
                  </div>
                </div>
                <HospitalActions hospitalId={h.id} name={h.name} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Hospitals */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
          ✅ Active Hospitals
        </h2>
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Metadata</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {active.map((h) => (
                  <tr key={h.id}>
                    <td>
                      <strong>{h.legalName || h.name}</strong>
                      <br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        📍 {h.city} · 👨‍⚕️ {h.doctorCount} doctors
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                        <div>
                          <strong>Reg No:</strong> {h.registrationNumber || '—'}
                        </div>
                        <div>
                          <strong>Council No:</strong> {h.medicalCouncilNumber || '—'}
                        </div>
                        {h.approvalDocumentUrl && (
                          <a
                            href={h.approvalDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#0d9488',
                              textDecoration: 'underline',
                              fontSize: '0.75rem',
                              display: 'inline-block',
                              marginTop: '0.2rem',
                            }}
                          >
                            📄 View License
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">ACTIVE</span>
                    </td>
                    <td>
                      <HospitalActions hospitalId={h.id} name={h.name} isActive />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Other Hospitals */}
      {others.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
            Other Hospitals
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {others.map((h) => (
              <div
                key={h.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: 0.7,
                }}
              >
                <div>
                  <h3 style={{ fontWeight: '700' }}>{h.legalName || h.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📍 {h.city}</p>
                </div>
                <span className="badge badge-danger">{h.accountStatus}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
