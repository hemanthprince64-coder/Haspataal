import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TARGET_FIELDS } from '../../utils/column-mapper';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function ColumnMapper({ headers, initialMapping, previewData, onComplete }: any) {
  const [mapping, setMapping] = useState(initialMapping);

  const handleMapChange = (header: string, targetKey: string) => {
    setMapping({ ...mapping, [header]: targetKey === 'none' ? null : targetKey });
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold">Map Columns</h3>
        <p className="text-slate-500">We've auto-matched fields where possible. Please review and adjust.</p>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {headers.map((header: string) => (
          <div key={header} className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <div className="w-1/3 font-medium text-slate-700 break-words">{header}</div>
            <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
            <div className="w-1/3">
              <select 
                className={`w-full border rounded-md p-2 text-sm ${mapping[header] ? 'border-green-400 bg-green-50' : 'border-slate-300'}`}
                value={mapping[header] || 'none'}
                onChange={(e) => handleMapChange(header, e.target.value)}
              >
                <option value="none">-- Ignore this column --</option>
                {TARGET_FIELDS.map(field => (
                  <option key={field.key} value={field.key}>
                    {field.label} {field.required ? '*' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/3 pl-4 border-l">
              <p className="text-xs text-slate-400 mb-1">Preview</p>
              <p className="text-sm truncate text-slate-600">
                {previewData[0]?.[header] || 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm flex gap-2">
        <strong>Required:</strong> You must map a column to "Patient Name" and ("Mobile Number" OR "Date of Birth").
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => onComplete(mapping)} className="gap-2">
          Continue to Validation <CheckCircle2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
