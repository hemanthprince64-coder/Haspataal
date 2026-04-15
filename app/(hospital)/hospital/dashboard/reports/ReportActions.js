'use client';

import { useActionState, useState } from 'react';
import { cancelVisitHospital, completeVisitHospital } from '@/app/actions';

const initialState = { message: '', success: false };

export default function ReportActions({ visitId, status }) {
    const [cancelState, cancelAction, isCancelling] = useActionState(cancelVisitHospital, initialState);
    const [completeState, completeAction, isCompleting] = useActionState(completeVisitHospital, initialState);
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');

    if (cancelState?.success) return <span className="badge badge-danger">Cancelled</span>;
    if (completeState?.success) return <span className="badge badge-success">Completed (AI Generated)</span>;

    if (status !== 'SCHEDULED') {
        return <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>—</span>;
    }

    if (showNotes) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' }}>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter clinical notes (e.g., Vitals, Diagnosis, Advice)..."
                    className="saas-input text-xs"
                    style={{ minHeight: '80px', padding: '0.5rem' }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <form action={completeAction} style={{ flex: 1 }}  encType="multipart/form-data">
                        <input type="hidden" name="visitId" value={visitId} />
                        <input type="hidden" name="notes" value={notes} />
                        
                        <div className="mb-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                📁 Prescription Image (Optional)
                            </label>
                            <input 
                                type="file" 
                                name="prescriptionImage"
                                accept="image/*,.pdf"
                                className="saas-input text-[10px] py-1"
                            />
                        </div>

                        <button type="submit" disabled={isCompleting || !notes} className="btn-saas-primary w-full py-1 text-[10px]">
                            {isCompleting ? 'Processing Care Journey...' : '✨ Generate AI Care Journey'}
                        </button>
                    </form>
                    <button onClick={() => setShowNotes(false)} className="btn-saas-secondary py-1 px-2 text-[10px] self-start">✕</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setShowNotes(true)} className="btn btn-sm badge-success" style={{ border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                ✓ Complete
            </button>
            <form action={cancelAction}>
                <input type="hidden" name="visitId" value={visitId} />
                <button type="submit" disabled={isCancelling} className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    {isCancelling ? '...' : '✕'}
                </button>
            </form>
        </div>
    );
}
