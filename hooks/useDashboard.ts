/**
 * Dashboard SWR hooks — barrel export.
 * Each hook maps to one API endpoint with appropriate refresh intervals.
 */
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

// ─── 1. Metrics (top cards) — refresh 30s ─────────────────────────────────
export function useMetrics(hospitalId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        hospitalId ? `/api/hospitals/${hospitalId}/dashboard/metrics` : null,
        fetcher,
        { refreshInterval: 30_000, revalidateOnFocus: true }
    );
    return { metrics: data, isLoading, isError: !!error, mutate };
}

// ─── 2. Retention KPI — refresh 5 min ─────────────────────────────────────
export function useRetentionKPI(hospitalId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        hospitalId ? `/api/hospitals/${hospitalId}/retention/kpi` : null,
        fetcher,
        { refreshInterval: 300_000 }
    );
    return { kpi: data, isLoading, isError: !!error, mutate };
}

// ─── 3. Follow-ups — refresh 60s ─────────────────────────────────────────
export function useFollowups(hospitalId: string | undefined, status: 'pending' | 'missed') {
    const { data, error, isLoading, mutate } = useSWR(
        hospitalId ? `/api/hospitals/${hospitalId}/followups?status=${status}&limit=20` : null,
        fetcher,
        { refreshInterval: 60_000 }
    );
    return { followups: data, isLoading, isError: !!error, mutate };
}

// ─── 4. Events (live feed) — refresh 10s ──────────────────────────────────
export function useEvents(hospitalId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        hospitalId ? `/api/hospitals/${hospitalId}/events?limit=6` : null,
        fetcher,
        { refreshInterval: 10_000 }
    );
    return { events: data?.events ?? [], isLoading, isError: !!error, mutate };
}

// ─── 5. Notifications — refresh 2 min ────────────────────────────────────
export function useNotifications(hospitalId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        hospitalId ? `/api/hospitals/${hospitalId}/notifications/today` : null,
        fetcher,
        { refreshInterval: 120_000 }
    );
    return { notif: data, isLoading, isError: !!error, mutate };
}

// ─── 6. Revenue — refresh 10 min ─────────────────────────────────────────
export function useRevenue(hospitalId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR(
        hospitalId ? `/api/hospitals/${hospitalId}/analytics/revenue?period=month` : null,
        fetcher,
        { refreshInterval: 600_000 }
    );
    return { revenue: data, isLoading, isError: !!error, mutate };
}
