'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { issueInvoiceAction } from '../../actions';

export function IssueInvoiceButton({
  patientId,
  disabled,
}: {
  patientId: string;
  disabled: boolean;
}) {
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleIssue = async () => {
    setIsIssuing(true);
    setError(null);

    const result = await issueInvoiceAction(patientId);

    if (result.success && result.invoiceId) {
      router.push(`/dashboard/billing/invoice/${result.invoiceId}`);
    } else {
      setError(result.error || 'Failed to issue invoice.');
      setIsIssuing(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>
      )}
      <button
        onClick={handleIssue}
        disabled={disabled || isIssuing}
        className={`w-full py-3 rounded font-bold text-white transition-colors ${
          disabled || isIssuing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 shadow'
        }`}
      >
        {isIssuing ? 'Generating Invoice...' : 'Confirm & Issue Invoice'}
      </button>
    </div>
  );
}
