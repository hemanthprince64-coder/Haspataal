'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Stethoscope,
  UserCheck,
  UserX,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useEffect, useState, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  slot: string;
  status: string;
  notes?: string;
  patient: { id: string; name: string; phone: string };
  doctor: { id: string; fullName: string };
  visit?: {
    id: string;
    currentStage: string;
    diagnosis?: string;
  };
}

const STAGE_OPTIONS = [
  { value: 'RECEPTION', label: 'Reception' },
  { value: 'TRIAGE', label: 'Triage' },
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'INVESTIGATION_LAB', label: 'Lab Investigation' },
  { value: 'INVESTIGATION_RAD', label: 'Radiology' },
  { value: 'DISPENSARY_PHARMACY', label: 'Pharmacy' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'DISCHARGE', label: 'Discharge' },
];

const STATUS_COLORS: Record<string, string> = {
  BOOKED: 'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  AWAITING_PAYMENT: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  NO_SHOW: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function TriagePage() {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Modal states
  const [completeOpen, setCompleteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [targetStage, setTargetStage] = useState('CONSULTATION');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = useCallback(async (targetDate: string) => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/hospital/opd/queue?date=${targetDate}`);
      const data = await res.json();
      setQueue(data.queue ?? []);
    } catch {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue(date);
    const interval = setInterval(() => fetchQueue(date), 30000);
    return () => clearInterval(interval);
  }, [date, fetchQueue]);

  const handleQueueAction = async (
    appointmentId: string,
    action: string,
    extra?: Record<string, any>,
  ) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/hospital/opd/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, action, ...extra }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Action failed');
      }
      toast.success(`Visit ${action.toLowerCase()} successful`);
      fetchQueue(date);
      setCompleteOpen(false);
      setTransferOpen(false);
      setDiagnosis('');
      setSelectedAppointment(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedAppointment?.visit?.id) {
      toast.error('No active visit found for this appointment');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/hospital/opd/handoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId: selectedAppointment.visit.id,
          toStage: targetStage,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Transfer failed');
      }
      toast.success(`Transferred to ${targetStage.replace(/_/g, ' ')}`);
      fetchQueue(date);
      setTransferOpen(false);
      setSelectedAppointment(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openCompleteDialog = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setDiagnosis(apt.visit?.diagnosis || '');
    setCompleteOpen(true);
  };

  const openTransferDialog = (apt: Appointment) => {
    setSelectedAppointment(apt);
    const currentStage = apt.visit?.currentStage || 'RECEPTION';
    setTargetStage(currentStage);
    setTransferOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors = STATUS_COLORS[status] || 'bg-gray-50 text-gray-600 border-gray-200';
    return (
      <Badge variant="outline" className={`text-[10px] font-bold border ${colors}`}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const formatTime = (slot: string) => {
    if (slot.includes(':')) return slot.slice(0, 5);
    return slot;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OPD Triage & Queue</h1>
          <p className="text-sm text-gray-500">
            Manage today's appointments, check-ins, and visit progression.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-44 rounded-lg border-gray-200 text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg border-gray-200"
            onClick={() => fetchQueue(date)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Queue Table */}
      <Card className="border-gray-200 rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-900">Today's Queue</CardTitle>
            <Badge className="bg-blue-600 text-white text-[10px] font-bold border-none">
              {queue.length} appointments
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Clock className="h-10 w-10 mx-auto mb-3 text-gray-200" />
              <p className="font-semibold">No appointments found for this date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Token / Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Doctor
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Current Stage
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {queue.map((apt) => {
                    const isBooked = apt.status === 'BOOKED';
                    const isConfirmed = apt.status === 'CONFIRMED';
                    const currentStage = apt.visit?.currentStage || 'RECEPTION';

                    return (
                      <tr key={apt.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-gray-700">
                              {apt.slot}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatTime(apt.slot)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{apt.patient.name}</p>
                            <p className="text-xs text-gray-400">{apt.patient.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-700">{apt.doctor.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">{getStatusBadge(apt.status)}</td>
                        <td className="px-4 py-4">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold border-gray-200 text-gray-600"
                          >
                            {currentStage.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isBooked && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                onClick={() => handleQueueAction(apt.id, 'CHECK_IN')}
                                disabled={submitting}
                              >
                                <UserCheck className="h-3.5 w-3.5 mr-1" /> Check-in
                              </Button>
                            )}
                            {(isBooked || isConfirmed) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                  onClick={() => openCompleteDialog(apt)}
                                  disabled={submitting}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                                  onClick={() => openTransferDialog(apt)}
                                  disabled={submitting}
                                >
                                  <ChevronRight className="h-3.5 w-3.5 mr-1" /> Transfer
                                </Button>
                              </>
                            )}
                            {(isBooked || isConfirmed) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                                onClick={() => handleQueueAction(apt.id, 'NO_SHOW')}
                                disabled={submitting}
                              >
                                <UserX className="h-3.5 w-3.5 mr-1" /> No-show
                              </Button>
                            )}
                            {(isBooked || isConfirmed) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                onClick={() => handleQueueAction(apt.id, 'CANCEL')}
                                disabled={submitting}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Visit Dialog */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Complete Visit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAppointment && (
              <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                <p className="text-sm font-semibold text-gray-900">
                  {selectedAppointment.patient.name}
                </p>
                <p className="text-xs text-gray-500">
                  Dr. {selectedAppointment.doctor.fullName} · {formatTime(selectedAppointment.slot)}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase">
                Diagnosis / Notes
              </Label>
              <Textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis, treatment plan, or clinical notes..."
                className="rounded-xl border-gray-200 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteOpen(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedAppointment &&
                handleQueueAction(selectedAppointment.id, 'COMPLETE', { diagnosis })
              }
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Transfer Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAppointment && (
              <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                <p className="text-sm font-semibold text-gray-900">
                  {selectedAppointment.patient.name}
                </p>
                <p className="text-xs text-gray-500">
                  Current:{' '}
                  <span className="font-semibold text-gray-700">
                    {(selectedAppointment.visit?.currentStage || 'RECEPTION').replace(/_/g, ' ')}
                  </span>
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Target Stage</Label>
              <Select value={targetStage} onValueChange={(v: string) => setTargetStage(v)}>
                <SelectTrigger className="h-11 rounded-xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
