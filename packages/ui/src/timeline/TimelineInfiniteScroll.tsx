'use client';

import React, { useEffect, useRef } from 'react';

export interface TimelineInfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

export function TimelineInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  children,
}: Readonly<TimelineInfiniteScrollProps>) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [onLoadMore, hasMore, isLoading]);

  return (
    <div
      role="feed"
      aria-busy={isLoading}
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      {children}

      {hasMore && (
        <div
          ref={loaderRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '16px',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          {isLoading ? 'Loading more events...' : 'Scroll down to load more'}
        </div>
      )}
    </div>
  );
}
