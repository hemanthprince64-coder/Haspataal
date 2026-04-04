import { Prisma } from '@prisma/client';
import { prisma } from '../util/prisma-singleton';
import { acquireDistributedLock } from './redlock';
import { withRetry } from '../util/safe-transaction';

/**
 * Smart Slot Booking Engine
 * ─── Layers of protection ───────────────────────────────────────────────
 *  1. Redlock (distributed) → prevents duplicate processing across nodes
 *  2. SERIALIZABLE transaction → prevents phantom reads & race conditions
 *  3. SELECT FOR UPDATE → row-level lock on the specific slot
 *  4. Idempotency key → prevents duplicate bookings from retried requests
 */
export async function bookSmartSlot(data: {
  hospitalId: string;
  doctorId: string;
  patientGlobalId: string;
  slotTime: Date;
  idempotencyKey: string;
}) {
  const { hospitalId, doctorId, patientGlobalId, slotTime, idempotencyKey } = data;

  // 1. Acquire distributed lock via Redlock (M2 Fix - replaces simple SETNX)
  const lockResource = `slot:${doctorId}:${slotTime.toISOString()}`;
  const lock = await acquireDistributedLock(lockResource, 30_000);

  if (!lock) {
    throw new Error('Conflict: Slot is currently being processed. Please retry.');
  }

  try {
    // 2. SERIALIZABLE transaction with automatic retry on conflict
    return await withRetry(async () => {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        // A. Idempotency check — prevents duplicate bookings from client retries
        const existing = await tx.appointment.findUnique({
          where: { idempotencyKey: idempotencyKey }
        });
        if (existing) return existing;

        // B. Emergency block check — doctor marked unavailable (emergency/leave)
        const isBlocked = await tx.doctorSlotBlock.findFirst({
          where: {
            doctorId: doctorId,
            blockStart: { lte: slotTime },
            blockEnd: { gte: slotTime }
          }
        });
        if (isBlocked) throw new Error('Doctor is currently unavailable (Emergency Block).');

        // C. Row-level capacity lock — SELECT FOR UPDATE on the slot record
        const [slot]: Array<{ id: string; capacity: number }> = await tx.$queryRaw`
          SELECT id, capacity FROM doctor_slots 
          WHERE doctor_id = ${doctorId}::uuid AND start_time = ${slotTime}
          FOR UPDATE
        `;
        if (!slot) throw new Error('Slot not found.');

        const currentBookings = await tx.appointment.count({
          where: {
            doctorId: doctorId,
            slotTime: slotTime,
            status: { not: 'CANCELLED' }
          }
        });

        if (currentBookings >= (slot.capacity || 1)) {
          throw new Error(`Slot is at full capacity (${slot.capacity} patients).`);
        }

        // D. Atomic booking creation
        const appointment = await tx.appointment.create({
          data: {
            hospitalId,
            doctorId,
            patientGlobalId,
            slotTime,
            idempotencyKey,
            status: 'BOOKED',
            date: slotTime,
            slot: slotTime.toISOString(),
            // patientId is required by the base Appointment model (existing app flow)
            // For smart-slot bookings, patientGlobalId acts as the patient identifier
            patientId: patientGlobalId,
          }
        });

        // E. Transactional outbox — guarantees async notification delivery
        await tx.outboxEvent.create({
          data: {
            eventType: 'APPOINTMENT_BOOKED',
            payload: {
              appointmentId: appointment.id,
              patientId: patientGlobalId,
              doctorId,
            }
          }
        });

        // F. Audit log — legal traceability, MUST be in same transaction
        await tx.auditLog.create({
          data: {
            userId: patientGlobalId,
            action: 'CREATE_APPOINTMENT',
            entity: 'appointment',
            entityId: appointment.id,
          }
        });

        return appointment;
      }, {
        isolationLevel: 'Serializable', // Prisma's correct way to set isolation level
      });
    });
  } finally {
    // Always release the Redlock — even if booking fails
    try { await lock.release(); } catch { /* lock may have already expired; safe to ignore */ }
  }
}
