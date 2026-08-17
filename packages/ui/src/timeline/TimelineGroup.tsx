'use client';

import React, { useState } from 'react';

import { TimelineEventDisplay } from './TimelineCard';

export interface TimelineGroupProps {
  label: string;
  events: TimelineEventDisplay[];
  children?: React.ReactNode;
}

export function TimelineGroup({ label, events, children }: Readonly<TimelineGroupProps>) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section
      style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}
      aria-labelledby={`group-title-${label}`}
    >
      <button
        type="button"
        id={`group-title-${label}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 0',
          width: '100%',
          textAlign: 'left',
          fontSize: '14px',
          fontWeight: 600,
          color: '#4b5563',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <span
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
          }}
          aria-hidden="true"
        >
          ▶
        </span>
        <span>{label}</span>
        <span
          style={{
            background: '#e5e7eb',
            color: '#4b5563',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '999px',
            fontWeight: 500,
          }}
        >
          {events.length}
        </span>
      </button>

      {isOpen && (
        <div
          role="group"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingLeft: '16px',
            borderLeft: '2px solid #e5e7eb',
            marginLeft: '6px',
            paddingTop: '8px',
          }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
