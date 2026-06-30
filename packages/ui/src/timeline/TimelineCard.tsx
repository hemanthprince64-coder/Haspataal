'use client';

import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface TimelineEventDisplay {
  id: string;
  eventType: string;
  category: string;
  title: string;
  subtitle?: string;
  summary?: string;
  timestamp: string | Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tags: string[];
  isPinned?: boolean;
  module?: string;
  fhirResourceType?: string;
}

export interface TimelineCardProps {
  event: TimelineEventDisplay;
  onBookmark?: (eventId: string) => void;
  onPin?: (eventId: string, isPinned: boolean) => void;
  onClick?: (event: TimelineEventDisplay) => void;
  isBookmarked?: boolean;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  APPOINTMENT: '📅',
  CONSULTATION: '👨‍⚕️',
  CLINICAL_NOTE: '📝',
  VITALS: '💓',
  DIAGNOSIS: '🩺',
  PRESCRIPTION: '💊',
  INVESTIGATION: '🔬',
  RADIOLOGY: '🫁',
  PROCEDURE: '⚕️',
  SURGERY: '🔪',
  ADMISSION: '🏥',
  DISCHARGE: '🚪',
  BILLING: '💳',
  PAYMENT: '✅',
  VACCINATION: '💉',
  CARE_JOURNEY: '🗺️',
  INSURANCE: '📋',
  ADMINISTRATIVE: '📁',
  UNKNOWN: '📌',
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  CRITICAL: { color: '#dc2626', bg: '#fee2e2', label: '⚠ Critical' },
  HIGH: { color: '#d97706', bg: '#fef3c7', label: '↑ High' },
  MEDIUM: { color: '#2563eb', bg: '#dbeafe', label: '~ Medium' },
  LOW: { color: '#16a34a', bg: '#dcfce7', label: '✓ Normal' },
};

function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAbsoluteTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function TimelineCard({
  event,
  onBookmark,
  onPin,
  onClick,
  isBookmarked = false,
}: Readonly<TimelineCardProps>) {
  const [showAbsTime, setShowAbsTime] = useState(false);
  const severity = SEVERITY_CONFIG[event.severity] ?? SEVERITY_CONFIG.LOW;
  const icon = CATEGORY_ICONS[event.category] ?? '📌';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') onClick?.(event);
    if (e.key === 'b') onBookmark?.(event.id);
    if (e.key === 'p') onPin?.(event.id, !event.isPinned);
  };

  return (
    <article
      role="article"
      aria-label={`${event.category}: ${event.title}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => onClick?.(event)}
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        borderRadius: '12px',
        border: event.severity === 'CRITICAL' ? '1.5px solid #dc2626' : '1px solid #e5e7eb',
        background: event.isPinned ? '#fafaf5' : '#ffffff',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        outline: 'none',
        position: 'relative',
      }}
      className="timeline-card"
    >
      {/* Icon */}
      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: severity.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#111827',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 280,
            }}
          >
            {event.title}
          </span>

          {/* Severity badge */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 999,
              color: severity.color,
              background: severity.bg,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {severity.label}
          </span>

          {/* Category badge */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 999,
              color: '#374151',
              background: '#f3f4f6',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {event.category.replace(/_/g, ' ')}
          </span>

          {event.isPinned && (
            <span aria-label="Pinned" style={{ fontSize: 14 }}>
              📌
            </span>
          )}
        </div>

        {/* Subtitle */}
        {event.subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{event.subtitle}</p>
        )}

        {/* Summary */}
        {event.summary && (
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 12,
              color: '#374151',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {event.summary}
          </p>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
            {event.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <button
          type="button"
          aria-label={showAbsTime ? 'Show relative time' : 'Show absolute time'}
          onClick={(e) => {
            e.stopPropagation();
            setShowAbsTime((v) => !v);
          }}
          style={{
            marginTop: 8,
            fontSize: 11,
            color: '#9ca3af',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          {showAbsTime ? formatAbsoluteTime(event.timestamp) : formatRelativeTime(event.timestamp)}
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        {onBookmark && (
          <button
            type="button"
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this event'}
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(event.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              opacity: isBookmarked ? 1 : 0.4,
              transition: 'opacity 0.15s',
            }}
          >
            🔖
          </button>
        )}
        {onPin && (
          <button
            type="button"
            aria-label={event.isPinned ? 'Unpin event' : 'Pin event'}
            onClick={(e) => {
              e.stopPropagation();
              onPin(event.id, !event.isPinned);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              opacity: event.isPinned ? 1 : 0.4,
              transition: 'opacity 0.15s',
            }}
          >
            📌
          </button>
        )}
      </div>

      <style>{`
        .timeline-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border-color: #d1d5db;
        }
        .timeline-card:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
      `}</style>
    </article>
  );
}
