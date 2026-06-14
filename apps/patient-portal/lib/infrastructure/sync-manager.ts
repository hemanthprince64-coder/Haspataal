'use client';

import { toast } from 'sonner';
import {
  getPendingMutations,
  removeMutation,
  updateMutationStatus,
  OutboxMutation,
} from './offline-db';

let isSyncing = false;

/**
 * Replays all pending offline mutations to the server API
 */
export async function replayOfflineMutations(): Promise<void> {
  if (isSyncing) return;
  if (typeof window === 'undefined') return;

  // Verify connection
  if (!navigator.onLine) {
    console.log('[SyncManager] Browser is offline. Deferring sync.');
    return;
  }

  const pending = await getPendingMutations();
  if (pending.length === 0) {
    return;
  }

  isSyncing = true;
  const toastId = toast.loading(`Synchronizing ${pending.length} offline entry/entries...`);
  console.log(`[SyncManager] Beginning sync replay for ${pending.length} mutations`);

  try {
    // Mark all as syncing
    for (const mut of pending) {
      await updateMutationStatus(mut.id, 'SYNCING');
    }

    const response = await fetch('/api/sync/replay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mutations: pending }),
    });

    if (!response.ok) {
      throw new Error(`Sync API returned status: ${response.status}`);
    }

    const { results } = await response.json();
    let successCount = 0;
    let conflictCount = 0;
    let failCount = 0;

    for (const res of results) {
      if (res.status === 'SUCCESS') {
        await removeMutation(res.id);
        successCount++;
      } else if (res.status === 'CONFLICT') {
        // Conflicts are resolved (LWW skipped/reconciled), safe to remove from outbox
        await removeMutation(res.id);
        conflictCount++;
        console.warn(`[SyncManager] Mutation resolved with conflict: ${res.id} - ${res.error}`);
      } else {
        await updateMutationStatus(res.id, 'FAILED', res.error);
        failCount++;
        console.error(`[SyncManager] Mutation failed to sync: ${res.id} - ${res.error}`);
      }
    }

    if (failCount > 0) {
      toast.error(`Sync partially completed: ${successCount} synced, ${failCount} failed.`, {
        id: toastId,
        duration: 5000,
      });
    } else if (conflictCount > 0) {
      toast.success(`Sync complete: ${successCount} synced, ${conflictCount} conflicts resolved.`, {
        id: toastId,
        duration: 4000,
      });
    } else {
      toast.success(`All ${successCount} offline records synced successfully!`, {
        id: toastId,
        duration: 3000,
      });
    }
  } catch (err: any) {
    console.error('[SyncManager] Sync execution error:', err);
    
    // Reset status to PENDING for retry
    for (const mut of pending) {
      await updateMutationStatus(mut.id, 'PENDING');
    }

    toast.error(`Reconnection sync failed: ${err.message || 'Server unreachable'}. Will retry.`, {
      id: toastId,
      duration: 5000,
    });
  } finally {
    isSyncing = false;
  }
}

/**
 * Initializes listeners to trigger auto-sync on network reconnect
 */
export function initSyncManager() {
  if (typeof window === 'undefined') return;

  // Replay when coming online
  window.addEventListener('online', () => {
    console.log('[SyncManager] Connection restored. Triggering sync.');
    toast.info('Network connection restored. Syncing data...');
    replayOfflineMutations();
  });

  // Replay periodically every 30 seconds
  setInterval(() => {
    if (navigator.onLine && !isSyncing) {
      replayOfflineMutations();
    }
  }, 30000);

  // Initial run
  if (navigator.onLine) {
    replayOfflineMutations();
  }
}
