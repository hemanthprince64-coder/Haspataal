import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUnbilledChargeItemsForPatient } from '../../actions';
import { IssueInvoiceButton } from '../../components/IssueInvoiceButton';

export default async function IssueInvoicePage({ params }: { params: Promise<{ patientId: string }> }) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('session_user');

  if (!userCookie) {
    redirect('/login');
  }

  const { patientId } = await params;
  const unbilledItems = await getUnbilledChargeItemsForPatient(patientId);

  const totalAmount = unbilledItems.reduce(
    (sum, item) => sum + (item.netAmount?.toNumber() || 0),
    0,
  );

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issue Invoice</h1>
          <p className="text-muted-foreground">Review unbilled charges before generation</p>
        </div>
        <Link href="/dashboard/billing" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-hidden mb-6">
        {unbilledItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No unbilled charges found for this patient.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Service/Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unbilledItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.sourceEvent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {item.currency} {item.netAmount?.toNumber().toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td
                  colSpan={2}
                  className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right"
                >
                  Estimated Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  ₹{totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <IssueInvoiceButton patientId={patientId} disabled={unbilledItems.length === 0} />
    </div>
  );
}
