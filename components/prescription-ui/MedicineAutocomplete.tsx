import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function MedicineAutocomplete({ onAdd }: { onAdd: (med: any) => void }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  
  // Smart defaults auto-filled upon selection
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [dose, setDose] = useState('');
  const [freq, setFreq] = useState('');
  const [dur, setDur] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Mock DB
  const MOCK_DRUGS = [
    { name: 'Paracetamol 500mg', dose: '1 Tab', frequency: 'TDS (After Meal)', duration: '3 Days' },
    { name: 'Amoxicillin 625mg', dose: '1 Tab', frequency: 'BD (After Meal)', duration: '5 Days' },
    { name: 'Pantoprazole 40mg', dose: '1 Tab', frequency: 'OD (Empty Stomach)', duration: '5 Days' },
  ];

  const results = MOCK_DRUGS.filter(d => d.name.toLowerCase().includes(query.toLowerCase()));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setActiveIdx(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setActiveIdx(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && isOpen && results.length > 0) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    }
  };

  const handleSelect = (med: any) => {
    setSelectedMed(med);
    setQuery(med.name);
    setDose(med.dose);
    setFreq(med.frequency);
    setDur(med.duration);
    setIsOpen(false);
    // Move focus to dose
    document.getElementById('dose-input')?.focus();
  };

  const handleAdd = () => {
    if (!selectedMed) return;
    onAdd({ name: selectedMed.name, dose, frequency: freq, duration: dur });
    // Reset for next rapid entry
    setSelectedMed(null);
    setQuery(''); setDose(''); setFreq(''); setDur('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex gap-2 items-start">
      <div className="relative flex-1">
        <Input 
          ref={inputRef}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length >= 2);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type drug name (e.g., Par...)"
          className="w-full"
        />
        {isOpen && results.length > 0 && (
          <div className="absolute z-10 w-full bg-white border shadow-lg mt-1 rounded-md max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <div 
                key={i} 
                className={`p-2 cursor-pointer text-sm ${i === activeIdx ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
                onClick={() => handleSelect(r)}
              >
                {r.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <Input id="dose-input" value={dose} onChange={e=>setDose(e.target.value)} placeholder="Dose" className="w-24" disabled={!selectedMed} />
      <Input value={freq} onChange={e=>setFreq(e.target.value)} placeholder="Frequency" className="w-40" disabled={!selectedMed} />
      <Input value={dur} onChange={e=>setDur(e.target.value)} placeholder="Duration" className="w-24" disabled={!selectedMed} 
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }} 
      />
      
      <Button onClick={handleAdd} disabled={!selectedMed} className="px-3">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
