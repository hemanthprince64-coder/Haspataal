'use client'

import { useState, useEffect } from 'react';
import { getDiagnosticCatalog, createDiagnosticOrder, getPatientOrders } from '@/app/actions-diagnostics';
// Mock services for fetching hospitals/patients if needed currently
import { services } from '@/lib/services';

export default function DiagnosticsPage() {
    const [catalog, setCatalog] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]);
    const [hospitalId, setHospitalId] = useState('');
    const [patientId, setPatientId] = useState(''); // In real app, from session context

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Load initial catalog
        getDiagnosticCatalog().then(res => {
            if (res.success) setCatalog(res.data);
        });

        // Hardcode a patient ID for demo (or mock mechanism)
        // In real app: import { useSession } from ...
        // For now, let's ask user to input Patient ID (or we simulate it)
    }, []);

    function toggleTest(test) {
        if (selectedTests.find(t => t.id === test.id)) {
            setSelectedTests(selectedTests.filter(t => t.id !== test.id));
        } else {
            setSelectedTests([...selectedTests, test]);
        }
    }

    async function handleSubmit(formData) {
        setLoading(true);
        setMessage('');

        // Append selected tests manually (since they are state, not inputs)
        selectedTests.forEach(test => {
            formData.append('testIds', test.id);
        });

        const result = await createDiagnosticOrder(null, formData);

        if (result?.success) {
            setMessage(`✅ ${result.message}`);
            setSelectedTests([]); // Reset
        } else {
            setMessage(`❌ ${result?.message || 'Order failed.'}`);
        }
        setLoading(false);
    }

    return (
        <main className="container page-enter" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                🧪 Diagnostic Services
            </h1>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Create New Order</h2>

                {message && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        background: message.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                        color: message.startsWith('✅') ? '#047857' : '#b91c1c'
                    }}>
                        {message}
                    </div>
                )}

                <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Hospital ID</label>
                            <input type="text" name="hospitalId" required className="form-input" placeholder="UUID" onChange={e => setHospitalId(e.target.value)} />
                            <small style={{ color: 'var(--text-muted)' }}>Use a valid Hospital ID from DB</small>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Patient ID</label>
                            <input type="text" name="patientId" required className="form-input" placeholder="UUID" onChange={e => setPatientId(e.target.value)} />
                            <small style={{ color: 'var(--text-muted)' }}>Use a valid Patient ID from DB</small>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>In-Stock Tests (Global Catalog)</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '0.75rem',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            border: '1px solid var(--border)',
                            padding: '1rem',
                            borderRadius: '8px'
                        }}>
                            {catalog.map(test => {
                                const isSelected = selectedTests.find(t => t.id === test.id);
                                return (
                                    <div
                                        key={test.id}
                                        onClick={() => toggleTest(test)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '6px',
                                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            background: isSelected ? 'var(--primary-light)' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{test.testName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{test.testCode || 'N/A'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '600' }}>Selected: {selectedTests.length} tests</span>
                        <button
                            type="submit"
                            disabled={loading || selectedTests.length === 0}
                            className="btn btn-primary"
                        >
                            {loading ? 'Creating Order...' : 'Create Order'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Your Past Orders</h2>
                <p style={{ color: 'var(--text-muted)' }}>Enter Patient ID above to view history (not implemented in this minimal view).</p>
                {/* Could implement fetching using patientId state + useEffect */}
            </div>
        </main>
    );
}
