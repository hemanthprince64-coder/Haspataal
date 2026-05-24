'use client';

import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

interface DataMigrationProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function DataMigration({ onNext, onPrev }: DataMigrationProps) {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<{
    total: number;
    valid: number;
    warnings: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setAnalyzing(true);

      // Simulate file analysis
      setTimeout(() => {
        setAnalyzing(false);
        setPreviewData({
          total: 87,
          valid: 82,
          warnings: [
            'Row 12: Missing blood group, will default to Unknown',
            'Row 45: Incomplete mobile number formatting, will auto-prefix with +91',
            'Row 78: Name contains numbers, will sanitize',
          ],
        });
        toast.info('File parsed successfully! Review summary before importing.');
      }, 1500);
    }
  };

  const handleImport = () => {
    setImporting(true);
    // Simulate import
    setTimeout(() => {
      setImporting(false);
      toast.success('Successfully imported 82 patients into clinic records database!');
      onNext();
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-teal-600" /> Patient Data Migration
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Import your old patient directory, contact logs, or legacy software Excel spreadsheet
            into Haspataal.
          </p>
        </div>

        {/* Upload panel */}
        {!file && (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-teal-400 transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud className="h-10 w-10 text-slate-400 mx-auto group-hover:text-teal-500 transition-colors mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">Upload Excel / CSV file</h4>
            <p className="text-xs text-slate-400 mt-1">
              Drag and drop or browse files. Supports CSV, XLSX formats.
            </p>
          </div>
        )}

        {/* Loading analyzer */}
        {analyzing && (
          <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-8 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
            <h4 className="font-semibold text-slate-800 text-sm">Analyzing records schema...</h4>
            <p className="text-xs text-slate-400">
              Mapping headers: Patient Name, Mobile Number, Age, Gender, City
            </p>
          </div>
        )}

        {/* Results preview */}
        {file && !analyzing && previewData && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border border-teal-100 bg-teal-50/30 rounded-2xl p-4">
              <div className="bg-teal-100 text-teal-700 p-2.5 rounded-xl">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB · Spreadsheet
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewData(null);
                }}
                className="text-xs text-red-600 font-semibold hover:underline"
              >
                Remove
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <span className="text-xs font-semibold text-slate-500">Total Rows Recognized</span>
                <div className="text-2xl font-extrabold text-slate-800 mt-1">
                  {previewData.total}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <span className="text-xs font-semibold text-slate-500">Clean Records (Ready)</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {previewData.valid}
                </div>
              </div>
            </div>

            {/* Warnings list */}
            <div className="border border-slate-100 rounded-2xl p-4 space-y-2 bg-amber-50/20 border-amber-100/50">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Mapping Adjustments (
                {previewData.warnings.length})
              </span>
              <ul className="space-y-1">
                {previewData.warnings.map((w, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-slate-400" /> {w}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action */}
            <Button
              onClick={handleImport}
              disabled={importing}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Importing records...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" /> Import Patients Now
                </>
              )}
            </Button>
          </div>
        )}

        {/* Navigation controls */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onPrev}
            className="rounded-xl border-slate-300 font-bold px-6"
          >
            Back
          </Button>
          {!file && (
            <Button
              onClick={onNext}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl px-6"
            >
              Skip data migration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
