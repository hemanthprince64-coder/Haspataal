'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@haspataal/ui';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  verifyPharmacyOrder,
  dispenseMedication,
  cancelPharmacyOrder,
} from '@/app/actions/pharmacy';

export default function DispenseWorkspace({ execution }: { execution: any }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionFn: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      await actionFn();
      // On success, Next.js server actions revalidatePath which updates UI,
      // but let's refresh to be sure we get latest state
      router.refresh();
    } catch (err: any) {
      if (err.message.includes('VERSION_CONFLICT')) {
        setError(
          'This prescription has already been modified. Refreshing to get the latest version...',
        );
        setTimeout(() => {
          router.refresh();
          setError(null);
        }, 2000);
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerify = () =>
    handleAction(() =>
      verifyPharmacyOrder({
        executionId: execution.id,
        expectedVersion: execution.version,
      }),
    );

  const onCancel = () => {
    const reason = window.prompt('Enter cancellation reason:');
    if (!reason) return;
    handleAction(() =>
      cancelPharmacyOrder({
        executionId: execution.id,
        expectedVersion: execution.version,
        reason,
      }),
    );
  };

  // Basic dispense (dispenses all remaining)
  const onDispenseAll = () => {
    const items = execution.items
      .map((i: any) => ({
        itemId: i.id,
        quantity: i.prescribedQuantity - i.dispensedQuantity,
      }))
      .filter((i: any) => i.quantity > 0);

    handleAction(() =>
      dispenseMedication({
        executionId: execution.id,
        expectedVersion: execution.version,
        items,
      }),
    );
  };

  return (
    <div className="space-y-6 mt-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-slate-50 rounded-md">
                  <div>
                    <p className="text-sm text-slate-500">Order ID</p>
                    <p className="font-medium">{execution.clinicalOrderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {execution.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Timestamp</p>
                    <p className="font-medium">{new Date(execution.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Medications</h3>
                  <table className="w-full text-sm text-left border">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2">Drug</th>
                        <th className="px-4 py-2">Instructions</th>
                        <th className="px-4 py-2">Prescribed</th>
                        <th className="px-4 py-2">Dispensed</th>
                        <th className="px-4 py-2">Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {execution.items.map((item: any) => {
                        const remaining = item.prescribedQuantity - item.dispensedQuantity;
                        return (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-2 font-medium">{item.drugName}</td>
                            <td className="px-4 py-2 text-slate-500">
                              {item.dosage} {item.route} {item.frequency}
                            </td>
                            <td className="px-4 py-2">{item.prescribedQuantity}</td>
                            <td className="px-4 py-2">{item.dispensedQuantity}</td>
                            <td className="px-4 py-2 font-medium text-indigo-600">{remaining}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-slate-500">Name:</span>{' '}
                  {execution.clinicalOrder?.patient?.name}
                </p>
                <p>
                  <span className="text-slate-500">MRN:</span>{' '}
                  {execution.clinicalOrder?.patient?.mrn}
                </p>
                <p>
                  <span className="text-slate-500">Allergies:</span>{' '}
                  {execution.clinicalOrder?.patient?.allergies || 'None reported'}
                </p>
                <p>
                  <span className="text-slate-500">Encounter ID:</span>{' '}
                  {execution.clinicalOrder?.encounterId}
                </p>
                <p>
                  <span className="text-slate-500">Doctor:</span>{' '}
                  {execution.clinicalOrder?.doctor?.name}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {execution.status === 'PRESCRIBED' && (
                <button
                  onClick={onVerify}
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  Verify Prescription
                </button>
              )}

              {['VERIFIED', 'PARTIALLY_DISPENSED'].includes(execution.status) && (
                <button
                  onClick={onDispenseAll}
                  disabled={loading}
                  className="w-full py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Dispense Remaining
                </button>
              )}

              {['PRESCRIBED', 'VERIFIED'].includes(execution.status) && (
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="w-full py-2 border border-red-200 text-red-600 rounded-md font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}

              {['DISPENSED', 'CANCELLED'].includes(execution.status) && (
                <div className="text-center text-slate-500 text-sm py-2">
                  No further actions available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
