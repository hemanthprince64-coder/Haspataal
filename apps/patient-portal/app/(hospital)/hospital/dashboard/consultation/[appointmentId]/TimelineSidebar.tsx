'use client';

import { ClinicalTimelineEvent } from '@haspataal/types';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@haspataal/ui';

import { useState, useEffect } from 'react';

import { Timeline, TimelineEventCard } from '@/components/ui/timeline';

export function TimelineSidebar({ patientId }: { patientId: string }) {
  const [events, setEvents] = useState<ClinicalTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('');

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const url = new URL(`/api/hospital/patients/${patientId}/timeline`, window.location.origin);
      if (category) url.searchParams.set('category', category);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch timeline', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [patientId, category]);

  // Group events by Encounter ID or Visit ID (or a proxy like date if missing)
  const groupedEvents = events.reduce(
    (acc, event) => {
      const key =
        event.encounterId || event.visitId || new Date(event.timestamp).toLocaleDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    },
    {} as Record<string, ClinicalTimelineEvent[]>,
  );

  return (
    <Card className="h-full max-h-[85vh] overflow-y-auto sticky top-4">
      <CardHeader className="pb-4 sticky top-0 bg-white dark:bg-slate-950 z-10 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Patient Timeline</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchTimeline}>
            Refresh
          </Button>
        </div>
        <div className="mt-2 flex space-x-2 overflow-x-auto pb-2">
          {['', 'DIAGNOSIS', 'PRESCRIPTION', 'VITALS', 'INVESTIGATION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                category === cat
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {cat === '' ? 'All' : cat}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center text-sm text-slate-500">Loading timeline...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-sm text-slate-500">No events found.</div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([visitId, visitEvents]) => (
              <div key={visitId}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Context: {visitId.length > 10 ? visitId.slice(0, 8) + '...' : visitId}
                  </span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>
                <Timeline>
                  {visitEvents.map((event) => (
                    <TimelineEventCard key={event.id} event={event} />
                  ))}
                </Timeline>
              </div>
            ))}

            <div className="flex justify-center pt-4">
              <Button variant="ghost" size="sm" className="text-xs text-slate-500">
                Load older events ↓
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
