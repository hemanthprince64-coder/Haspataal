/* eslint-disable */
/**
 * Client-Side Offline Database & Outbox utilizing HTML5 IndexedDB
 */

const DB_NAME = 'haspataal-offline-db';
const DB_VERSION = 3;

export interface OutboxMutation {
  id: string;
  type: string; // e.g., 'CREATE_PATIENT', 'BOOK_APPOINTMENT', 'DISPENSE_DRUG'
  payload: any;
  timestamp: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  error?: string;
}

export function getOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      // Define local entity stores
      const stores = [
        'patients',
        'appointments',
        'visits',
        'careJourneys',
        'observations',
        'beds',
        'drugStock',
        'invoices',
        'pregnancyProfiles',
        'ancVisits',
        'ancSupplementLogs',
        'obstetricHistory',
        'mcpCards',
        'ancRetentionAlerts',
        'doctors',
        'hospitals',
        'bookmarkedDoctors',
        'consultantSettlements',
      ];

      for (const store of stores) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      }

      // Sync Outbox store
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic Store CRUD
export async function saveOfflineItem(storeName: string, item: any): Promise<void> {
  const db = await getOfflineDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineItem<T = any>(storeName: string, id: string): Promise<T | null> {
  const db = await getOfflineDB();
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOfflineItems<T = any>(storeName: string): Promise<T[]> {
  const db = await getOfflineDB();
  return new Promise<T[]>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteOfflineItem(storeName: string, id: string): Promise<void> {
  const db = await getOfflineDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Outbox Operations
export async function queueMutation(type: string, payload: any): Promise<OutboxMutation> {
  const mutation: OutboxMutation = {
    id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    payload,
    timestamp: Date.now(),
    status: 'PENDING',
  };

  const db = await getOfflineDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    const request = store.put(mutation);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  console.log(`[OfflineDB] Queued mutation ${mutation.id} (${type})`);
  return mutation;
}

export async function getPendingMutations(): Promise<OutboxMutation[]> {
  const db = await getOfflineDB();
  return new Promise<OutboxMutation[]>((resolve, reject) => {
    const tx = db.transaction('outbox', 'readonly');
    const store = tx.objectStore('outbox');
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result || [];
      // Sort chronologically
      resolve(all.sort((a: any, b: any) => a.timestamp - b.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateMutationStatus(
  id: string,
  status: 'PENDING' | 'SYNCING' | 'FAILED',
  error?: string
): Promise<void> {
  const db = await getOfflineDB();
  const mutation = await new Promise<OutboxMutation | null>((resolve, reject) => {
    const tx = db.transaction('outbox', 'readonly');
    const store = tx.objectStore('outbox');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });

  if (!mutation) return;

  mutation.status = status;
  if (error) mutation.error = error;

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    const request = store.put(mutation);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function removeMutation(id: string): Promise<void> {
  const db = await getOfflineDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Marketplace caching and bookmark helpers
export async function cacheDoctors(doctors: any[]): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction('doctors', 'readwrite');
  const store = tx.objectStore('doctors');
  // Clear old cache and insert new
  store.clear();
  for (const doc of doctors) {
    store.put(doc);
  }
}

export async function getCachedDoctors(): Promise<any[]> {
  return getAllOfflineItems('doctors');
}

export async function toggleDoctorBookmark(doctor: any): Promise<boolean> {
  const db = await getOfflineDB();
  const isBookmarked = await getOfflineItem('bookmarkedDoctors', doctor.id);
  const tx = db.transaction('bookmarkedDoctors', 'readwrite');
  const store = tx.objectStore('bookmarkedDoctors');
  if (isBookmarked) {
    store.delete(doctor.id);
    return false; // Removed
  } else {
    store.put(doctor);
    return true; // Added
  }
}

export async function getBookmarkedDoctors(): Promise<any[]> {
  return getAllOfflineItems('bookmarkedDoctors');
}

