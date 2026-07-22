/* eslint-disable */
'use client';

import { ClipboardList, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

interface DrugStock {
  id: string;
  name: string;
  batchNumber: string;
  systemQuantity: number;
  physicalQuantity?: number;
  reason?: string;
}

export default function InventoryReconciliation() {
  const [stocks, setStocks] = useState<DrugStock[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch from /api/hospital/pharmacy/inventory
    // Mocking for UI demonstration
    setStocks([
      { id: '1', name: 'Paracetamol 500mg', batchNumber: 'B101', systemQuantity: 1500 },
      { id: '2', name: 'Amoxicillin 250mg', batchNumber: 'B102', systemQuantity: 400 },
      { id: '3', name: 'Ibuprofen 400mg', batchNumber: 'B103', systemQuantity: 850 },
    ]);
  }, []);

  const handlePhysicalCountChange = (id: string, value: string) => {
    setStocks(
      stocks.map((s) =>
        s.id === id
          ? { ...s, physicalQuantity: value === '' ? undefined : parseInt(value, 10) }
          : s,
      ),
    );
  };

  const handleReasonChange = (id: string, value: string) => {
    setStocks(stocks.map((s) => (s.id === id ? { ...s, reason: value } : s)));
  };

  const handleSubmit = async () => {
    const variances = stocks.filter(
      (s) => s.physicalQuantity !== undefined && s.physicalQuantity !== s.systemQuantity,
    );

    const missingReasons = variances.filter((v) => !v.reason);
    if (missingReasons.length > 0) {
      toast.error('Please provide a reason code for all stock variances.');
      return;
    }

    setLoading(true);
    try {
      // API call to /api/hospital/pharmacy/reconcile would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Successfully reconciled ${variances.length} item variances.`);
      // Reset after sync
      setStocks(
        stocks.map((s) => ({
          ...s,
          systemQuantity: s.physicalQuantity ?? s.systemQuantity,
          physicalQuantity: undefined,
          reason: undefined,
        })),
      );
    } catch (e) {
      toast.error('Failed to submit reconciliation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
            End-of-Shift Stock Reconciliation
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Perform blind physical counts and report variances.
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          Submit Audit
        </Button>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Drug Name</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead className="text-right">System Qty</TableHead>
              <TableHead className="w-[150px]">Physical Count</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="w-[200px]">Reason Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock) => {
              const hasVariance =
                stock.physicalQuantity !== undefined &&
                stock.physicalQuantity !== stock.systemQuantity;
              const varianceAmt =
                stock.physicalQuantity !== undefined
                  ? stock.physicalQuantity - stock.systemQuantity
                  : 0;

              return (
                <TableRow key={stock.id} className={hasVariance ? 'bg-amber-50/50' : ''}>
                  <TableCell className="font-medium">{stock.name}</TableCell>
                  <TableCell>{stock.batchNumber}</TableCell>
                  <TableCell className="text-right">{stock.systemQuantity}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={stock.physicalQuantity ?? ''}
                      onChange={(e) => handlePhysicalCountChange(stock.id, e.target.value)}
                      placeholder="Count..."
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {hasVariance ? (
                      <Badge
                        variant={varianceAmt < 0 ? 'destructive' : 'default'}
                        className="ml-auto"
                      >
                        {varianceAmt > 0 ? '+' : ''}
                        {varianceAmt}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {hasVariance && (
                      <Select
                        value={stock.reason}
                        onValueChange={(val) => handleReasonChange(stock.id, val)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAMAGE">Damaged Goods</SelectItem>
                          <SelectItem value="PILFERAGE">Pilferage / Missing</SelectItem>
                          <SelectItem value="DATA_ENTRY">Data Entry Error</SelectItem>
                          <SelectItem value="EXPIRY">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
