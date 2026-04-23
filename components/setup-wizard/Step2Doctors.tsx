import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, Clock, Plus, Trash2 } from 'lucide-react';

export function Step2Doctors({ config, onSave }: { config: any, onSave: (data: any) => void }) {
  const [doctors, setDoctors] = useState<any[]>(config.doctors || []);

  const addDoctor = () => {
    setDoctors([...doctors, { name: '', speciality: '', degree: '', reg_no: '', fees: '' }]);
  };

  const removeDoctor = (index: number) => {
    setDoctors(doctors.filter((_, i) => i !== index));
  };

  const updateDoctor = (index: number, field: string, value: string) => {
    const newDocs = [...doctors];
    newDocs[index][field] = value;
    setDoctors(newDocs);
  };

  // Mocking CSV upload for demonstration
  const handleCSVUpload = (e: any) => {
    // In a real app, use PapaParse here
    const mockParsedCSV = [
      { name: 'Dr. Sharma', speciality: 'Cardiology', degree: 'MD', reg_no: 'MCI-123', fees: '800' },
      { name: 'Dr. Gupta', speciality: 'Orthopedics', degree: 'MS', reg_no: 'MCI-456', fees: '700' }
    ];
    setDoctors([...doctors, ...mockParsedCSV]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">Add Doctors</h2>
          <p className="text-slate-500">Add individual doctors or bulk upload via CSV.</p>
        </div>
        <div className="flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
          <Clock className="w-3 h-3 mr-1" /> ~3 mins
        </div>
      </div>

      {/* CSV Bulk Upload Area */}
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
        <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-700">Drag & Drop CSV File</h3>
        <p className="text-sm text-slate-500 mb-4">Template: name, speciality, degree, registration_no, fees</p>
        <label className="cursor-pointer bg-white border border-slate-300 px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-slate-50">
          Browse File
          <input type="file" className="hidden" accept=".csv" onChange={handleCSVUpload} />
        </label>
      </div>

      <div className="flex items-center gap-4 py-4">
        <div className="h-px bg-slate-200 flex-1"></div>
        <span className="text-slate-400 text-sm">OR MANUALLY ADD</span>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

      {/* Manual Entry Table */}
      <div className="space-y-3">
        {doctors.map((doc, i) => (
          <div key={i} className="flex gap-2 items-center bg-white p-3 rounded-lg border shadow-sm">
            <Input placeholder="Dr. Name" value={doc.name} onChange={e => updateDoctor(i, 'name', e.target.value)} />
            <Input placeholder="Speciality" value={doc.speciality} onChange={e => updateDoctor(i, 'speciality', e.target.value)} />
            <Input placeholder="Degree" className="w-24" value={doc.degree} onChange={e => updateDoctor(i, 'degree', e.target.value)} />
            <Input placeholder="Fees (₹)" className="w-24" type="number" value={doc.fees} onChange={e => updateDoctor(i, 'fees', e.target.value)} />
            <Button variant="ghost" size="icon" onClick={() => removeDoctor(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        <Button variant="outline" onClick={addDoctor} className="w-full border-dashed border-2">
          <Plus className="w-4 h-4 mr-2" /> Add Row
        </Button>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={() => onSave(doctors)} disabled={doctors.length === 0}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
