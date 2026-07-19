'use client';

import { WifiOff, RefreshCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import React, { useEffect, useState } from 'react';

import { syncQueue, OfflineAction } from '@/lib/offline/sync-queue';

export default function SyncStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        toast.success('Internet connection restored. Syncing pending data...');
        triggerSync();
      };
      const handleOffline = () => {
        setIsOnline(false);
        toast.error('Internet connection lost. Working in offline mode.');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Initial count check
      refreshCount();
      // Poll every 10 seconds just in case
      const interval = setInterval(refreshCount, 10000);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    }
  }, []);

  const refreshCount = async () => {
    try {
      const all = await syncQueue.getAll();
      setPendingCount(all.length);
    } catch (e) {
      console.error('Failed to get sync queue count', e);
    }
  };

  const triggerSync = async () => {
    if (!navigator.onLine) {
      toast.error('Cannot sync while offline.');
      return;
    }
    setIsSyncing(true);
    try {
      const all = await syncQueue.getAll();
      if (all.length === 0) {
        setIsSyncing(false);
        return;
      }

      let successCount = 0;
      for (const action of all) {
        try {
          const res = await fetch(action.url, {
            method: action.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload),
          });
          if (res.ok) {
            await syncQueue.remove(action.id);
            successCount++;
          } else {
            await syncQueue.incrementRetry(action.id);
          }
        } catch (err) {
          await syncQueue.incrementRetry(action.id);
        }
      }
      if (successCount > 0) {
        toast.success(`Successfully synced ${successCount} items.`);
      }
    } finally {
      setIsSyncing(false);
      refreshCount();
    }
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-all ${!isOnline ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}
    >
      {!isOnline ? (
        <WifiOff className="w-4 h-4 animate-pulse" />
      ) : pendingCount > 0 ? (
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      )}

      <span>
        {!isOnline ? 'Offline Mode' : 'Online'}
        {pendingCount > 0 && ` • ${pendingCount} pending`}
      </span>

      {pendingCount > 0 && isOnline && (
        <button
          onClick={triggerSync}
          disabled={isSyncing}
          className="ml-2 bg-white/50 hover:bg-white/80 p-1.5 rounded-full transition-colors disabled:opacity-50"
          title="Sync Now"
        >
          <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
}
