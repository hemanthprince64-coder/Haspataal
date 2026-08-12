'use client';

export function InvoicePreview({ invoice }: { invoice: any }) {
  if (!invoice) return <div>Invoice not found.</div>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white shadow rounded p-8 max-w-4xl mx-auto my-8 print:shadow-none print:m-0 print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wider">Invoice</h2>
          <p className="text-sm text-gray-500 mt-1">
            Status: <span className="font-semibold text-green-600">{invoice.status}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">Invoice No: {invoice.invoiceNumber}</p>
          <p className="text-sm text-gray-500">
            Date: {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Addresses */}
      <div className="flex justify-between mb-8">
        <div>
          <p className="text-sm font-bold text-gray-700 uppercase mb-1">Billed To:</p>
          <p className="text-gray-900 font-medium">{invoice.patient?.name}</p>
          <p className="text-gray-500 text-sm">MRN: {invoice.patient?.mrn}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-700 uppercase mb-1">Hospital:</p>
          <p className="text-gray-900 font-medium">{invoice.hospital?.name}</p>
          <p className="text-gray-500 text-sm">{invoice.hospital?.address}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8 overflow-hidden rounded border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                Qty
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                Unit Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoice.lineItems?.map((item: any, i: number) => (
              <tr key={i}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                <td className="px-6 py-4 text-sm text-gray-500 text-right">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-500 text-right">
                  {Number(item.unitPrice).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium text-right">
                  {Number(item.totalAmount || item.taxableAmount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Subtotal</span>
            <span className="text-gray-900 font-medium">
              ₹{Number(invoice.subtotal).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Discount</span>
            <span className="text-gray-900 font-medium text-green-600">
              -₹{Number(invoice.discountTotal).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Tax (GST)</span>
            <span className="text-gray-900 font-medium">
              ₹{Number(invoice.gstTotal).toFixed(2)}
            </span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="text-gray-900 font-bold text-base">Total Amount</span>
            <span className="text-blue-600 font-bold text-xl">
              ₹{Number(invoice.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions (Hidden in Print) */}
      <div className="mt-12 flex justify-end gap-4 border-t pt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-gray-100 text-gray-800 font-medium rounded hover:bg-gray-200 transition"
        >
          Print / Download PDF
        </button>
        <button
          disabled
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded opacity-50 cursor-not-allowed"
        >
          Collect Payment (Coming Soon)
        </button>
      </div>
    </div>
  );
}
