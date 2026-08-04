'use client';

import { useState } from 'react';

import { searchInvoices } from '../actions';
import { InvoiceSearch, InvoiceTable } from './InvoiceSearch';
import { UnbilledPatientsTable } from './UnbilledPatientsTable';

export function BillingDashboard({
  initialUnbilled,
  initialInvoices,
}: {
  initialUnbilled: any[];
  initialInvoices: any[];
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchInvoices(query);
      setInvoices(results);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Billing Dashboard</h1>
        <p className="text-muted-foreground">
          Manage invoices, issue new bills, and track financial records.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Patients Pending Billing</h2>
        <UnbilledPatientsTable unbilledPatients={initialUnbilled} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Invoice History & Search</h2>
        <InvoiceSearch onSearch={handleSearch} />
        {isSearching ? (
          <div className="text-center p-6 text-gray-500">Searching...</div>
        ) : (
          <InvoiceTable invoices={invoices} />
        )}
      </div>
    </div>
  );
}
