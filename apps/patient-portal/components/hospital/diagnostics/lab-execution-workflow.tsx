'use client';

import {
  Microscope,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Beaker,
  Zap,
} from 'lucide-react';
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

type LabState =
  | 'ORDERED'
  | 'PENDING_COLLECTION'
  | 'COLLECTED'
  | 'RECEIVED_IN_LAB'
  | 'IN_ANALYZER_QUEUE'
  | 'RESULTED'
  | 'VERIFIED'
  | 'RELEASED_TO_CLINICIAN';

interface LabOrder {
  id: string;
  patientName: string;
  testName: string;
  urgency: 'ROUTINE' | 'STAT' | 'CRITICAL';
  state: LabState;
  hasCriticalValue?: boolean;
  criticalAcknowledged?: boolean;
  resultValue?: string;
  lastUpdated: string;
}

export default function LabExecutionWorkflow() {
  const [orders, setOrders] = useState<LabOrder[]>([
    {
      id: 'LAB-2001',
      patientName: 'Rahul Verma',
      testName: 'Complete Blood Count (CBC)',
      urgency: 'ROUTINE',
      state: 'ORDERED',
      lastUpdated: '2026-07-19T08:30:00Z',
    },
    {
      id: 'LAB-2002',
      patientName: 'Priya Sharma',
      testName: 'Comprehensive Metabolic Panel',
      urgency: 'STAT',
      state: 'RECEIVED_IN_LAB',
      lastUpdated: '2026-07-19T09:15:00Z',
    },
    {
      id: 'LAB-2003',
      patientName: 'Amit Singh',
      testName: 'Troponin I',
      urgency: 'CRITICAL',
      state: 'RESULTED',
      hasCriticalValue: true,
      resultValue: '1.45 ng/mL (HIGH)',
      criticalAcknowledged: false,
      lastUpdated: '2026-07-19T10:05:00Z',
    },
    {
      id: 'LAB-2004',
      patientName: 'Sneha Patel',
      testName: 'Lipid Profile',
      urgency: 'ROUTINE',
      state: 'RELEASED_TO_CLINICIAN',
      lastUpdated: '2026-07-18T14:20:00Z',
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [clinicalAction, setClinicalAction] = useState('');

  const getStateBadge = (state: LabState) => {
    switch (state) {
      case 'ORDERED':
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            Ordered
          </Badge>
        );
      case 'PENDING_COLLECTION':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Beaker className="w-3 h-3 mr-1" /> Pending Collection
          </Badge>
        );
      case 'COLLECTED':
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
            Collected
          </Badge>
        );
      case 'RECEIVED_IN_LAB':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Received in Lab
          </Badge>
        );
      case 'IN_ANALYZER_QUEUE':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            <Zap className="w-3 h-3 mr-1" /> In Analyzer Queue
          </Badge>
        );
      case 'RESULTED':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            <FlaskConical className="w-3 h-3 mr-1" /> Resulted
          </Badge>
        );
      case 'VERIFIED':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified (QA)
          </Badge>
        );
      case 'RELEASED_TO_CLINICIAN':
        return (
          <Badge variant="secondary">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Released
          </Badge>
        );
      default:
        return <Badge>{state}</Badge>;
    }
  };

  const advanceState = (id: string, newState: LabState) => {
    setOrders(
      orders.map((o) =>
        o.id === id ? { ...o, state: newState, lastUpdated: new Date().toISOString() } : o,
      ),
    );
    toast.success(`Lab Order ${id} advanced to ${newState.replace(/_/g, ' ')}`);
  };

  const handleAcknowledgeCritical = (id: string) => {
    if (!clinicalAction) {
      toast.error('Must record a clinical action before acknowledging critical results.');
      return;
    }
    setOrders(
      orders.map((o) =>
        o.id === id
          ? { ...o, criticalAcknowledged: true, lastUpdated: new Date().toISOString() }
          : o,
      ),
    );
    toast.success(`Critical value acknowledged for ${id}. Audit log recorded.`);
    setSelectedOrder(null);
    setClinicalAction('');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-purple-600" />
            Laboratory Execution System (LIS)
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Manage the end-to-end specimen lifecycle and critical value escalations.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Accession ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Test Name</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className={
                  order.hasCriticalValue && !order.criticalAcknowledged ? 'bg-red-50/50' : ''
                }
              >
                <TableCell className="font-medium text-slate-700">{order.id}</TableCell>
                <TableCell>{order.patientName}</TableCell>
                <TableCell>{order.testName}</TableCell>
                <TableCell>
                  {order.urgency === 'STAT' || order.urgency === 'CRITICAL' ? (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                      {order.urgency}
                    </Badge>
                  ) : (
                    <Badge variant="outline">{order.urgency}</Badge>
                  )}
                </TableCell>
                <TableCell>{getStateBadge(order.state)}</TableCell>
                <TableCell className="text-right">
                  <Dialog
                    open={selectedOrder?.id === order.id}
                    onOpenChange={(open) => !open && setSelectedOrder(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant={
                          order.hasCriticalValue && !order.criticalAcknowledged
                            ? 'destructive'
                            : 'outline'
                        }
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {order.hasCriticalValue && !order.criticalAcknowledged
                          ? 'Acknowledge Alert'
                          : 'Update Status'}
                      </Button>
                    </DialogTrigger>
                    {selectedOrder?.id === order.id && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Accession: {order.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {order.hasCriticalValue && !order.criticalAcknowledged && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                              <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
                                <AlertTriangle className="w-5 h-5" />
                                CRITICAL VALUE ALERT
                              </div>
                              <p className="text-sm text-red-700 mb-4">
                                Result: <strong>{order.resultValue}</strong>
                              </p>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                  Clinical Action Taken (Required for Audit):
                                </label>
                                <textarea
                                  className="w-full text-sm p-2 border rounded-md"
                                  rows={3}
                                  placeholder="e.g., Called attending physician, administered medication..."
                                  value={clinicalAction}
                                  onChange={(e) => setClinicalAction(e.target.value)}
                                />
                                <Button
                                  variant="destructive"
                                  className="w-full mt-2"
                                  onClick={() => handleAcknowledgeCritical(order.id)}
                                >
                                  Acknowledge & Record Action
                                </Button>
                              </div>
                            </div>
                          )}

                          {(!order.hasCriticalValue || order.criticalAcknowledged) && (
                            <div className="flex flex-wrap gap-2">
                              {order.state === 'ORDERED' && (
                                <Button
                                  onClick={() => advanceState(order.id, 'PENDING_COLLECTION')}
                                >
                                  Mark Pending Collection
                                </Button>
                              )}
                              {order.state === 'PENDING_COLLECTION' && (
                                <Button onClick={() => advanceState(order.id, 'COLLECTED')}>
                                  Collect Specimen
                                </Button>
                              )}
                              {order.state === 'COLLECTED' && (
                                <Button onClick={() => advanceState(order.id, 'RECEIVED_IN_LAB')}>
                                  Receive in Lab
                                </Button>
                              )}
                              {order.state === 'RECEIVED_IN_LAB' && (
                                <Button onClick={() => advanceState(order.id, 'IN_ANALYZER_QUEUE')}>
                                  Send to Analyzer (HL7)
                                </Button>
                              )}
                              {order.state === 'IN_ANALYZER_QUEUE' && (
                                <Button onClick={() => advanceState(order.id, 'RESULTED')}>
                                  Simulate Results Received
                                </Button>
                              )}
                              {order.state === 'RESULTED' && (
                                <Button onClick={() => advanceState(order.id, 'VERIFIED')}>
                                  QA Verify Results
                                </Button>
                              )}
                              {order.state === 'VERIFIED' && (
                                <Button
                                  onClick={() => advanceState(order.id, 'RELEASED_TO_CLINICIAN')}
                                >
                                  Release to EMR (Event Bus)
                                </Button>
                              )}
                              {order.state === 'RELEASED_TO_CLINICIAN' && (
                                <p className="text-sm text-slate-500 italic">
                                  This order is fully released.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    )}
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
