/* eslint-disable */
'use client';

import { ChevronLeft, FlaskConical, Microscope, User, Building2, Loader2 } from 'lucide-react';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import DiagnosticDocumentManager from '@/components/hospital/DiagnosticDocumentManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface OrderItem {
  id: string;
  status: string;
  test: { testName: string } | null;
  results: { id: string }[];
}

interface Order {
  id: string;
  orderStatus: string;
  createdAt: string;
  patient: { id: string; name: string; phone: string } | null;
  doctor: { id: string; fullName: string } | null;
  items: OrderItem[];
}

export default function DiagnosticOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/hospital/diagnostics/orders/${orderId}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setOrder(data.order);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
          <p className="text-slate-500 mb-4">The requested diagnostic order could not be loaded.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/hospital/dashboard/diagnostics">Back to Diagnostics</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const results = order.items.flatMap((item) =>
    item.results.map((result) => ({
      id: result.id,
      label: `${item.test?.testName || 'Test'} - Result`,
    })),
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-blue-600"
            >
              <Link href="/hospital/dashboard/diagnostics" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FlaskConical className="h-5 w-5 text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Diagnostic Order
                </h1>
                <Badge
                  className={
                    order.orderStatus === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : order.orderStatus === 'CANCELLED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                  }
                >
                  {order.orderStatus}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-medium">{order.id.slice(-8).toUpperCase()}</span> | Ordered{' '}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200 rounded-xl lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Microscope className="h-5 w-5 text-blue-600" /> Tests
              </h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.test?.testName || 'Unknown Test'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Result: {item.results.length > 0 ? 'Available' : 'Pending'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 rounded-xl">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" /> Patient
                </h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Name</p>
                    <p className="text-sm font-medium text-slate-900">
                      {order.patient?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Phone</p>
                    <p className="text-sm font-medium text-slate-900">
                      {order.patient?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 rounded-xl">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" /> Doctor
                </h2>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">
                    Consulting Doctor
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {order.doctor?.fullName || 'Not Assigned'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DiagnosticDocumentManager orderId={order.id} results={results} />
      </div>
    </div>
  );
}
