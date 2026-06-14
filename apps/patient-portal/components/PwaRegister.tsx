'use client';

import { useEffect } from 'react';
import { initSyncManager } from '@/lib/infrastructure/sync-manager';

export default function PwaRegister() {
  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered successfully:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    }

    // Initialize Auto-Sync Manager
    initSyncManager();
  }, []);

  return null;
}
