'use client';

import { Truck, ArrowRight, PackageOpen, CheckCircle, PackageSearch } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

type TransferState =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PICKED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'RECONCILED'
  | 'REJECTED'
  | 'CANCELLED';

interface StockTransfer {
  id: string;
  sourceHospital: string;
  destHospital: string;
  drugName: string;
  batchNumber: string;
  quantity: number;
  state: TransferState;
  requestedBy: string;
  lastUpdated: string;
}

export default function StockTransferWorkflow() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([
    {
      id: 'TRF-9001',
      sourceHospital: 'Muzaffarpur Pilot',
      destHospital: 'Urban Specialty',
      drugName: 'Paracetamol 500mg',
      batchNumber: 'B101',
      quantity: 500,
      state: 'REQUESTED',
      requestedBy: 'pharmacist_urban',
      lastUpdated: '2026-07-19T08:00:00Z',
    },
    {
      id: 'TRF-9002',
      sourceHospital: 'Urban Specialty',
      destHospital: 'Rural Polyclinic',
      drugName: 'Amoxicillin 250mg',
      batchNumber: 'B205',
      quantity: 200,
      state: 'DISPATCHED',
      requestedBy: 'pharmacist_rural',
      lastUpdated: '2026-07-18T16:45:00Z',
    },
    {
      id: 'TRF-9003',
      sourceHospital: 'Urban Specialty',
      destHospital: 'Muzaffarpur Pilot',
      drugName: 'Ibuprofen 400mg',
      batchNumber: 'B044',
      quantity: 1000,
      state: 'RECEIVED',
      requestedBy: 'pharmacist_muz',
      lastUpdated: '2026-07-17T11:20:00Z',
    },
  ]);

  const getStateBadge = (state: TransferState) => {
    switch (state) {
      case 'REQUESTED':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Requested
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Approved
          </Badge>
        );
      case 'PICKED':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Picked
          </Badge>
        );
      case 'DISPATCHED':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Truck className="w-3 h-3 mr-1" /> Dispatched
          </Badge>
        );
      case 'IN_TRANSIT':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Truck className="w-3 h-3 mr-1" /> In Transit
          </Badge>
        );
      case 'RECEIVED':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <PackageOpen className="w-3 h-3 mr-1" /> Received
          </Badge>
        );
      case 'RECONCILED':
        return (
          <Badge variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" /> Reconciled
          </Badge>
        );
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge>{state}</Badge>;
    }
  };

  const handleUpdateTransfer = (id: string, newState: TransferState) => {
    setTransfers(
      transfers.map((t) =>
        t.id === id ? { ...t, state: newState, lastUpdated: new Date().toISOString() } : t,
      ),
    );
    toast.success(`Transfer ${id} moved to ${newState}`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5 text-indigo-600" />
            Cross-Site Inventory Transfers (Chain of Custody)
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Manage network-wide drug transfers. Powered by privileged backend sagas.
          </p>
        </div>
        <Button>Request Transfer</Button>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer ID</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Drug & Batch</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((trf) => (
              <TableRow key={trf.id}>
                <TableCell className="font-medium text-slate-700">{trf.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{trf.sourceHospital}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{trf.destHospital}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{trf.drugName}</div>
                  <div className="text-xs text-slate-500 font-mono">Batch: {trf.batchNumber}</div>
                </TableCell>
                <TableCell className="text-right font-mono font-bold">{trf.quantity}</TableCell>
                <TableCell>{getStateBadge(trf.state)}</TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Update State
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Chain of Custody: {trf.id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-3 bg-slate-50 rounded border text-sm">
                          <p>
                            <strong>Route:</strong> {trf.sourceHospital} ➔ {trf.destHospital}
                          </p>
                          <p>
                            <strong>Item:</strong> {trf.quantity}x {trf.drugName} (Batch:{' '}
                            {trf.batchNumber})
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            Note: Modifying this state triggers a privileged cross-tenant database
                            transaction.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {trf.state === 'REQUESTED' && (
                            <>
                              <Button
                                onClick={() => handleUpdateTransfer(trf.id, 'APPROVED')}
                                className="bg-indigo-600 hover:bg-indigo-700"
                              >
                                Approve Request
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleUpdateTransfer(trf.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {trf.state === 'APPROVED' && (
                            <Button onClick={() => handleUpdateTransfer(trf.id, 'PICKED')}>
                              Mark Picked
                            </Button>
                          )}
                          {trf.state === 'PICKED' && (
                            <Button onClick={() => handleUpdateTransfer(trf.id, 'DISPATCHED')}>
                              Dispatch (Deduct from Source)
                            </Button>
                          )}
                          {trf.state === 'DISPATCHED' && (
                            <Button onClick={() => handleUpdateTransfer(trf.id, 'IN_TRANSIT')}>
                              Mark In-Transit
                            </Button>
                          )}
                          {trf.state === 'IN_TRANSIT' && (
                            <Button onClick={() => handleUpdateTransfer(trf.id, 'RECEIVED')}>
                              Receive (Add to Destination)
                            </Button>
                          )}
                          {trf.state === 'RECEIVED' && (
                            <Button onClick={() => handleUpdateTransfer(trf.id, 'RECONCILED')}>
                              Complete Reconciliation
                            </Button>
                          )}
                          {(trf.state === 'RECONCILED' ||
                            trf.state === 'REJECTED' ||
                            trf.state === 'CANCELLED') && (
                            <p className="text-sm text-slate-500 italic">
                              This transfer has reached a terminal state.
                            </p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
