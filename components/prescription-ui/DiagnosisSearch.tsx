import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

export function DiagnosisSearch({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  // Mock ICD-10
  const MOCK_ICD = [
    { code: 'J06.9', desc: 'Acute upper respiratory infection, unspecified' },
    { code: 'A09', desc: 'Infectious gastroenteritis and colitis' },
    { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' },
  ];

  const FAVS = ['Viral Fever', 'URTI', 'Gastroenteritis', 'Hypertension'];

  const handleSelect = (diag: string) => {
    setQuery(diag);
    onChange(diag);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Input 
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(e.target.value.length >= 2);
        }}
        placeholder="Search ICD-10 or Type Custom Diagnosis"
        className="w-full"
      />
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border shadow-lg mt-1 rounded-md">
          {MOCK_ICD.filter(i => i.desc.toLowerCase().includes(query.toLowerCase()) || i.code.includes(query)).map((r, i) => (
            <div 
              key={i} 
              className="p-2 cursor-pointer text-sm hover:bg-slate-50 flex justify-between"
              onClick={() => handleSelect(`${r.desc} (${r.code})`)}
            >
              <span>{r.desc}</span>
              <span className="text-slate-400 text-xs">{r.code}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2 mt-2">
        <span className="text-xs text-slate-500 py-1">Favorites:</span>
        {FAVS.map(f => (
          <span 
            key={f} 
            className="text-xs bg-slate-100 hover:bg-slate-200 cursor-pointer px-2 py-1 rounded text-slate-700"
            onClick={() => handleSelect(f)}
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
