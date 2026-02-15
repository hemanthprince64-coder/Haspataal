import Link from 'next/link';

export default function ProfileLayout({ children }) {
    return (
        <div className="page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Patient Portal</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/profile" className="btn btn-ghost" style={{ borderRadius: '0', borderBottom: '2px solid transparent' }}>
                        👤 Personal Info
                    </Link>
                    <Link href="/profile/records" className="btn btn-ghost" style={{ borderRadius: '0', borderBottom: '2px solid transparent' }}>
                        📂 Medical Records
                    </Link>
                    <Link href="/profile/consent" className="btn btn-ghost" style={{ borderRadius: '0', borderBottom: '2px solid transparent' }}>
                        🔒 Consent Manager
                    </Link>
                </div>
            </div>
            {children}
        </div>
    );
}
