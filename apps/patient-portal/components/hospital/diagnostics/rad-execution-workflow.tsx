'use client';

import {
  Eye,
  ExternalLink,
  Activity,
  ScanLine,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type RadState =
  | 'ORDERED'
  | 'SCHEDULED'
  | 'PATIENT_ARRIVED'
  | 'IN_PROGRESS'
  | 'IMAGE_ACQUIRED'
  | 'PENDING_REPORT'
  | 'VERIFIED'
  | 'RELEASED';

interface RadOrder {
  id: string;
  patientName: string;
  modality: 'X-RAY' | 'MRI' | 'CT' | 'USG';
  studyDescription: string;
  state: RadState;
  pacsViewerUrl?: string;
  reportDictated?: boolean;
  lastUpdated: string;
}

export default function RadExecutionWorkflow() {
  const [orders, setOrders] = useState<RadOrder[]>([
    {
      id: 'RAD-5001',
      patientName: 'Sanjay Kumar',
      modality: 'MRI',
      studyDescription: 'MRI Brain w/o Contrast',
      state: 'ORDERED',
      lastUpdated: '2026-07-19T07:30:00Z',
    },
    {
      id: 'RAD-5002',
      patientName: 'Deepa Singh',
      modality: 'CT',
      studyDescription: 'CT Abdomen/Pelvis',
      state: 'PATIENT_ARRIVED',
      lastUpdated: '2026-07-19T09:05:00Z',
    },
    {
      id: 'RAD-5003',
      patientName: 'Karan Sharma',
      modality: 'X-RAY',
      studyDescription: 'X-Ray Chest PA View',
      state: 'IMAGE_ACQUIRED',
      pacsViewerUrl: 'https://pacs.haspataal.local/viewer?studyUID=1.2.3.4.5',
      lastUpdated: '2026-07-19T09:45:00Z',
    },
    {
      id: 'RAD-5004',
      patientName: 'Ritu Patel',
      modality: 'USG',
      studyDescription: 'USG Whole Abdomen',
      state: 'RELEASED',
      pacsViewerUrl: 'https://pacs.haspataal.local/viewer?studyUID=6.7.8.9.0',
      reportDictated: true,
      lastUpdated: '2026-07-18T16:20:00Z',
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<RadOrder | null>(null);

  const getStateBadge = (state: RadState) => {
    switch (state) {
      case 'ORDERED':
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            <Clock className="w-3 h-3 mr-1" /> Ordered
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Calendar className="w-3 h-3 mr-1" /> Scheduled
          </Badge>
        );
      case 'PATIENT_ARRIVED':
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
            <Clock className="w-3 h-3 mr-1" /> Patient Arrived
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            <Activity className="w-3 h-3 mr-1" /> In Progress
          </Badge>
        );
      case 'IMAGE_ACQUIRED':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <ScanLine className="w-3 h-3 mr-1" /> Image Acquired
          </Badge>
        );
      case 'PENDING_REPORT':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            <FileText className="w-3 h-3 mr-1" /> Pending Report
          </Badge>
        );
      case 'VERIFIED':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
          </Badge>
        );
      case 'RELEASED':
        return (
          <Badge variant="secondary">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Released
          </Badge>
        );
      default:
        return <Badge>{state}</Badge>;
    }
  };

  const advanceState = (id: string, newState: RadState, injectUrl?: boolean) => {
    setOrders(
      orders.map((o) => {
        if (o.id === id) {
          return {
            ...o,
            state: newState,
            ...(injectUrl && {
              pacsViewerUrl: `https://pacs.haspataal.local/viewer?studyUID=${Math.random().toString().slice(2, 10)}`,
            }),
            lastUpdated: new Date().toISOString(),
          };
        }
        return o;
      }),
    );
    toast.success(`Radiology Order ${id} advanced to ${newState.replace(/_/g, ' ')}`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-indigo-600" />
            Radiology Information System (RIS)
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Manage imaging workflows with external PACS viewer integration.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accession ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Modality</TableHead>
                <TableHead>Study</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Images</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-slate-700">{order.id}</TableCell>
                  <TableCell>{order.patientName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {order.modality}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{order.studyDescription}</TableCell>
                  <TableCell>{getStateBadge(order.state)}</TableCell>
                  <TableCell>
                    {order.pacsViewerUrl ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="touch-target text-blue-600"
                              onClick={() => window.open(order.pacsViewerUrl, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-1 shrink-0" /> View DICOM
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 text-white">
                            <p>Requires PACS Intranet Access</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-xs text-slate-400">Not Available</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={selectedOrder?.id === order.id}
                      onOpenChange={(open) => !open && setSelectedOrder(null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          Update Status
                        </Button>
                      </DialogTrigger>
                      {selectedOrder?.id === order.id && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Radiology Order: {order.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="p-3 bg-slate-50 rounded border text-sm">
                              <p>
                                <strong>Modality:</strong> {order.modality}
                              </p>
                              <p>
                                <strong>Study:</strong> {order.studyDescription}
                              </p>
                              {order.pacsViewerUrl && (
                                <p
                                  className="mt-2 text-blue-600 flex items-center gap-1 cursor-pointer"
                                  onClick={() => window.open(order.pacsViewerUrl, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3" /> PACS Link Available
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {order.state === 'ORDERED' && (
                                <Button onClick={() => advanceState(order.id, 'SCHEDULED')}>
                                  Mark Scheduled
                                </Button>
                              )}
                              {order.state === 'SCHEDULED' && (
                                <Button onClick={() => advanceState(order.id, 'PATIENT_ARRIVED')}>
                                  Patient Arrived
                                </Button>
                              )}
                              {order.state === 'PATIENT_ARRIVED' && (
                                <Button onClick={() => advanceState(order.id, 'IN_PROGRESS')}>
                                  Begin Acquisition (Modality)
                                </Button>
                              )}
                              {order.state === 'IN_PROGRESS' && (
                                <Button
                                  onClick={() => advanceState(order.id, 'IMAGE_ACQUIRED', true)}
                                >
                                  Complete Acquisition (Sync PACS)
                                </Button>
                              )}
                              {order.state === 'IMAGE_ACQUIRED' && (
                                <Button onClick={() => advanceState(order.id, 'PENDING_REPORT')}>
                                  Send to Radiologist
                                </Button>
                              )}
                              {order.state === 'PENDING_REPORT' && (
                                <Button onClick={() => advanceState(order.id, 'VERIFIED')}>
                                  Sign Report
                                </Button>
                              )}
                              {order.state === 'VERIFIED' && (
                                <Button onClick={() => advanceState(order.id, 'RELEASED')}>
                                  Release (Publish Event)
                                </Button>
                              )}
                              {order.state === 'RELEASED' && (
                                <p className="text-sm text-slate-500 italic">
                                  This study is fully reported and released.
                                </p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden space-y-4 p-4">
          {orders.map((order) => (
            <div key={order.id} className="p-4 rounded-lg border bg-white border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-slate-900">{order.patientName}</div>
                  <div className="text-sm text-slate-500 font-medium">{order.id}</div>
                </div>
                {getStateBadge(order.state)}
              </div>
              <div className="text-sm text-slate-700 mb-1">
                <Badge variant="outline" className="font-mono mr-2">
                  {order.modality}
                </Badge>
                {order.studyDescription}
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
                {order.pacsViewerUrl ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="touch-target text-blue-600 px-0"
                          onClick={() => window.open(order.pacsViewerUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1 shrink-0" /> View DICOM
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white">
                        <p>Requires PACS Intranet Access</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-xs text-slate-400">No images</span>
                )}

                <Dialog
                  open={selectedOrder?.id === order.id}
                  onOpenChange={(open) => !open && setSelectedOrder(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="min-h-[44px]"
                    >
                      Update Status
                    </Button>
                  </DialogTrigger>
                  {selectedOrder?.id === order.id && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Radiology Order: {order.id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-3 bg-slate-50 rounded border text-sm">
                          <p>
                            <strong>Modality:</strong> {order.modality}
                          </p>
                          <p>
                            <strong>Study:</strong> {order.studyDescription}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {order.state === 'ORDERED' && (
                            <Button
                              className="min-h-[44px]"
                              onClick={() => advanceState(order.id, 'SCHEDULED')}
                            >
                              Mark Scheduled
                            </Button>
                          )}
                          {order.state === 'SCHEDULED' && (
                            <Button
                              className="min-h-[44px]"
                              onClick={() => advanceState(order.id, 'PATIENT_ARRIVED')}
                            >
                              Patient Arrived
                            </Button>
                          )}
                          {order.state === 'PATIENT_ARRIVED' && (
                            <Button
                              className="min-h-[44px]"
                              onClick={() => advanceState(order.id, 'IN_PROGRESS')}
                            >
                              Begin Acquisition (Modality)
                            </Button>
                          )}
                          {order.state === 'IN_PROGRESS' && (
                            <Button
                              className="min-h-[44px]"
                              onClick={() => advanceState(order.id, 'IMAGE_ACQUIRED', true)}
                            >
                              Complete Acquisition (Sync PACS)
                            </Button>
                          )}
                          {order.state === 'IMAGE_ACQUIRED' && (
                            <Button
                              className="min-h-[44px]"
                              onClick={() => advanceState(order.id, 'PENDING_REPORT')}
                            >
                              Send to Radiologist
                            </Button>
                          )}
                          {order.state === 'PENDING_REPORT' && (
                            <Button
                              className="min-h-[44px]"
                              onClick={() => advanceState(order.id, 'VERIFIED')}
                            >
                              Sign Report
                            </Button>
                          )}
                          {order.state === 'VERIFIED' && (
                            <Button
                              className="min-h-[44px]"
                              onClick={() => advanceState(order.id, 'RELEASED')}
                            >
                              Release (Publish Event)
                            </Button>
                          )}
                          {order.state === 'RELEASED' && (
                            <p className="text-sm text-slate-500 italic text-center w-full">
                              This study is fully reported and released.
                            </p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
