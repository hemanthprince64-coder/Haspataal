'use client';

import { Button } from '@haspataal/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@haspataal/ui';
import { Input } from '@haspataal/ui';
import { Label } from '@haspataal/ui';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

export default function BookingWizardClient({
  initialDoctorId,
  initialHospitalId,
}: {
  initialDoctorId?: string;
  initialHospitalId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [doctorId, setDoctorId] = useState(initialDoctorId || '');
  const [hospitalId, setHospitalId] = useState(initialHospitalId || '');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');

  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Doctor & Hospital (simplified to inputs for MVP unless pre-filled)
  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label>Doctor ID</Label>
        <Input
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          placeholder="Enter Doctor ID"
        />
      </div>
      <div>
        <Label>Hospital ID</Label>
        <Input
          value={hospitalId}
          onChange={(e) => setHospitalId(e.target.value)}
          placeholder="Enter Hospital ID"
        />
      </div>
      <Button onClick={() => setStep(2)} disabled={!doctorId || !hospitalId} className="w-full">
        Next: Choose Date
      </Button>
    </div>
  );

  // Step 2: Date
  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label>Select Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={loadSlots} disabled={!date} className="flex-1">
          Next: Choose Slot
        </Button>
      </div>
    </div>
  );

  const loadSlots = async () => {
    setLoadingSlots(true);
    setError('');
    try {
      const res = await fetch(`/api/patient/appointments/slots?doctorId=${doctorId}&date=${date}`);
      const data = await res.json();
      if (res.ok) {
        setSlots(data.slots || []);
        setStep(3);
      } else {
        setError(data.error || 'Failed to load slots');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Step 3: Slot
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {slots.map((s) => (
          <Button
            key={s.time}
            variant={slot === s.time ? 'default' : 'outline'}
            className={s.available ? '' : 'opacity-50 cursor-not-allowed'}
            disabled={!s.available}
            onClick={() => setSlot(s.time)}
            title={s.reason}
          >
            {s.time}
          </Button>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button onClick={() => setStep(4)} disabled={!slot} className="flex-1">
          Next: Reason
        </Button>
      </div>
    </div>
  );

  // Step 4: Reason
  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <Label>Reason for visit (Optional)</Label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Brief description of symptoms"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button onClick={() => setStep(5)} className="flex-1">
          Next: Review
        </Button>
      </div>
    </div>
  );

  // Step 5: Review
  const handleBook = async () => {
    setBooking(true);
    setError('');
    try {
      const res = await fetch('/api/patient/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, hospitalId, date, slot }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push('/appointments'); // Redirect to appointments list
      } else {
        setError(data.error || 'Failed to book');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setBooking(false);
    }
  };

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md space-y-2">
        <p>
          <strong>Date:</strong> {new Date(date).toLocaleDateString()}
        </p>
        <p>
          <strong>Time:</strong> {slot}
        </p>
        <p>
          <strong>Reason:</strong> {reason || 'N/A'}
        </p>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(4)} disabled={booking}>
          Back
        </Button>
        <Button onClick={handleBook} disabled={booking} className="flex-1">
          {booking ? 'Confirming...' : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {step === 1 && 'Step 1: Provider Details'}
          {step === 2 && 'Step 2: Choose Date'}
          {step === 3 && 'Step 3: Choose Time Slot'}
          {step === 4 && 'Step 4: Visit Details'}
          {step === 5 && 'Step 5: Review & Confirm'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </CardContent>
    </Card>
  );
}
