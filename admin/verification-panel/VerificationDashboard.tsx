import React, { useState } from 'react';
import { DocumentViewer } from './DocumentViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function VerificationDashboard() {
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  // Mock data for pending applications
  const pendingHospitals = [
    { id: '1', name: 'City Care Hospital', city: 'Lucknow', submitted_at: '2026-04-24T10:00:00Z', docs: 3 },
    { id: '2', name: 'Apex Multi-Speciality', city: 'Kanpur', submitted_at: '2026-04-24T11:30:00Z', docs: 2 },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar - Pending List */}
      <div className="w-1/3 bg-white border-r border-slate-200 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="font-bold text-lg">Verification Queue</h2>
          <p className="text-sm text-slate-500">{pendingHospitals.length} pending applications</p>
        </div>
        <div className="divide-y divide-slate-100">
          {pendingHospitals.map(hospital => (
            <div 
              key={hospital.id} 
              className={`p-4 cursor-pointer hover:bg-slate-50 ${selectedHospital?.id === hospital.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
              onClick={() => setSelectedHospital(hospital)}
            >
              <h3 className="font-medium text-slate-900">{hospital.name}</h3>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{hospital.city}</span>
                <span>{hospital.docs} docs uploaded</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Verification Details */}
      <div className="w-2/3 flex flex-col">
        {selectedHospital ? (
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold">{selectedHospital.name}</h1>
                <p className="text-slate-600">{selectedHospital.city}</p>
              </div>
              <Button variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                Schedule Field Visit
              </Button>
            </div>

            <Card className="mb-6 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-lg">License Document</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DocumentViewer 
                  hospitalId={selectedHospital.id} 
                  docType="license" 
                  docUrl="https://mock.url/license.pdf" 
                />
              </CardContent>
            </Card>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a hospital from the queue to begin verification.
          </div>
        )}
      </div>
    </div>
  );
}
