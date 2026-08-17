'use client';

import { Button } from '@haspataal/ui';
import { Badge } from '@haspataal/ui';
import { CheckCircle2, XCircle } from 'lucide-react';

import { useActionState } from 'react';

import { cancelVisitHospital, completeVisitHospital } from '@/app/actions';

const initialState = { message: '', success: false };

export default function ReportActions({ visitId, status }) {
  const [cancelState, cancelAction, isCancelling] = useActionState(
    cancelVisitHospital,
    initialState,
  );
  const [completeState, completeAction, isCompleting] = useActionState(
    completeVisitHospital,
    initialState,
  );

  if (cancelState?.success) return <Badge variant="destructive">Cancelled</Badge>;
  if (completeState?.success) return <Badge variant="success">Completed</Badge>;

  if (status !== 'SCHEDULED') {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="flex gap-2">
      <form action={completeAction}>
        <input type="hidden" name="visitId" value={visitId} />
        <Button type="submit" disabled={isCompleting} size="sm" variant="success">
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </form>
      <form action={cancelAction}>
        <input type="hidden" name="visitId" value={visitId} />
        <Button type="submit" disabled={isCancelling} size="sm" variant="destructive">
          <XCircle className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
