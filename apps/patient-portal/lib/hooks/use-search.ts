/* eslint-disable */
'use client';

import { useState, useEffect, useCallback } from 'react';

interface SearchSuggestion {
  text: string;
  entityType: string;
  entityId: string;
}

interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  hospitalId?: string;
  title: string;
  content?: string;
  metadata?: Record<string, any>;
  rank: number;
  createdAt: string;
  updatedAt: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  tookMs: number;
}

export function useSearch() {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);

  const autocomplete = useCallback(async (query: string, types?: string[], limit = 10) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return [];
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        action: 'autocomplete',
        limit: limit.toString(),
      });
      if (types && types.length > 0) {
        params.set('types', types.join(','));
      }
      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        return data.suggestions || [];
      }
    } catch (err) {
      console.warn('Autocomplete failed:', err);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, []);

  const search = useCallback(
    async (query: string, types?: string[], limit = 20, hospitalId?: string) => {
      if (!query) {
        setSearchResults(null);
        return null;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          limit: limit.toString(),
        });
        if (types && types.length > 0) {
          params.set('types', types.join(','));
        }
        if (hospitalId) {
          params.set('hospitalId', hospitalId);
        }
        const res = await fetch(`/api/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          return data;
        }
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [],
  );

  return {
    suggestions,
    isLoading,
    searchResults,
    autocomplete,
    search,
  };
}

export function useMedicineSearch() {
  const { autocomplete, ...rest } = useSearch();
  const searchMedicines = useCallback(
    (query: string, limit = 10) => autocomplete(query, ['medicine'], limit),
    [autocomplete],
  );
  return { ...rest, searchMedicines, autocomplete };
}

export function useInvestigationSearch() {
  const { autocomplete, ...rest } = useSearch();
  const searchInvestigations = useCallback(
    (query: string, limit = 10) => autocomplete(query, ['investigation'], limit),
    [autocomplete],
  );
  return { ...rest, searchInvestigations, autocomplete };
}

export function useDoctorSearch() {
  const { search, ...rest } = useSearch();
  const searchDoctors = useCallback(
    (query: string, limit = 20, hospitalId?: string) =>
      search(query, ['doctor'], limit, hospitalId),
    [search],
  );
  return { ...rest, searchDoctors, search };
}

export function usePatientSearch() {
  const { search, ...rest } = useSearch();
  const searchPatients = useCallback(
    (query: string, limit = 20, hospitalId?: string) =>
      search(query, ['patient'], limit, hospitalId),
    [search],
  );
  return { ...rest, searchPatients, search };
}
