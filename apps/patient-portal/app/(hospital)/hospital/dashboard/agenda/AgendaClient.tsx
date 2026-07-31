'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@haspataal/ui';
import { Badge } from '@haspataal/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@haspataal/ui';
import { Input } from '@haspataal/ui';
import { Label } from '@haspataal/ui';
import useSWR from 'swr';

import { useState } from 'react';

import CheckInButton from './CheckInButton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AgendaClient({ doctors }: { doctors: any[] }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorId, setDoctorId] = useState<string>('ALL');

  const url = `/api/hospital/agenda?date=${date}${doctorId !== 'ALL' ? `&doctorId=${doctorId}` : ''}`;

  const { data, error } = useSWR(url, fetcher, {
    refreshInterval: 15000, // Poll every 15s for live updates
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800';
      case 'CHECKED_IN':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_CONSULTATION':
        return 'bg-purple-100 text-purple-800';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex-1">
          <Label>Filter by Doctor</Label>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger>
              <SelectValue placeholder="All Doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Doctors</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  Dr. {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="text-red-500">Failed to load agenda</div>
      ) : !data ? (
        <div className="animate-pulse">Loading agenda...</div>
      ) : (
        <div className="space-y-4">
          {data.appointments.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No appointments scheduled for this date.
            </p>
          ) : (
            <div className="grid gap-4">
              {data.appointments.map((apt: any) => (
                <Card key={apt.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="text-xl font-bold text-slate-700 dark:text-slate-200 min-w-[80px]">
                        {apt.slot}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{apt.patient.fullName}</h3>
                        <p className="text-sm text-slate-500">
                          {apt.patient.mobileNumber} • Dr. {apt.doctor.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(apt.status)} variant="outline">
                        {apt.status.replace('_', ' ')}
                      </Badge>
                      <CheckInButton
                        appointmentId={apt.id}
                        currentStatus={apt.status}
                        onCheckedIn={() => {
                          /* maybe mutate swr */
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
