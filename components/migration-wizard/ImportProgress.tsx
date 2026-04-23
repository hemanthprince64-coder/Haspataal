import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

export function ImportProgress({ validatedData }: { validatedData: any[] }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'importing' | 'completed' | 'error'>('importing');
  const [stats, setStats] = useState({ inserted: 0, duplicates: 0, errors: 0 });

  useEffect(() => {
    const importData = async () => {
      // Chunk size is 500
      const CHUNK_SIZE = 500;
      const chunks = [];
      for (let i = 0; i < validatedData.length; i += CHUNK_SIZE) {
        chunks.push(validatedData.slice(i, i + CHUNK_SIZE));
      }

      let currentInserted = 0;
      let currentDuplicates = 0;
      let currentErrors = 0;
      let processed = 0;

      for (const chunk of chunks) {
        try {
          const res = await fetch('/api/import/patients/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mappedRows: chunk })
          });
          const data = await res.json();
          
          if (data.success) {
            currentInserted += data.inserted || 0;
            currentDuplicates += data.duplicates || 0;
            currentErrors += data.errors || 0;
          } else {
            currentErrors += chunk.length;
          }
        } catch (err) {
          currentErrors += chunk.length;
        }

        processed += chunk.length;
        setProgress(Math.round((processed / validatedData.length) * 100));
        setStats({ inserted: currentInserted, duplicates: currentDuplicates, errors: currentErrors });
      }

      // Finalize
      await fetch('/api/import/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalRows: validatedData.length, sourceType: 'csv' })
      });

      setStatus('completed');
    };

    if (validatedData.length > 0) {
      importData();
    } else {
      setStatus('completed');
    }
  }, [validatedData]);

  if (status === 'completed') {
    return (
      <div className="py-12 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Migration Complete!</h2>
        <p className="text-slate-500 max-w-md mx-auto">Your legacy data has been successfully imported into the Haspataal database.</p>
        
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-6">
          <Card className="p-4 bg-slate-50 border-0 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Inserted</p>
            <p className="text-2xl font-bold text-green-600">{stats.inserted}</p>
          </Card>
          <Card className="p-4 bg-slate-50 border-0 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Skipped (Dup)</p>
            <p className="text-2xl font-bold text-amber-600">{stats.duplicates}</p>
          </Card>
          <Card className="p-4 bg-slate-50 border-0 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Errors</p>
            <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
          </Card>
        </div>

        <div className="pt-8">
          <Button onClick={() => window.location.href = '/hms/patients'} className="px-8">
            Go to Patient Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 text-center space-y-8">
      <h3 className="text-2xl font-bold text-slate-800">Importing Patient Records...</h3>
      
      <div className="max-w-md mx-auto relative pt-4">
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
          <span>{progress}% Complete</span>
          <span>~ 500 rows/sec</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 py-3 px-6 rounded-full inline-flex border border-blue-100">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Please do not close this window. Batch processing in progress.</span>
      </div>
    </div>
  );
}
