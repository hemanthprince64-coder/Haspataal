import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getUnbilledPatients, searchInvoices } from './actions';
import { BillingDashboard } from './components/BillingDashboard';

export default async function BillingPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('session_user');

  if (!userCookie) {
    redirect('/login');
  }

  const user = JSON.parse(userCookie.value);
  // RBAC check
  const allowedRoles = ['PLATFORM_ADMIN', 'HOSPITAL_ADMIN', 'CASHIER', 'FINANCE_OFFICER'];
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You do not have permission to access the Billing module.</p>
      </div>
    );
  }

  // Pre-fetch initial data
  const [unbilledPatients, initialInvoices] = await Promise.all([
    getUnbilledPatients(),
    searchInvoices(''),
  ]);

  return (
    <div className="p-6">
      <BillingDashboard initialUnbilled={unbilledPatients} initialInvoices={initialInvoices} />
    </div>
  );
}
