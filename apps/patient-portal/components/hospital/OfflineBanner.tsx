'use client';

import { WifiOff } from 'lucide-react';

import { useState, useEffect } from 'react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-3 z-30 shadow-lg transform transition-transform translate-y-0 flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4 shrink-0" />
      You are currently offline. Some features may be unavailable.
    </div>
  );
}
