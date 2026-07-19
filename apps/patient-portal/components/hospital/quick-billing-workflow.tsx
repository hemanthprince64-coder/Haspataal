'use client';

import { Trash2, CheckCircle, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { useState, useMemo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrintButton } from '@/components/ui/print-button';
import { PrintLayout } from '@/components/ui/print-layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function QuickBillWorkflow({ services }: { services: any[] }) {
  const [patientInfo, setPatientInfo] = useState({ name: '', phone: '' });
  const [billItems, setBillItems] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [billGenerated, setBillGenerated] = useState<any>(null);

  const handleAddService = () => {
    const service = services.find((s) => s.id === selectedService);
    if (!service) return;

    // Check if already added
    if (billItems.some((i) => i.id === service.id)) {
      toast.error('Service already added');
      return;
    }

    setBillItems([...billItems, { ...service, qty: 1 }]);
    setSelectedService('');
  };

  const handleRemove = (id: string) => {
    setBillItems(billItems.filter((i) => i.id !== id));
  };

  const handleQtyChange = (id: string, qty: number) => {
    if (qty < 1) return;
    setBillItems(billItems.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const total = billItems.reduce((acc, item) => acc + item.basePrice * item.qty, 0);

  const handleGenerateBill = async () => {
    if (!patientInfo.name || !patientInfo.phone) {
      toast.error('Patient Name and Phone are required');
      return;
    }
    if (billItems.length === 0) {
      toast.error('Add at least one service to bill');
      return;
    }

    setLoading(true);
    try {
      // Mock API call to create bill
      await new Promise((r) => setTimeout(r, 800));
      setBillGenerated({
        id: `INV-${Date.now().toString().slice(-6)}`,
        patientInfo,
        items: billItems,
        total,
        date: new Date().toLocaleString(),
      });
      toast.success('Bill generated successfully');
    } catch (e) {
      toast.error('Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (billGenerated) {
          reset();
        }
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        if (!billGenerated && billItems.length > 0 && patientInfo.name) {
          e.preventDefault();
          handleGenerateBill();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [billGenerated, billItems, patientInfo]);

  const reset = () => {
    setBillGenerated(null);
    setBillItems([]);
    setPatientInfo({ name: '', phone: '' });
  };

  if (billGenerated) {
    return (
      <PrintLayout hospitalName="Haspataal">
        <Card className="max-w-lg mx-auto border-t-4 border-t-green-500 shadow-none border-x-0 border-b-0 print:max-w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <CardTitle>Bill Generated</CardTitle>
            <p className="text-slate-500 text-sm">Invoice #{billGenerated.id}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient</span>
                <span className="font-semibold">{billGenerated.patientInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone</span>
                <span>{billGenerated.patientInfo.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span>{billGenerated.date}</span>
              </div>
            </div>

            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-2 text-left font-medium">Service</th>
                    <th className="p-2 text-right font-medium">Qty</th>
                    <th className="p-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {billGenerated.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-right">{item.qty}</td>
                      <td className="p-2 text-right">₹{item.basePrice * item.qty}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold">
                  <tr>
                    <td colSpan={2} className="p-2 text-right">
                      Grand Total
                    </td>
                    <td className="p-2 text-right text-green-700">₹{billGenerated.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 print:hidden">
            <Button variant="outline" className="flex-1" onClick={reset}>
              New Bill
            </Button>
            <PrintButton className="flex-1 bg-blue-600 hover:bg-blue-700">Print Bill</PrintButton>
          </CardFooter>
        </Card>
      </PrintLayout>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" /> Patient Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Patient Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter name"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Mobile Number <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="10 digit number"
                value={patientInfo.phone}
                onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Bill Particulars
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger aria-label="Search and select service to add">
                    <SelectValue placeholder="Search and select service..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} (₹{s.basePrice})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddService} disabled={!selectedService}>
                Add
              </Button>
            </div>

            {billItems.length > 0 && (
              <div className="border rounded-lg overflow-x-auto mt-4">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3 text-left font-medium">Service</th>
                      <th className="p-3 text-right font-medium">Rate</th>
                      <th className="p-3 text-center font-medium">Qty</th>
                      <th className="p-3 text-right font-medium">Amount</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {billItems.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3 text-right">₹{item.basePrice}</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="1"
                            aria-label={`Quantity for ${item.name}`}
                            className="w-16 h-8 text-center mx-auto"
                            value={item.qty}
                            onChange={(e) =>
                              handleQtyChange(item.id, parseInt(e.target.value) || 1)
                            }
                          />
                        </td>
                        <td className="p-3 text-right font-medium">₹{item.basePrice * item.qty}</td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${item.name}`}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {billItems.length === 0 && (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                No items added to bill yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Items Total ({billItems.length})</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Discounts</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Taxes</span>
              <span>₹0</span>
            </div>
            <div className="pt-4 border-t border-dashed flex justify-between font-bold text-lg">
              <span>Net Payable</span>
              <span className="text-blue-700">₹{total}</span>
            </div>

            <div className="pt-6">
              <Button
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                disabled={billItems.length === 0 || loading || !patientInfo.name}
                onClick={handleGenerateBill}
              >
                {loading ? 'Processing...' : `Collect ₹${total} (Ctrl+Enter)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
