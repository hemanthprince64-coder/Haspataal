import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MedicineAutocomplete } from './MedicineAutocomplete';
import { DiagnosisSearch } from './DiagnosisSearch';
import { PrescriptionTemplates } from './PrescriptionTemplates';
import { Printer, MessageCircle, Save } from 'lucide-react';

export function PrescriptionLayout() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');

  const handlePrint = () => {
    // API call to generate PDF, then open in new tab
    console.log('Generating A5 PDF...');
  };

  const handleComplete = async () => {
    // API call to POST /api/prescriptions/create -> emits doctor_prescribes
    console.log('Saving prescription and sending WhatsApp...');
  };

  return (
    <div className="flex h-screen bg-slate-100 p-4 gap-4">
      {/* Left Column: Patient Summary */}
      <div className="w-1/4 flex flex-col gap-4">
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-3">
            <CardTitle className="text-lg">Rahul Verma</CardTitle>
            <p className="text-sm text-slate-500">35 Yrs • Male • ID: P-10293</p>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chief Complaint</p>
              <p className="text-sm font-medium mt-1">High fever, severe headache, body ache x 3 days.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div><span className="text-slate-500">Temp:</span> 102.4°F</div>
              <div><span className="text-slate-500">BP:</span> 120/80</div>
              <div><span className="text-slate-500">SpO2:</span> 98%</div>
              <div><span className="text-slate-500">Pulse:</span> 110</div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Medical History</p>
              <div className="flex flex-wrap gap-1">
                <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-200">Diabetes T2</span>
                <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded border border-slate-200">Penicillin Allergy</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1-Click Templates */}
        <PrescriptionTemplates />
      </div>

      {/* Right Column: High-Speed Prescription Builder */}
      <div className="w-3/4 flex flex-col gap-4">
        <Card className="flex-1 shadow-sm flex flex-col">
          <CardHeader className="border-b pb-3 flex flex-row justify-between items-center">
            <CardTitle className="text-xl text-blue-900 font-bold flex items-center gap-2">
              <span className="text-2xl font-serif">Rx</span> Prescription Entry
            </CardTitle>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Auto-saving...</span>
          </CardHeader>
          
          <CardContent className="p-6 flex-1 overflow-y-auto space-y-6">
            
            {/* Diagnosis */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Diagnosis (ICD-10)</label>
              <DiagnosisSearch value={diagnosis} onChange={setDiagnosis} />
            </div>

            {/* Medicines List */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Medicines</label>
              <div className="space-y-2 mb-3">
                {medicines.map((med, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2 rounded border">
                    <span className="font-semibold w-1/3">{med.name}</span>
                    <span className="text-sm text-slate-600 w-1/4">{med.dose}</span>
                    <span className="text-sm text-slate-600 w-1/4">{med.frequency} x {med.duration}</span>
                    <button className="text-red-500 hover:text-red-700 text-sm ml-auto" onClick={() => setMedicines(m => m.filter((_, i) => i !== idx))}>Remove</button>
                  </div>
                ))}
              </div>
              {/* Typeahead Component */}
              <MedicineAutocomplete onAdd={(med: any) => setMedicines([...medicines, med])} />
            </div>

            {/* Advice & Follow-up */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Advice & Instructions</label>
              <textarea 
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                rows={3} 
                placeholder="Take plenty of fluids. Rest for 3 days."
                value={advice}
                onChange={e => setAdvice(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-slate-100 hover:bg-slate-200 cursor-pointer px-2 py-1 rounded" onClick={() => setAdvice(a => a + ' Review after 5 days.')}>+ Review 5 days</span>
                <span className="text-xs bg-slate-100 hover:bg-slate-200 cursor-pointer px-2 py-1 rounded" onClick={() => setAdvice(a => a + ' Drink warm water.')}>+ Warm water</span>
              </div>
            </div>

          </CardContent>

          {/* Action Bar */}
          <div className="p-4 border-t bg-slate-50 flex justify-between items-center rounded-b-xl">
            <Button variant="outline" className="gap-2" onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Print A5
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" className="text-slate-600 gap-2">
                <Save className="w-4 h-4" /> Save as Template
              </Button>
              <Button onClick={handleComplete} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <MessageCircle className="w-4 h-4" /> Complete & Send WhatsApp
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
