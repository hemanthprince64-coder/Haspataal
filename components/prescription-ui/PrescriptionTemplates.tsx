import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileHeart, Zap } from 'lucide-react';

export function PrescriptionTemplates() {
  const TEMPLATES = [
    { name: 'Standard URTI', desc: 'Paracetamol, Amoxicillin, Cough Syrup' },
    { name: 'Acute Gastro', desc: 'ORS, Pantoprazole, Ofloxacin' },
    { name: 'HTN Follow-up', desc: 'Amlodipine, Continue same diet' }
  ];

  return (
    <Card className="shadow-sm flex-1 bg-amber-50/50 border-amber-100">
      <CardHeader className="pb-3 border-b border-amber-100">
        <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          1-Click Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {TEMPLATES.map((t, i) => (
          <div key={i} className="p-3 bg-white border border-amber-200 rounded-lg cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all group">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm text-slate-800">{t.name}</span>
              <FileHeart className="w-4 h-4 text-amber-300 group-hover:text-amber-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">{t.desc}</p>
          </div>
        ))}
        <div className="text-xs text-center text-amber-700/60 pt-2 cursor-pointer hover:underline">
          Manage Templates
        </div>
      </CardContent>
    </Card>
  );
}
