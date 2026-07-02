import { Plus } from 'lucide-react';

import React, { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MedicineSuggestion {
  text: string;
  entityType: string;
  entityId: string;
}

export function MedicineAutocomplete({ onAdd }: { onAdd: (med: any) => void }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [suggestions, setSuggestions] = useState<MedicineSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [dose, setDose] = useState('');
  const [freq, setFreq] = useState('');
  const [dur, setDur] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          action: 'autocomplete',
          types: 'medicine',
          limit: '10',
        });
        const res = await fetch(`/api/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.warn('Autocomplete fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const results = suggestions.map((s) => ({ name: s.text }));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setActiveIdx((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && isOpen && results.length > 0) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    }
  };

  const handleSelect = (med: any) => {
    setSelectedMed(med);
    setQuery(med.name);
    setDose(med.dose || '');
    setFreq(med.frequency || '');
    setDur(med.duration || '');
    setIsOpen(false);
    document.getElementById('dose-input')?.focus();
  };

  const handleAdd = () => {
    if (!selectedMed) return;
    onAdd({ name: selectedMed.name, dose, frequency: freq, duration: dur });
    setSelectedMed(null);
    setQuery('');
    setDose('');
    setFreq('');
    setDur('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex gap-2 items-start">
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length >= 2);
            if (e.target.value.length < 2) setSuggestions([]);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type drug name (e.g., Par...)"
          className="w-full"
        />
        {isLoading && (
          <div className="absolute right-2 top-2 text-xs text-slate-400">loading...</div>
        )}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border shadow-lg mt-1 rounded-md max-h-48 overflow-y-auto">
            {suggestions.map((r, i) => (
              <div
                key={r.entityId}
                className={`p-2 cursor-pointer text-sm ${i === activeIdx ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
                onClick={() => handleSelect({ name: r.text })}
              >
                {r.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <Input
        id="dose-input"
        value={dose}
        onChange={(e) => setDose(e.target.value)}
        placeholder="Dose"
        className="w-24"
        disabled={!selectedMed}
      />
      <Input
        value={freq}
        onChange={(e) => setFreq(e.target.value)}
        placeholder="Frequency"
        className="w-40"
        disabled={!selectedMed}
      />
      <Input
        value={dur}
        onChange={(e) => setDur(e.target.value)}
        placeholder="Duration"
        className="w-24"
        disabled={!selectedMed}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
        }}
      />

      <Button onClick={handleAdd} disabled={!selectedMed} className="px-3">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
