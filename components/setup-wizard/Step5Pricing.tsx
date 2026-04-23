import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

export function Step5Pricing({ config, onSave }: { config: any, onSave: (data: any) => void }) {
  const [pricing, setPricing] = useState(config.pricing || {
    opd_fees: 500, ipd_rate: 2000, diag_markup: 15
  });

  const handleChange = (field: string, value: string) => {
    const num = parseInt(value, 10);
    setPricing({ ...pricing, [field]: isNaN(num) ? 0 : Math.max(0, num) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">Standard Pricing</h2>
          <p className="text-slate-500">Set base rates. You can override these per doctor later.</p>
        </div>
        <div className="flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
          <Clock className="w-3 h-3 mr-1" /> ~1 min
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Standard OPD Consultation Fee (₹)</Label>
          <Input 
            type="number" 
            value={pricing.opd_fees} 
            onChange={(e) => handleChange('opd_fees', e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label>General Ward IPD Rate (₹ / day)</Label>
          <Input 
            type="number" 
            value={pricing.ipd_rate} 
            onChange={(e) => handleChange('ipd_rate', e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label>Diagnostics/Pharmacy Markup (%)</Label>
          <Input 
            type="number" 
            value={pricing.diag_markup} 
            onChange={(e) => handleChange('diag_markup', e.target.value)} 
          />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm mt-4">
        <strong>Note:</strong> Haspataal calculates GST automatically based on the service type (e.g., Room rent &gt; ₹5000 incurs 5% GST).
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={() => onSave(pricing)}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
