/* eslint-disable */
import { Calendar, FileText, Pill, FlaskRound, Stethoscope } from 'lucide-react';

import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface TimelineViewProps {
  patientId: string;
}

export function TimelineView({ patientId }: TimelineViewProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');

  const loadTimeline = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/records?patientId=${patientId}${query ? `&q=${query}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) loadTimeline();
  }, [patientId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT':
        return <Calendar className="w-4 h-4" />;
      case 'PRESCRIPTION':
        return <Pill className="w-4 h-4" />;
      case 'INVESTIGATION':
        return <FlaskRound className="w-4 h-4" />;
      case 'VITALS':
        return <Stethoscope className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'PRESCRIPTION':
        return 'default';
      case 'INVESTIGATION':
        return 'secondary';
      case 'VITALS':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Patient Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search timeline..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={loadTimeline} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Search'}
          </Button>
        </div>

        {events.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No events in timeline.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  {getIcon(event.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{event.title}</h4>
                    <Badge variant={getBadgeVariant(event.type)}>{event.type}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
