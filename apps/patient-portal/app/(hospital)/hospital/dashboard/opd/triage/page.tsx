'use client';

import React, { useEffect, useState } from 'react';
import DynamicForm, { DynamicFormSchema } from '@/components/DynamicForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TriagePage() {
  const [schema, setSchema] = useState<DynamicFormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  useEffect(() => {
    fetch('/forms/opd-triage-v1.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load triage form schema');
        }
        return res.json();
      })
      .then((data) => {
        setSchema(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (data: any) => {
    console.log('Triage submitted:', data);
    setSubmittedData(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <h2 className="text-lg font-semibold mb-2">Error Loading Form</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!schema) return null;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          OPD Clinical Triage
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl">
          Assess patient vitals and symptoms to determine care urgency and assign token queues.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <DynamicForm
            schema={schema}
            onSubmit={handleSubmit}
            submitLabel="Save Triage Entry"
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200/80 bg-white/90 shadow-lg dark:border-slate-800/80 dark:bg-slate-950/90 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Triage Submission Output
              </CardTitle>
              <CardDescription>
                JSON payload and terminology maps mapped to care context.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submittedData ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Triage entry saved successfully! (Simulated local storage)
                  </div>
                  
                  <div className="space-y-3 font-mono text-xs bg-slate-50 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto border border-slate-100 dark:border-slate-800 max-h-[300px]">
                    {Object.entries(submittedData).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">{key}:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold ml-4 text-right">
                          {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : Array.isArray(val) ? val.join(', ') : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right">
                    Concept tags and codes automatically attached to clinical outbox
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  Submit the form to see the parsed JSON & concept-mappings output.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
