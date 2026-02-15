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
        <form action={formAction}>
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
        </form>
    );
}
