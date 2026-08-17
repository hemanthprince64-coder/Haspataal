/* eslint-disable */
/**
 * Offline RBAC Caching Utility using IndexedDB (Phase 1 local client auth)
 */
const DB_NAME = 'haspataal-auth-cache';
const DB_VERSION = 1;
const STORE_NAME = 'permissions';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function cachePermissionsOffline(
  userId: string,
  role: string,
  hospitalId: string,
  permissions: any[]
): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const putRequest = store.put({
        key: 'current_user',
        userId,
        role,
        hospitalId,
        permissions,
        cachedAt: Date.now(),
      });
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
    console.log('[OfflineRBAC] Successfully cached permissions in IndexedDB');
  } catch (err) {
    console.error('[OfflineRBAC] Failed to cache permissions in IndexedDB:', err);
  }
}

export async function checkPermissionOffline(
  module: string,
  action: string = 'read'
): Promise<boolean> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const cached = await new Promise<any>((resolve, reject) => {
      const getRequest = store.get('current_user');
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    });

    if (!cached) return false;

    // Role-module mapping matching requireHospitalAccess
    const ROLE_MODULES: Record<string, string[]> = {
      SUPER_ADMIN: ['admin', 'setup', 'opd', 'ipd', 'billing', 'pharmacy', 'diagnostics', 'notifications', 'retention', 'marketplace', 'integrations', 'staff'],
      HOSPITAL_ADMIN: ['admin', 'setup', 'opd', 'ipd', 'billing', 'pharmacy', 'diagnostics', 'notifications', 'retention', 'marketplace', 'integrations', 'staff'],
      DOCTOR: ['opd', 'ipd', 'diagnostics', 'notifications', 'retention'],
      RECEPTIONIST: ['opd', 'ipd', 'billing', 'notifications'],
      BILLING: ['billing', 'opd', 'ipd'],
      PHARMACIST: ['pharmacy', 'billing'],
      LAB_TECH: ['diagnostics', 'notifications'],
      NURSE: ['opd', 'ipd', 'diagnostics'],
      STAFF: ['opd'],
    };

    const defaultAllowed = ROLE_MODULES[cached.role]?.includes(module) ?? false;
    if (!defaultAllowed) return false;

    // Check permission overrides stored from server
    if (cached.permissions && Array.isArray(cached.permissions)) {
      const override = cached.permissions.find(
        (p: any) => p.module === module && p.action === action
      );
      if (override) {
        return !!override.allowed;
      }
    }

    return true;
  } catch (err) {
    console.error('[OfflineRBAC] Offline permission check failed, defaulting to false:', err);
    return false;
  }
}
