/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';

import { Input } from '@/components/ui/input';

interface DiagnosisSuggestion {
  text: string;
  entityType: string;
  entityId: string;
}

export function DiagnosisSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<DiagnosisSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const FAVS = ['Viral Fever', 'URTI', 'Gastroenteritis', 'Hypertension'];

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
          types: 'clinical',
          limit: '10',
        });
        const res = await fetch(`/api/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.warn('Diagnosis search fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (diag: string) => {
    setQuery(diag);
    onChange(diag);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(e.target.value.length >= 2);
        }}
        placeholder="Search ICD-10 or Type Custom Diagnosis"
        className="w-full"
      />
      {isLoading && <div className="absolute right-2 top-2 text-xs text-slate-400">loading...</div>}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border shadow-lg mt-1 rounded-md max-h-48 overflow-y-auto">
          {suggestions.map((r, i) => (
            <div
              key={r.entityId}
              className="p-2 cursor-pointer text-sm hover:bg-slate-50"
              onClick={() => handleSelect(r.text)}
            >
              {r.text}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <span className="text-xs text-slate-500 py-1">Favorites:</span>
        {FAVS.map((f) => (
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
