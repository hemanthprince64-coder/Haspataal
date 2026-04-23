import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
// Assuming shadcn Card exists
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ChecklistWidget() {
  const requirements = [
    'Hospital License / Registration Certificate',
    'NMC or NHM Registration Certificate',
    'GST Certificate (Optional but recommended)',
    'Representative ID Proof (Aadhaar/PAN)',
  ];

  return (
    <Card className="w-full max-w-md mx-auto mb-6 bg-blue-50/50 border-blue-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          What you'll need before starting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {requirements.map((req, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
