import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Loader2,
  Download,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { saveOfflineItem, queueMutation } from '@/lib/infrastructure/offline-db';

interface DataMigrationProps {
  onNext: () => void;
  onPrev: () => void;
}

interface ParsedPatient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  city: string;
  createdAt: string;
}

export default function DataMigration({ onNext, onPrev }: DataMigrationProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validPatients, setValidPatients] = useState<ParsedPatient[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // CSV parsing function with quote matching
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    const parseLine = (line: string) => {
      const result = [];
      let start = 0;
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
          result.push(line.slice(start, i).replace(/^"|"$/g, '').trim());
          start = i + 1;
        }
      }
      result.push(line.slice(start).replace(/^"|"$/g, '').trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map((line) => parseLine(line));
    return { headers, rows };
  };

  const handleDownloadTemplate = () => {
    const templateContent = [
      'Registration No,Patient Name,Age,Gender,Contact No,Village / Town,Symptoms / Complaints',
      'NHM-2026-0001,Rajesh Kumar,42,M,9876543210,Patna,Fever with chills and shivers',
      'NHM-2026-0002,Sita Devi,35,F,8765432109,Gaya,Persistent cough for 3 weeks',
      'NHM-2026-0003,Amit Singh,28,M,7654321098,Muzaffarpur,General weakness'
    ].join('\n');

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + templateContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Bihar_NHM_Patient_Register_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded Bihar NHM Register Template!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setParsing(true);
      setValidPatients([]);
      setWarnings([]);
      setErrors([]);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          const { headers, rows } = parseCSV(text);

          if (headers.length === 0) {
            setErrors(['CSV file is empty or formatted incorrectly.']);
            setParsing(false);
            return;
          }

          // Fuzzy match indices
          const findIndex = (keys: string[]) =>
            headers.findIndex((h) =>
              keys.some((k) => h.toLowerCase().includes(k.toLowerCase()))
            );

          const nameIdx = findIndex(['name', 'naam', 'नाम', 'রোগী']);
          const ageIdx = findIndex(['age', 'years', 'उम्र', 'वय']);
          const genderIdx = findIndex(['gender', 'sex', 'लिंग']);
          const phoneIdx = findIndex(['phone', 'mobile', 'contact', 'no', 'मोबाइल', 'नंबर']);
          const cityIdx = findIndex(['village', 'town', 'city', 'address', 'गांव', 'पता']);

          if (nameIdx === -1 || phoneIdx === -1) {
            setErrors([
              'Failed to map columns. Ensure your CSV has at least "Patient Name" and "Contact No" headers.'
            ]);
            setParsing(false);
            return;
          }

          const parsedList: ParsedPatient[] = [];
          const warnList: string[] = [];
          const errList: string[] = [];

          rows.forEach((row, idx) => {
            const rowNum = idx + 2; // 1-based index + header row
            if (row.length < 2) return; // skip empty rows

            const name = row[nameIdx] || '';
            const rawPhone = row[phoneIdx] || '';
            const ageVal = row[ageIdx] || '';
            const genderVal = row[genderIdx] || '';
            const city = row[cityIdx] || 'Bihar';

            // 1. Validate name
            if (!name || name.trim().length < 2) {
              errList.push(`Row ${rowNum}: Patient Name is missing or too short.`);
              return;
            }

            // 2. Validate phone
            const cleanedPhone = rawPhone.replace(/\D/g, '').slice(-10);
            if (cleanedPhone.length < 10) {
              errList.push(`Row ${rowNum}: Contact number "${rawPhone}" is invalid (must be 10 digits).`);
              return;
            }

            // 3. Parse age
            let age = parseInt(ageVal, 10);
            if (isNaN(age) || age < 0) {
              warnList.push(`Row ${rowNum}: Age "${ageVal}" is invalid, defaulted to 30.`);
              age = 30;
            }

            // 4. Map gender
            let gender: 'male' | 'female' = 'male';
            const cleanGender = genderVal.toLowerCase().trim();
            if (cleanGender.startsWith('f') || cleanGender.includes('महिला') || cleanGender.includes('स्त्री')) {
              gender = 'female';
            } else if (!cleanGender.startsWith('m') && !cleanGender.includes('पुरुष')) {
              warnList.push(`Row ${rowNum}: Gender "${genderVal}" unrecognized, defaulted to Male.`);
            }

            parsedList.push({
              id: `pat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${idx}`,
              name: name.trim(),
              phone: cleanedPhone,
              age,
              gender,
              city: city.trim(),
              createdAt: new Date().toISOString()
            });
          });

          setValidPatients(parsedList);
          setWarnings(warnList);
          setErrors(errList);

          if (errList.length > 0) {
            toast.error(`CSV analyzed with ${errList.length} critical errors.`);
          } else {
            toast.success('CSV analyzed successfully! All rows are ready.');
          }
        } catch (err) {
          console.error(err);
          setErrors(['Failed to parse file. Ensure it is a valid CSV.']);
        } finally {
          setParsing(false);
        }
      };

      reader.readAsText(selected);
    }
  };

  const handleImport = async () => {
    if (validPatients.length === 0) return;
    setImporting(true);

    try {
      // Import patients offline into local DB and outbox queue
      for (const pat of validPatients) {
        await saveOfflineItem('patients', pat);
        await queueMutation('CREATE_PATIENT', pat);
      }

      toast.success(`Successfully imported ${validPatients.length} patients offline!`);
      // Proceed to training simulation stage
      onNext();
    } catch (e: any) {
      console.error(e);
      toast.error(`Import failed: ${e.message || 'IndexedDB error'}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-teal-600" /> Bihar NHM Register Importer
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Import old Bihar NHM patient directories and OPD ticket books offline into Haspataal.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-xs font-bold gap-1.5 border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 flex-shrink-0"
          >
            <Download className="h-3.5 w-3.5" /> Download Template
          </Button>
        </div>

        {/* Upload panel */}
        {!file && (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-teal-400 transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud className="h-10 w-10 text-slate-400 mx-auto group-hover:text-teal-500 transition-colors mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">Upload Bihar NHM Register CSV</h4>
            <p className="text-xs text-slate-400 mt-1">
              Drag and drop or browse files. Must be in CSV format.
            </p>
          </div>
        )}

        {/* Loading analyzer */}
        {parsing && (
          <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-8 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
            <h4 className="font-semibold text-slate-800 text-sm">Parsing Bihar NHM columns...</h4>
            <p className="text-xs text-slate-400">
              Validating patient records, contact formatting, and demographics offline.
            </p>
          </div>
        )}

        {/* Results preview */}
        {file && !parsing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border border-teal-100 bg-teal-50/30 rounded-2xl p-4">
              <div className="bg-teal-100 text-teal-700 p-2.5 rounded-xl">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB · Bihar NHM Register
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setValidPatients([]);
                  setWarnings([]);
                  setErrors([]);
                }}
                className="text-xs text-red-600 font-semibold hover:underline"
              >
                Remove
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Valid Rows</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {validPatients.length}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Warnings</span>
                <div className="text-2xl font-extrabold text-amber-500 mt-1">
                  {warnings.length}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Errors (Skipped)</span>
                <div className="text-2xl font-extrabold text-rose-500 mt-1">
                  {errors.length}
                </div>
              </div>
            </div>

            {/* Warnings list */}
            {warnings.length > 0 && (
              <div className="border border-slate-100 rounded-2xl p-4 space-y-2 bg-amber-50/20 border-amber-100/50">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Mapping Adjustments ({warnings.length})
                </span>
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {warnings.map((w, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Critical Errors list */}
            {errors.length > 0 && (
              <div className="border border-slate-100 rounded-2xl p-4 space-y-2 bg-rose-50/20 border-rose-100/50">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600" /> Critical Failures ({errors.length})
                </span>
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {errors.map((e, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-rose-700 font-medium">{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action */}
            <Button
              onClick={handleImport}
              disabled={importing || validPatients.length === 0}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Importing patients offline...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" /> Import {validPatients.length} Clean Records
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
