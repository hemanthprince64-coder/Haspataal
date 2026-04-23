import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export function Step6Review({ config, onActivate }: { config: any, onActivate: () => void }) {
  const totalBeds = Object.values(config.bed_counts || {}).reduce((a: any, b: any) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">Review & Go Live</h2>
        <p className="text-slate-500">Confirm your hospital configuration to activate HMS.</p>
      </div>

      <div className="space-y-4 text-sm text-slate-700">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
          <span className="font-semibold text-slate-500">Specialities:</span>
          <span>{config.specialities?.length || 0} selected</span>
        </div>
        
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
          <span className="font-semibold text-slate-500">Doctors Onboarded:</span>
          <span>{config.doctors?.length || 0} doctors</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
          <span className="font-semibold text-slate-500">Total Bed Capacity:</span>
          <span>{totalBeds} beds</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
          <span className="font-semibold text-slate-500">Standard OPD Fee:</span>
          <span>₹{config.pricing?.opd_fees || 0}</span>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-start gap-3 mt-6">
        <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-bold">Ready for Activation</h4>
          <p className="text-sm mt-1">
            Clicking "Activate Hospital" will finalize your setup and open your live HMS dashboard. You can edit these settings later from the Admin panel.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={onActivate} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow-lg transition-transform hover:scale-105">
          Activate Hospital
        </Button>
      </div>
    </div>
  );
}
