'use client';

import { useState } from 'react';

import Link from 'next/link';

export function UnbilledPatientsTable({ unbilledPatients }: { unbilledPatients: any[] }) {
  if (!unbilledPatients || unbilledPatients.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow text-center text-gray-500">
        No patients with unbilled charges.
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              MRN
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unbilled Charges
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estimated Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {unbilledPatients.map((p) => (
            <tr key={p.patientId}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {p.patientName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">{p.mrn}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">{p.unbilledCount} items</td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                ₹{p.unbilledTotal.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/dashboard/billing/issue/${p.patientId}`}
                  className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                >
                  Review & Issue
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
