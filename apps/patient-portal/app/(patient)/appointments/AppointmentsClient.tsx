'use client';

import { Button } from '@haspataal/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@haspataal/ui';
import { Badge } from '@haspataal/ui';
import { Calendar, Clock, MapPin, XCircle } from 'lucide-react';
import useSWR from 'swr';

import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AppointmentsClient() {
  const { data, error, mutate } = useSWR('/api/patient/appointments', fetcher);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  if (error) return <div className="text-red-500">Failed to load appointments</div>;
  if (!data) return <div className="animate-pulse">Loading appointments...</div>;

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    setCancellingId(id);
    try {
      const res = await fetch(`/api/patient/appointments/${id}/cancel`, {
        method: 'POST',
      });
      const result = await res.json();

      if (res.ok) {
        mutate();
      } else {
        alert(`Failed to cancel: ${result.error}`);
      }
    } catch (e) {
      alert('Network error while cancelling');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED':
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {data.appointments.length === 0 ? (
        <p className="text-slate-500">No appointments found.</p>
      ) : (
        data.appointments.map((apt: any) => (
          <Card key={apt.id} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Dr. {apt.doctor.fullName}</CardTitle>
              <Badge className={getStatusColor(apt.status)} variant="outline">
                {apt.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center text-sm text-slate-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(apt.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {apt.slot}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  {apt.hospital.name}, {apt.hospital.city}
                </div>

                {['BOOKED', 'CONFIRMED'].includes(apt.status) && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={cancellingId === apt.id}
                      onClick={() => handleCancel(apt.id)}
                    >
                      {cancellingId === apt.id ? 'Cancelling...' : 'Cancel Appointment'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
