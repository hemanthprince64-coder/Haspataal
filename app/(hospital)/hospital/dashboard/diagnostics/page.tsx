"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface LabOrder {
  id: string;
  patientName: string;
  testName: string;
  orderedAt: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CRITICAL";
  result?: string;
}

export default function DiagnosticsPage() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hospital/diagnostics/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusIcon = {
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
    IN_PROGRESS: <AlertCircle className="h-4 w-4 text-blue-500" />,
    COMPLETED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    CRITICAL: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FlaskConical className="h-7 w-7 text-violet-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diagnostics & Labs</h1>
          <p className="text-sm text-gray-500">Lab orders, results, and reports</p>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Patient", "Test", "Ordered At", "Status", "Result"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No lab orders found.</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{o.patientName}</td>
                <td className="px-4 py-3 text-gray-700">{o.testName}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(o.orderedAt).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-xs font-medium">
                    {statusIcon[o.status]} {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{o.result ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
