'use client';

import { useEffect, useState, useCallback } from 'react';
import EscalationCard from '@/components/hospital/EscalationCard';
import { Siren, AlertTriangle } from 'lucide-react';

interface EscalationRow {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  doctorId: string;
  missedCount: number;
  chronicTag?: string;
  notificationSent: boolean;
  sentVia?: string;
  createdAt: string;
}

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<EscalationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const fetchEscalations = useCallback(async (off: number, replace = false) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/escalations?limit=${PAGE_SIZE}&offset=${off}`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEscalations(replace ? data.escalations : [...escalations, ...data.escalations]);
      setTotal(data.pagination?.total ?? data.escalations.length);
    } catch (e: any) {
      console.error('[EscalationsPage] fetch failed:', e.message);
    } finally {
      setLoading(false);
    }
  }, [escalations.length]);

  useEffect(() => {
    fetchEscalations(0, true);
  }, []);

  const handleAcknowledge = async (id: string) => {
    setAcknowledging(id);
    try {
      const res = await fetch(`/api/v1/escalations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Optimistic update
      setEscalations((prev) => prev.filter((e) => e.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e: any) {
      console.error('[EscalationsPage] acknowledge failed:', e.message);
    } finally {
      setAcknowledging(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Siren className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Escalation Queue</h1>
          <p className="text-sm text-slate-500">
            Chronic follow-up escalations requiring doctor review
          </p>
        </div>
        {total > 0 && (
          <Badge className="ml-auto bg-red-600 text-white">{total} pending</Badge>
        )}
      </div>

      {/* Empty state */}
      {!loading && escalations.length === 0 && (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
          <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No active escalations</p>
          <p className="text-sm text-slate-400">All caught up — patients with missed follow-ups will appear here.</p>
        </div>
      )}

      {/* Card grid */}
      <div className="grid gap-4">
        {escalations.map((alert) => (
          <EscalationCard
            key={alert.id}
            alert={alert}
            onAcknowledge={handleAcknowledge}
            isAcknowledging={acknowledging === alert.id}
          />
        ))}
      </div>

      {/* Load more */}
      {escalations.length < total && !loading && (
        <div className="text-center">
          <button
            onClick={() => fetchEscalations(offset + PAGE_SIZE)}
            className="px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline"
          >
            Load more ({total - escalations.length} remaining)
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-slate-500">Loading escalations…</div>
      )}
    </div>
  );
}
