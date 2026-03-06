/**
 * Haspataal Backend Strengthening: Distributed Locking Utility
 * Use this to prevent race conditions during appointment bookings.
 */

import { Redis } from 'ioredis'; // Hypothetical import, user would need to install ioredis

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Acquire a lock for a specific slot.
 * @param doctorId - ID of the doctor
 * @param slotId - ID/Timestamp of the slot
 * @param ttlMs - Time to live for the lock (default 5000ms)
 * @returns boolean - true if lock acquired, false otherwise
 */
export async function acquireSlotLock(doctorId: string, slotId: string, ttlMs: number = 5000): Promise<boolean> {
    const lockKey = `lock:slot:${doctorId}:${slotId}`;

    // NX: Set if Not Exists, PX: Expire in ttlMs
    // This ensures only one process can hold the lock for this specific slot.
    const result = await redis.set(lockKey, 'locked', 'NX', 'PX', ttlMs);

    return result === 'OK';
}

/**
 * Release the lock manually (optional, locks expire anyway).
 */
export async function releaseSlotLock(doctorId: string, slotId: string): Promise<void> {
    const lockKey = `lock:slot:${doctorId}:${slotId}`;
    await redis.del(lockKey);
}

/**
 * Example Usage in AppointmentService:
 * 
 * const hasLock = await acquireSlotLock(doctorId, slotTime);
 * if (!hasLock) {
 *    throw new Error("This slot is being booked by another user. Please try again in a few seconds.");
 * }
 * 
 * try {
 *    // 1. Double check DB availability
 *    // 2. Create Appointment
 *    // 3. Commit Transaction
 * } finally {
 *    await releaseSlotLock(doctorId, slotTime);
 * }
 */
