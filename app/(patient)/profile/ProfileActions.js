'use client';

import { useActionState } from 'react';
import { cancelAppointmentPatient } from '@/app/actions';

const initialState = { message: '', success: false };

export default function ProfileActions({ visitId }) {
    const [state, formAction, isPending] = useActionState(cancelAppointmentPatient, initialState);

    if (state?.success) {
        return (
            <span className="badge badge-danger">Cancelled</span>
        );
    }

    return (
        <form action={formAction} className="flex flex-col gap-1 items-end">
            <input type="hidden" name="visitId" value={visitId} />
            <button
                type="submit"
                disabled={isPending}
                className="btn btn-sm"
                style={{
                    background: 'var(--danger-light)',
                    color: 'var(--danger)',
                    fontWeight: '600',
                }}
            >
                {isPending ? 'Cancelling...' : '✕ Cancel'}
            </button>
            {state?.message && !state.success && (
                <div className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100 whitespace-nowrap">
                    ⚠️ {state.message}
                </div>
            )}
        </form>
    );
}
