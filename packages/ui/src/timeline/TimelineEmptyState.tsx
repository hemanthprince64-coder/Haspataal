'use client';

import React from 'react';

export interface TimelineEmptyStateProps {
  title?: string;
  description?: string;
}

export function TimelineEmptyState({
  title = 'No Timeline Events Found',
  description = 'There are no recorded clinical or administrative events for this timeline yet.',
}: Readonly<TimelineEmptyStateProps>) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: '#ffffff',
        border: '1px dashed #d1d5db',
        borderRadius: '12px',
        marginTop: '16px',
      }}
    >
      <div
        style={{
          fontSize: '32px',
          marginBottom: '16px',
          userSelect: 'none',
        }}
        aria-hidden="true"
      >
        📭
      </div>
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: '16px',
          fontWeight: 600,
          color: '#111827',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: '14px',
          color: '#6b7280',
          maxWidth: '320px',
          lineHeight: '1.5',
        }}
      >
        {description}
      </p>
    </div>
  );
}
