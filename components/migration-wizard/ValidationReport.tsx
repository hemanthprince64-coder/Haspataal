import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { validateRow } from '../../utils/column-mapper';
import { AlertCircle, CheckCircle2, Download, Play } from 'lucide-react';

export function ValidationReport({ rawData, mapping, onComplete, onBack }: any) {
  const [results, setResults] = useState<{ validRows: any[], errors: any[] }>({ validRows: [], errors: [] });
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    // Run validation engine
    const valid: any[] = [];
    const errs: any[] = [];
    // Basic duplicate tracking for this batch
    const seen = new Set();

    rawData.forEach((row: any, idx: number) => {
      const { mappedRow, errors, isValid } = validateRow(row, mapping);
      
      let finalValid = isValid;
      if (isValid) {
        const dupKey = mappedRow.phone ? `${mappedRow.name}-${mappedRow.phone}` : `${mappedRow.name}-${mappedRow.dob}`;
        if (seen.has(dupKey)) {
          errors.push('Duplicate row in current upload batch');
          finalValid = false;
        } else {
          seen.add(dupKey);
        }
      }

      if (finalValid) {
        valid.push(mappedRow);
      } else {
        errs.push({ originalRow: idx + 1, mappedRow, errors });
      }
    });

    setResults({ validRows: valid, errors: errs });
    setAnalyzing(false);
  }, [rawData, mapping]);

  if (analyzing) {
    return <div className="py-12 text-center text-slate-500 animate-pulse">Analyzing {rawData.length} rows...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold">Validation Report</h3>
        <p className="text-slate-500">Review errors before importing clean data.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 border p-4 rounded-xl text-center">
          <p className="text-sm text-slate-500 font-medium">Total Rows</p>
          <p className="text-3xl font-bold mt-1 text-slate-800">{rawData.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center">
          <p className="text-sm text-green-700 font-medium flex justify-center items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Valid Rows</p>
          <p className="text-3xl font-bold mt-1 text-green-700">{results.validRows.length}</p>
        </div>
        <div className={`bg-red-50 border border-red-200 p-4 rounded-xl text-center ${results.errors.length > 0 ? '' : 'opacity-50'}`}>
          <p className="text-sm text-red-700 font-medium flex justify-center items-center gap-1"><AlertCircle className="w-4 h-4"/> Rows with Errors</p>
          <p className="text-3xl font-bold mt-1 text-red-700">{results.errors.length}</p>
        </div>
      </div>

      {results.errors.length > 0 && (
        <div className="mt-6 border border-red-200 rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex justify-between items-center">
            <h4 className="font-semibold text-red-800">Error Details (First 5)</h4>
            <Button variant="outline" size="sm" className="text-red-700 border-red-200 bg-white">
              <Download className="w-4 h-4 mr-2" /> Download Error CSV
            </Button>
          </div>
          <div className="p-0 max-h-64 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-2">Row</th>
                  <th className="px-4 py-2">Data snippet</th>
                  <th className="px-4 py-2">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {results.errors.slice(0, 5).map((e, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-medium">{e.originalRow}</td>
                    <td className="px-4 py-3 text-slate-600">{e.mappedRow.name || '(No Name)'} - {e.mappedRow.phone || '(No Phone)'}</td>
                    <td className="px-4 py-3 text-red-600">
                      <ul className="list-disc pl-4">{e.errors.map((err: string, j: number) => <li key={j}>{err}</li>)}</ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="ghost" onClick={onBack}>Go Back to Mapping</Button>
        <Button 
          onClick={() => onComplete(results)} 
          disabled={results.validRows.length === 0}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          Import {results.validRows.length} Valid Rows <Play className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
