import { Clock, CheckCircle, XCircle, RefreshCw, Users } from 'lucide-react';

import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PendingAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  slot: string;
  date: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
  confirmationExpiresAt?: string;
  createdAt: string;
}

interface SmartConfirmationProps {
  hospitalId?: string;
}

export function SmartConfirmation({ hospitalId }: SmartConfirmationProps) {
  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'AUTO_ACCEPT' | 'MANUAL_ACCEPT'>('MANUAL_ACCEPT');

  const loadPendingAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/appointments/pending');
      if (res.ok) {
        const data = await res.json();
        setPendingAppointments(data);
      }
    } catch (err) {
      console.error('Failed to load pending appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingAppointments();
    const interval = setInterval(loadPendingAppointments, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAction = async (
    appointmentId: string,
    action: 'accept' | 'reject' | 'reschedule',
  ) => {
    try {
      const res = await fetch(`/api/appointments/confirmation?appointmentId=${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        loadPendingAppointments();
      }
    } catch (err) {
      console.error('Failed to update appointment:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pending
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge variant="default" className="bg-green-600">
            Confirmed
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="outline" className="bg-slate-100">
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Appointment Confirmation
            </span>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Mode:</span>
              <Button
                variant={confirmMode === 'AUTO_ACCEPT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConfirmMode('AUTO_ACCEPT')}
              >
                Auto-accept
              </Button>
              <Button
                variant={confirmMode === 'MANUAL_ACCEPT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConfirmMode('MANUAL_ACCEPT')}
              >
                Manual
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Confirmations ({pendingAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Loading...</p>
          ) : pendingAppointments.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No pending confirmations.</p>
          ) : (
            <div className="space-y-4">
              {pendingAppointments.map((apt) => {
                const timeRemaining = getTimeRemaining(apt.confirmationExpiresAt);
                return (
                  <div key={apt.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{apt.patientName}</p>
                        <p className="text-sm text-slate-500">{apt.patientPhone}</p>
                        <p className="text-sm text-slate-500">
                          Dr. {apt.doctorName} • {apt.slot}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(apt.status)}
                        {timeRemaining && (
                          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                            {timeRemaining}
                          </span>
                        )}
                      </div>
                    </div>

                    {apt.status === 'PENDING_CONFIRMATION' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAction(apt.id, 'accept')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleAction(apt.id, 'reject')}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(apt.id, 'reschedule')}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" /> Reschedule
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Escalation Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>Avg. Confirmation Time</span>
              <span className="font-bold">2.4 min</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span>Today's Expired</span>
              <span className="font-bold">3</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded">
              <span className="text-amber-700">Pending SLA Breach (30min)</span>
              <span className="font-bold text-amber-700">2</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
