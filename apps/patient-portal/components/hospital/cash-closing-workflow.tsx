/* eslint-disable */
'use client';

import { IndianRupee, ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrintButton } from '@/components/ui/print-button';
import { PrintLayout } from '@/components/ui/print-layout';

export default function CashClosingWorkflow() {
  const [loading, setLoading] = useState(false);
  const [closed, setClosed] = useState(false);

  const stats = {
    totalCash: 45000,
    totalUPI: 12500,
    totalCard: 3200,
    cashInDrawer: 45000,
    expenses: 0,
    netCash: 45000,
  };

  const handleCloseRegister = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setClosed(true);
      toast.success('Register closed successfully');
    } catch (e) {
      toast.error('Failed to close register');
    } finally {
      setLoading(false);
    }
  };

  if (closed) {
    return (
      <PrintLayout hospitalName="Haspataal">
        <Card className="max-w-md mx-auto text-center py-8 shadow-none border-0">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Register Closed</h2>
          <p className="text-slate-500 mb-6">Cash collection reported successfully for today.</p>

          <div className="text-left bg-slate-50 p-6 rounded-lg mb-8 max-w-sm mx-auto space-y-3 border">
            <div className="flex justify-between font-bold text-lg border-b pb-2">
              <span>Total Cash Collected</span>
              <span className="text-green-600">₹{stats.netCash}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Card Collection</span>
              <span>₹{stats.totalCard}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>UPI Collection</span>
              <span>₹{stats.totalUPI}</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center print:hidden">
            <PrintButton variant="outline">Print Report</PrintButton>
            <Button onClick={() => setClosed(false)}>Open New Session</Button>
          </div>
        </Card>
      </PrintLayout>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="text-emerald-700 font-medium mb-1">Cash Collection</div>
            <div className="text-3xl font-bold text-emerald-900">₹{stats.totalCash}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-blue-700 font-medium mb-1">UPI Collection</div>
            <div className="text-3xl font-bold text-blue-900">₹{stats.totalUPI}</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="text-purple-700 font-medium mb-1">Card Collection</div>
            <div className="text-3xl font-bold text-purple-900">₹{stats.totalCard}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-slate-500" /> Cash Register Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="font-medium text-slate-700">Opening Balance</span>
            <span className="font-mono">₹0</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="font-medium text-slate-700">Total Cash Received</span>
            <span className="font-mono text-green-600">+ ₹{stats.totalCash}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="font-medium text-slate-700">Petty Cash Expenses</span>
            <span className="font-mono text-red-600">- ₹{stats.expenses}</span>
          </div>
          <div className="flex justify-between p-4 bg-slate-100 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 text-lg">Expected Cash in Drawer</span>
            <span className="font-bold font-mono text-xl">₹{stats.netCash}</span>
          </div>

          <div className="pt-6">
            <Button
              className="w-full h-12 text-lg bg-slate-800 hover:bg-slate-900"
              onClick={handleCloseRegister}
              disabled={loading}
            >
              <ArrowRightCircle className="w-5 h-5 mr-2" />
              {loading ? 'Processing...' : 'Close Register & Submit Report'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
