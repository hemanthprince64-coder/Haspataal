'use client';

import { useActionState } from 'react';
import { cancelAppointmentPatient } from '@/app/actions';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, Loader2, AlertCircle } from "lucide-react";

const initialState = { message: '', success: false };

export default function ProfileActions({ visitId }) {
    const [state, formAction, isPending] = useActionState(cancelAppointmentPatient, initialState);

    if (state?.success) {
        return (
            <Badge variant="destructive" className="bg-rose-50 text-rose-600 border-rose-100 px-3 py-1 font-bold uppercase tracking-widest gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Cancelled
            </Badge>
        );
    }

    return (
        <form action={formAction} className="flex flex-col gap-2 items-end">
            <input type="hidden" name="visitId" value={visitId} />
            <Button
                type="submit"
                variant="ghost"
                disabled={isPending}
                size="sm"
                className="h-9 px-4 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold gap-2 border border-transparent hover:border-rose-100 transition-all active:scale-95"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Cancelling...
                    </>
                ) : (
                    <>
                        <XCircle className="w-4 h-4" /> Cancel Consult
                    </>
                )}
            </Button>
            {state?.message && !state.success && (
                <div className="flex items-center gap-1.5 text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 animate-in fade-in slide-in-from-right-2">
                    <AlertCircle className="w-3.5 h-3.5" /> {state.message}
                </div>
            )}
        </form>
    );
}

