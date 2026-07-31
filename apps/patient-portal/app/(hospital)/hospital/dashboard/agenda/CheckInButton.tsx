'use client';

import { Button } from '@haspataal/ui';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

export default function CheckInButton({
  appointmentId,
  currentStatus,
  onCheckedIn,
}: {
  appointmentId: string;
  currentStatus: string;
  onCheckedIn: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hospital/consultations/${appointmentId}/check-in`, {
        method: 'POST',
      });
      if (res.ok) {
        onCheckedIn();
      } else {
        const error = await res.json();
        alert(`Failed to check in: ${error.error}`);
      }
    } catch (e) {
      alert('Error during check-in');
    }
    setLoading(false);
  };

  if (currentStatus === 'BOOKED' || currentStatus === 'CONFIRMED') {
    return (
      <Button onClick={handleCheckIn} disabled={loading} size="sm" variant="outline">
        {loading ? 'Processing...' : 'Check In'}
      </Button>
    );
  }

  if (currentStatus === 'CHECKED_IN' || currentStatus === 'IN_CONSULTATION') {
    return (
      <Button
        onClick={() => router.push(`/hospital/dashboard/consultation/${appointmentId}`)}
        size="sm"
      >
        Open EMR
      </Button>
    );
  }

  return null;
}
