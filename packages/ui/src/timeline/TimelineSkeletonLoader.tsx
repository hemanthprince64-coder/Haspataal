'use client';

import React from 'react';

export function TimelineSkeletonLoader() {
  const skeletons = Array.from({ length: 3 });

  return (
    <div
      aria-hidden="true"
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}
    >
      {skeletons.map((_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: '12px',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            height: '100px',
            animation: 'timeline-pulse 1.5s infinite ease-in-out',
          }}
        >
          {/* Icon Placeholder */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#f3f4f6',
              flexShrink: 0,
            }}
          />
          {/* Content Placeholders */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            <div
              style={{ width: '40%', height: '14px', background: '#f3f4f6', borderRadius: '4px' }}
            />
            <div
              style={{ width: '70%', height: '12px', background: '#f3f4f6', borderRadius: '4px' }}
            />
            <div
              style={{ width: '20%', height: '10px', background: '#f3f4f6', borderRadius: '4px' }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes timeline-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
