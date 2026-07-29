/* eslint-disable */
import { Plus, AlertCircle } from 'lucide-react';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ComplaintsProps {
  visitId?: string;
  onSaved?: () => void;
}

export function ComplaintsForm({ visitId, onSaved }: ComplaintsProps) {
  const [complaints, setComplaints] = useState<string>('');
  const [severity, setSeverity] = useState<'MILD' | 'MODERATE' | 'SEVERE'>('MODERATE');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!complaints.trim() || !visitId) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/clinical/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId,
          complaint: complaints,
          severity,
          duration: '',
        }),
      });

      if (res.ok) {
        onSaved?.();
        setComplaints('');
      }
    } catch (err) {
      console.error('Failed to save complaint:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Chief Complaint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="complaint" className="text-xs">
            Complaint
          </Label>
          <Input
            id="complaint"
            placeholder="e.g., High fever, severe headache x 3 days"
            value={complaints}
            onChange={(e) => setComplaints(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Severity</Label>
          <div className="flex gap-2">
            {(['MILD', 'MODERATE', 'SEVERE'] as const).map((s) => (
              <Button
                key={s}
                type="button"
                variant={severity === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSeverity(s)}
                className={
                  severity === s
                    ? s === 'MILD'
                      ? 'bg-green-600 hover:bg-green-700'
                      : s === 'MODERATE'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-red-600 hover:bg-red-700'
                    : ''
                }
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Plus className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Add Complaint'}
        </Button>
      </CardContent>
    </Card>
  );
}
