import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/util/prisma-singleton';

/**
 * Sync Replay API Endpoint
 * Replays offline events/mutations, applies them with LWW (Last-Write-Wins),
 * and reports synchronization success/failures.
 */
export async function POST(req: NextRequest) {
  try {
    const { mutations } = await req.json();

    if (!Array.isArray(mutations)) {
      return NextResponse.json({ error: 'Invalid mutations payload' }, { status: 400 });
    }

    const results: Array<{ id: string; status: 'SUCCESS' | 'CONFLICT' | 'FAILED'; error?: string }> = [];

    // Process each mutation sequentially to preserve chronological ordering
    for (const mut of mutations) {
      const { id, type, payload, timestamp } = mut;

      try {
        await prisma.$transaction(async (tx) => {
          switch (type) {
            case 'CREATE_PATIENT': {
              const existing = await tx.patient.findUnique({
                where: { id: payload.id },
              });

              if (existing) {
                // Conflict resolution: Last-Write-Wins (LWW)
                const existingUpdatedAt = existing.updatedAt.getTime();
                if (timestamp > existingUpdatedAt) {
                  // Offline update is newer, overwrite
                  await tx.patient.update({
                    where: { id: payload.id },
                    data: {
                      name: payload.name,
                      phone: payload.phone,
                      email: payload.email,
                      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
                      gender: payload.gender,
                      updatedAt: new Date(timestamp),
                    },
                  });
                  results.push({ id, status: 'SUCCESS' });
                } else {
                  // Server update is newer, skip and flag conflict
                  results.push({
                    id,
                    status: 'CONFLICT',
                    error: `Skip CREATE_PATIENT: Server has newer edit (Server: ${existingUpdatedAt}, Offline: ${timestamp})`,
                  });
                }
              } else {
                // Safe to create
                await tx.patient.create({
                  data: {
                    id: payload.id,
                    name: payload.name,
                    phone: payload.phone,
                    email: payload.email,
                    dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
                    gender: payload.gender,
                    createdAt: new Date(timestamp),
                    updatedAt: new Date(timestamp),
                  },
                });
                results.push({ id, status: 'SUCCESS' });
              }
              break;
            }

            case 'BOOK_APPOINTMENT': {
              const existing = await tx.appointment.findUnique({
                where: { id: payload.id },
              });

              if (existing) {
                results.push({ id, status: 'SUCCESS' }); // Already processed
                break;
              }

              // Double-booking check
              const existingConflict = await tx.appointment.findFirst({
                where: {
                  doctorId: payload.doctorId,
                  date: new Date(payload.date),
                  slot: payload.slot,
                  status: { not: 'CANCELLED' },
                },
              });

              if (existingConflict) {
                // Slot has already been booked by another online client
                results.push({
                  id,
                  status: 'CONFLICT',
                  error: `Slot is already booked online: Doctor ${payload.doctorId}, Date ${payload.date}, Slot ${payload.slot}`,
                });
                break;
              }

              // Create the appointment
              await tx.appointment.create({
                data: {
                  id: payload.id,
                  hospitalId: payload.hospitalId,
                  doctorId: payload.doctorId,
                  patientId: payload.patientId,
                  patientGlobalId: payload.patientGlobalId,
                  slotTime: payload.slotTime ? new Date(payload.slotTime) : null,
                  date: new Date(payload.date),
                  slot: payload.slot,
                  status: payload.status || 'BOOKED',
                  notes: payload.notes,
                  idempotencyKey: payload.idempotencyKey || id,
                  createdAt: new Date(timestamp),
                },
              });
              results.push({ id, status: 'SUCCESS' });
              break;
            }

            case 'CREATE_VISIT': {
              const existing = await tx.visit.findUnique({
                where: { id: payload.id },
              });

              if (existing) {
                results.push({ id, status: 'SUCCESS' });
                break;
              }

              await tx.visit.create({
                data: {
                  id: payload.id,
                  appointmentId: payload.appointmentId,
                  patientId: payload.patientId,
                  doctorId: payload.doctorId,
                  hospitalId: payload.hospitalId,
                  chiefComplaint: payload.chiefComplaint,
                  diagnosis: payload.diagnosis,
                  notes: payload.notes,
                  createdAt: new Date(timestamp),
                },
              });
              results.push({ id, status: 'SUCCESS' });
              break;
            }

            default:
              results.push({ id, status: 'FAILED', error: `Unsupported mutation type: ${type}` });
          }
        });
      } catch (err: any) {
        console.error(`[SyncReplay] Failed mutation ${id} (${type}):`, err);
        results.push({ id, status: 'FAILED', error: err.message || 'Transaction aborted' });
      }
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('[SyncReplay] Global sync error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
