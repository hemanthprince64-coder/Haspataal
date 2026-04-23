import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ColumnMapper } from './ColumnMapper';
import { ValidationReport } from './ValidationReport';
import { ImportProgress } from './ImportProgress';
import { UploadCloud, Database } from 'lucide-react';
import { fuzzyMatchHeaders } from '../../utils/column-mapper';

export function MigrationLayout() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Validate, 4: Import
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [validationResults, setValidationResults] = useState<any>(null);

  // Mocking file upload
  const handleFileUpload = (e: any) => {
    // In a real app, use XLSX or PapaParse
    const mockHeaders = ['S.No', 'Patient Name', 'Mob No', 'Age', 'Address', 'Gender'];
    const mockData = [
      { 'S.No': '1', 'Patient Name': 'Rahul Verma', 'Mob No': '9876543210', 'Age': '34', 'Address': 'Lucknow', 'Gender': 'M' },
      { 'S.No': '2', 'Patient Name': 'Priya Singh', 'Mob No': '12345', 'Age': '28', 'Address': 'Kanpur', 'Gender': 'F' }, // Invalid phone
      { 'S.No': '3', 'Patient Name': '', 'Mob No': '9999988888', 'Age': '45', 'Address': 'Agra', 'Gender': 'M' } // Missing name
    ];
    setRawHeaders(mockHeaders);
    setRawData(mockData);
    setMapping(fuzzyMatchHeaders(mockHeaders));
    setStep(2);
  };

  const handleMappingComplete = (newMapping: Record<string, string | null>) => {
    setMapping(newMapping);
    setStep(3);
  };

  const handleValidationComplete = (results: any) => {
    setValidationResults(results);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-xl border-0">
        <div className="bg-blue-600 text-white p-6 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6" /> Data Migration Engine
            </h2>
            <p className="text-blue-100 mt-1">Import your legacy patient records.</p>
          </div>
          <div className="text-sm font-medium bg-blue-700 px-3 py-1 rounded-full">
            Step {step} of 4
          </div>
        </div>

        <CardContent className="p-8">
          {step === 1 && (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
              <UploadCloud className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 text-lg">Upload Excel or CSV</h3>
              <p className="text-sm text-slate-500 mb-6">Supports .xlsx, .xls, and .csv files up to 50MB</p>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow text-sm font-medium transition-colors">
                Select File
                <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {step === 2 && (
            <ColumnMapper 
              headers={rawHeaders} 
              initialMapping={mapping} 
              previewData={rawData.slice(0, 5)} 
              onComplete={handleMappingComplete} 
            />
          )}

          {step === 3 && (
            <ValidationReport 
              rawData={rawData} 
              mapping={mapping} 
              onComplete={handleValidationComplete} 
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <ImportProgress 
              validatedData={validationResults.validRows} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
