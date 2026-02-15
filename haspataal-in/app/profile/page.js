'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // We need SessionProvider or just fetch /api/me?
// Better: Server Component wrapper around Client Form? 
// For simplicity in MVP, client component.

export default function ProfilePage() {
    const [records, setRecords] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Fetch records
        fetch('/api/records').then(res => res.json()).then(setRecords).catch(console.error);
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert('Uploaded successfully!');
                // Refresh records
                fetch('/api/records').then(res => res.json()).then(setRecords);
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error uploading');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>My Health Records</h1>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Upload New Record</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="file"
                        accept=".pdf,.jpg,.png,.jpeg"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="form-input"
                    />
                    {uploading && <span>⏳ Uploading...</span>}
                </div>
                <small style={{ color: 'var(--text-muted)' }}>Supported: PDF, JPG, PNG under 5MB</small>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {records.map(r => (
                    <div key={r.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: '600' }}>{r.fileName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(r.uploadedAt).toLocaleDateString()}</div>
                        </div>
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                            View / Download
                        </a>
                    </div>
                ))}
                {records.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No records uploaded yet.</p>}
            </div>
        </div>
    );
}
