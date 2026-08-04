'use client';

import { useState } from 'react';

import Link from 'next/link';

export function InvoiceSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Invoice Number, Patient Name or MRN..."
          className="flex-1 border border-gray-300 rounded px-4 py-2 focus:ring focus:ring-blue-200 outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>
    </div>
  );
}

export function InvoiceTable({ invoices }: { invoices: any[] }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow text-center text-gray-500">
        No recent invoices found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice No.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {inv.invoiceNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {new Date(inv.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">{inv.patient?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                ₹{inv.totalAmount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {inv.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/dashboard/billing/invoice/${inv.id}`}
                  className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                >
                  Preview
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
