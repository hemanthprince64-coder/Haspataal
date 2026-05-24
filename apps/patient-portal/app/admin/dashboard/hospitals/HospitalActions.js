'use client';

import { Check, X, Pause, Loader2 } from 'lucide-react';

import { useActionState } from 'react';

import { approveHospitalAction, rejectHospitalAction, suspendHospitalAction } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const initialState = { message: '', success: false };

export default function HospitalActions({ hospitalId, name, isActive }) {
  const [approveState, approveAction, isApproving] = useActionState(
    approveHospitalAction,
    initialState,
  );
  const [rejectState, rejectAction, isRejecting] = useActionState(
    rejectHospitalAction,
    initialState,
  );
  const [suspendState, suspendAction, isSuspending] = useActionState(
    suspendHospitalAction,
    initialState,
  );

  if (approveState?.success) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase tracking-wider text-[10px] py-1.5 px-3">
        ✅ Approved
      </Badge>
    );
  }
  if (rejectState?.success) {
    return (
      <Badge
        variant="destructive"
        className="font-bold uppercase tracking-wider text-[10px] py-1.5 px-3"
      >
        ❌ Rejected
      </Badge>
    );
  }
  if (suspendState?.success) {
    return (
      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase tracking-wider text-[10px] py-1.5 px-3">
        ⏸️ Suspended
      </Badge>
    );
  }

  if (isActive) {
    return (
      <form action={suspendAction}>
        <input type="hidden" name="hospitalId" value={hospitalId} />
        <Button
          type="submit"
          disabled={isSuspending}
          variant="outline"
          className="border-amber-500/20 hover:bg-amber-500/10 text-amber-500 hover:text-amber-400 font-semibold text-xs h-9 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          {isSuspending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Pause className="w-3.5 h-3.5" />
          )}
          <span>Suspend</span>
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <form action={approveAction}>
        <input type="hidden" name="hospitalId" value={hospitalId} />
        <Button
          type="submit"
          disabled={isApproving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-3.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/5 transition-colors"
        >
          {isApproving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          <span>Approve</span>
        </Button>
      </form>

      <form action={rejectAction}>
        <input type="hidden" name="hospitalId" value={hospitalId} />
        <Button
          type="submit"
          disabled={isRejecting}
          variant="outline"
          className="border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-semibold text-xs h-9 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          {isRejecting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
          <span>Reject</span>
        </Button>
      </form>
    </div>
  );
}
