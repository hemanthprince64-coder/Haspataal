import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function Step4OPDTimings({ config, onSave }: { config: any, onSave: (data: any) => void }) {
  const doctors = config.doctors || [];
  
  // Format: { "Dr. Name": { slotDuration: "15", timings: "10:00 AM - 2:00 PM" } }
  const [timings, setTimings] = useState<any>(config.opd_timings || {});

  const updateTiming = (docName: string, field: string, value: string) => {
    setTimings({
      ...timings,
      [docName]: {
        ...(timings[docName] || { slotDuration: '15', schedule: '10:00 AM - 02:00 PM' }),
        [field]: value
      }
    });
  };

  if (doctors.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        Please add doctors in Step 2 to configure OPD timings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">OPD Timings</h2>
          <p className="text-slate-500">Configure appointment slots for your doctors.</p>
        </div>
        <div className="flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
          <Clock className="w-3 h-3 mr-1" /> ~2 mins
        </div>
      </div>

      <div className="space-y-4">
        {doctors.map((doc: any, i: number) => {
          const docTiming = timings[doc.name] || { slotDuration: '15', schedule: '10:00 AM - 02:00 PM' };
          
          return (
            <div key={i} className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center bg-white p-4 rounded-lg border shadow-sm">
              <div className="w-full md:w-1/3">
                <p className="font-semibold">{doc.name}</p>
                <p className="text-xs text-slate-500">{doc.speciality}</p>
              </div>
              
              <div className="w-full md:w-1/3">
                <label className="text-xs text-slate-500 block mb-1">Shift Timings</label>
                <select 
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={docTiming.schedule}
                  onChange={e => updateTiming(doc.name, 'schedule', e.target.value)}
                >
                  <option value="10:00 AM - 02:00 PM">10:00 AM - 02:00 PM</option>
                  <option value="04:00 PM - 08:00 PM">04:00 PM - 08:00 PM</option>
                  <option value="10:00 AM - 06:00 PM">10:00 AM - 06:00 PM</option>
                </select>
              </div>

              <div className="w-full md:w-1/3">
                <label className="text-xs text-slate-500 block mb-1">Slot Duration</label>
                <select 
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={docTiming.slotDuration}
                  onChange={e => updateTiming(doc.name, 'slotDuration', e.target.value)}
                >
                  <option value="10">10 mins</option>
                  <option value="15">15 mins</option>
                  <option value="20">20 mins</option>
                  <option value="30">30 mins</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={() => {
          onSave(timings);
          toast.success("OPD timings saved successfully");
        }}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
