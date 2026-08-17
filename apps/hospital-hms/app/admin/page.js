import prisma from '@/lib/prisma';
import { approveHospitalAction, rejectHospitalAction } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // In real app, check for SUPER_ADMIN role here
  const pendingHospitals = await prisma.hospitalsMaster.findMany({
    where: { verificationStatus: 'pending' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        🏥 Platform Admin: Hospital Verification
      </h1>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {pendingHospitals.map((h) => (
          <div
            key={h.id}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {h.displayName || h.legalName}
              </h3>
              <p>
                📍 {h.city || 'Unknown'} | 📱 {h.contactNumber || 'N/A'}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Registered: {new Date(h.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <form action={approveHospitalAction}>
                <input type="hidden" name="id" value={h.id} />
                <button className="btn btn-success">✅ Approve</button>
              </form>
              <form action={rejectHospitalAction}>
                <input type="hidden" name="id" value={h.id} />
                <button className="btn btn-error">❌ Reject</button>
              </form>
            </div>
          </div>
        ))}

        {pendingHospitals.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            No pending hospital registrations.
          </p>
        )}
      </div>
    </div>
  );
}
