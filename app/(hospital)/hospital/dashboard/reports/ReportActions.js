'use client';

import { useActionState } from 'react';
import { cancelVisitHospital, completeVisitHospital } from '@/app/actions';

const initialState = { message: '', success: false };

export default function ReportActions({ visitId, status }) {
    const [cancelState, cancelAction, isCancelling] = useActionState(cancelVisitHospital, initialState);
    const [completeState, completeAction, isCompleting] = useActionState(completeVisitHospital, initialState);

    if (cancelState?.success) return <span className="badge badge-danger">Cancelled</span>;
    if (completeState?.success) return <span className="badge badge-success">Completed</span>;

    if (status !== 'SCHEDULED') {
        return <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>—</span>;
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <form action={completeAction}>
                <input type="hidden" name="visitId" value={visitId} />
                <button type="submit" disabled={isCompleting} className="btn btn-sm badge-success" style={{ border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    {isCompleting ? '...' : '✓'}
                </button>
            </form>
            <form action={cancelAction}>
                <input type="hidden" name="visitId" value={visitId} />
                <button type="submit" disabled={isCancelling} className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    {isCancelling ? '...' : '✕'}
                </button>
            </form>
        </div>
    );
}
