import { ClinicalTimelineEvent, TimelineCategory } from '@haspataal/types';
import {
  Calendar,
  CheckCircle,
  Activity,
  ClipboardList,
  Pill,
  TestTube,
  ActivitySquare,
  AlertCircle,
  RefreshCcw,
  LogOut,
} from 'lucide-react';

import * as React from 'react';

import { cn } from '@/lib/utils';

export const Timeline = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        'relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6',
        className,
      )}
      {...props}
    />
  ),
);
Timeline.displayName = 'Timeline';

export const TimelineItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('mb-10 ml-6 relative', className)} {...props} />
  ),
);
TimelineItem.displayName = 'TimelineItem';

const getCategoryColor = (category: TimelineCategory) => {
  switch (category) {
    case TimelineCategory.BOOKING:
      return 'bg-slate-500 border-slate-500 text-slate-50';
    case TimelineCategory.TRIAGE:
      return 'bg-indigo-500 border-indigo-500 text-indigo-50';
    case TimelineCategory.VITALS:
      return 'bg-blue-500 border-blue-500 text-blue-50';
    case TimelineCategory.DIAGNOSIS:
      return 'bg-purple-500 border-purple-500 text-purple-50';
    case TimelineCategory.PRESCRIPTION:
      return 'bg-green-500 border-green-500 text-green-50';
    case TimelineCategory.INVESTIGATION:
      return 'bg-amber-500 border-amber-500 text-amber-50';
    case TimelineCategory.LAB:
      return 'bg-cyan-500 border-cyan-500 text-cyan-50';
    case TimelineCategory.RADIOLOGY:
      return 'bg-teal-500 border-teal-500 text-teal-50';
    case TimelineCategory.PROCEDURE:
      return 'bg-orange-500 border-orange-500 text-orange-50';
    case TimelineCategory.BILLING:
      return 'bg-gray-500 border-gray-500 text-gray-50';
    case TimelineCategory.ALERT:
      return 'bg-red-500 border-red-500 text-red-50';
    case TimelineCategory.FOLLOWUP:
      return 'bg-emerald-500 border-emerald-500 text-emerald-50';
    case TimelineCategory.DISCHARGE:
      return 'bg-black border-black text-white';
    default:
      return 'bg-slate-300 border-slate-300 text-slate-800';
  }
};

const getCategoryIcon = (category: TimelineCategory) => {
  switch (category) {
    case TimelineCategory.BOOKING:
      return <Calendar className="w-3 h-3" />;
    case TimelineCategory.TRIAGE:
      return <CheckCircle className="w-3 h-3" />;
    case TimelineCategory.VITALS:
      return <Activity className="w-3 h-3" />;
    case TimelineCategory.DIAGNOSIS:
      return <ClipboardList className="w-3 h-3" />;
    case TimelineCategory.PRESCRIPTION:
      return <Pill className="w-3 h-3" />;
    case TimelineCategory.INVESTIGATION:
    case TimelineCategory.LAB:
      return <TestTube className="w-3 h-3" />;
    case TimelineCategory.RADIOLOGY:
      return <ActivitySquare className="w-3 h-3" />;
    case TimelineCategory.PROCEDURE:
      return <ClipboardList className="w-3 h-3" />;
    case TimelineCategory.ALERT:
      return <AlertCircle className="w-3 h-3" />;
    case TimelineCategory.FOLLOWUP:
      return <RefreshCcw className="w-3 h-3" />;
    case TimelineCategory.DISCHARGE:
      return <LogOut className="w-3 h-3" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-current" />;
  }
};

export function TimelineEventCard({ event }: { event: ClinicalTimelineEvent }) {
  const [expanded, setExpanded] = React.useState(false);
  const colorClass = getCategoryColor(event.category as TimelineCategory);
  const Icon = getCategoryIcon(event.category as TimelineCategory);

  return (
    <TimelineItem>
      <span
        className={cn(
          'absolute flex items-center justify-center w-6 h-6 rounded-full -left-9 ring-4 ring-white dark:ring-slate-900',
          colorClass,
        )}
      >
        {Icon}
      </span>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
        <h3 className="flex items-center text-sm font-semibold text-slate-900 dark:text-white">
          {event.title}
          {event.severity === 'CRITICAL' && (
            <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-3">
              Critical
            </span>
          )}
        </h3>
        <time className="block mb-1 text-xs font-normal leading-none text-slate-400 sm:mb-0">
          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {' • '}
          {event.actor.name}
        </time>
      </div>

      <p className="mb-2 text-sm font-normal text-slate-500 dark:text-slate-400">{event.summary}</p>

      {Object.keys(event.payload || {}).length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-500 flex items-center"
        >
          {expanded ? '▲ Hide Details' : '▼ Details'}
        </button>
      )}

      {expanded && (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border text-xs">
          <pre className="whitespace-pre-wrap font-mono text-slate-600 dark:text-slate-400">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </div>
      )}
    </TimelineItem>
  );
}
