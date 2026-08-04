import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getInvoiceDetails } from '../../actions';
import { InvoicePreview } from '../../components/InvoicePreview';

export default async function InvoicePreviewPage({ params }: { params: { invoiceId: string } }) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('session_user');

  if (!userCookie) {
    redirect('/login');
  }

  const { invoiceId } = params;
  const invoice = await getInvoiceDetails(invoiceId);

  if (!invoice) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-2xl font-bold">Invoice Not Found</h2>
        <p>
          The invoice you are looking for does not exist or you do not have permission to view it.
        </p>
        <Link href="/dashboard/billing" className="text-blue-600 hover:underline mt-4 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in print:p-0 print:max-w-none">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Preview</h1>
          <p className="text-muted-foreground">View and print invoice details</p>
        </div>
        <Link href="/dashboard/billing" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      <InvoicePreview invoice={invoice} />
    </div>
  );
}
