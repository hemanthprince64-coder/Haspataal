'use client';

import { useActionState } from 'react';
import { approveHospitalAction, rejectHospitalAction, suspendHospitalAction } from '@/app/actions';

const initialState = { message: '', success: false };

export default function HospitalActions({ hospitalId, name, isActive }) {
    const [approveState, approveAction, isApproving] = useActionState(approveHospitalAction, initialState);
    const [rejectState, rejectAction, isRejecting] = useActionState(rejectHospitalAction, initialState);
    const [suspendState, suspendAction, isSuspending] = useActionState(suspendHospitalAction, initialState);

    if (approveState?.success) return <span className="badge badge-success">✅ Approved</span>;
    if (rejectState?.success) return <span className="badge badge-danger">❌ Rejected</span>;
    if (suspendState?.success) return <span className="badge badge-warning">⏸️ Suspended</span>;

    if (isActive) {
        return (
            <form action={suspendAction}>
                <input type="hidden" name="hospitalId" value={hospitalId} />
                <button type="submit" disabled={isSuspending} className="btn btn-sm" style={{
                    background: 'var(--danger-light)',
                    color: 'var(--danger)',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}>
                    {isSuspending ? '...' : '⏸️ Suspend'}
                </button>
            </form>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <form action={approveAction}>
                <input type="hidden" name="hospitalId" value={hospitalId} />
                <button type="submit" disabled={isApproving} className="btn btn-sm btn-primary">
                    {isApproving ? '...' : '✓ Approve'}
                </button>
            </form>
            <form action={rejectAction}>
                <input type="hidden" name="hospitalId" value={hospitalId} />
                <button type="submit" disabled={isRejecting} className="btn btn-sm" style={{
                    background: 'var(--danger-light)',
                    color: 'var(--danger)',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}>
                    {isRejecting ? '...' : '✕ Reject'}
                </button>
            </form>
        </div>
    );
}
