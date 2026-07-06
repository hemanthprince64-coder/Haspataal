import * as crypto from 'crypto';
import { prisma } from '@haspataal/db';

import { NextResponse } from 'next/server';

import { checkRole, Roles } from '@/lib/auth/roleGuard';

async function requireRole(role: string, headerName = 'authorization') {
  const user = (await checkRole({} as Request, [role as any])) as any;
  return user;
}

export async function GET(req: Request) {
  try {
    const user = (await requireRole(Roles.DOCTOR, 'session_user')) as any;
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const visitId = searchParams.get('visitId');

    if (!patientId && !visitId) {
      return NextResponse.json({ error: 'Patient ID or Visit ID required' }, { status: 400 });
    }

    const prescriptions = await prisma.patientPrescription.findMany({
      where: patientId ? { patientId } : { appointment: { visit: { id: visitId } } },
      include: {
        items: true,
        doctor: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ prescriptions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = (await requireRole(Roles.DOCTOR, 'session_user')) as any;
    const body = await req.json();
    const { patientId, appointmentId, items, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Prescription items required' }, { status: 400 });
    }

    const prescription = await prisma.patientPrescription.create({
      data: {
        patientId: patientId || null,
        appointmentId: appointmentId || null,
        doctorId: user.id,
        notes: notes || null,
        type: 'STRUCTURED',
        items: {
          create: items.map((item: any, idx: number) => ({
            medicineName: item.drugName || item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions || item.notes,
          })),
        },
      },
      include: { items: true },
    });

    // Index for search via Outbox
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (patient) {
      await prisma.outboxEvent.create({
        data: {
          id: crypto.randomUUID(),
          eventType: 'INDEX_DOCUMENT_COMMAND',
          payload: {
            commandId: crypto.randomUUID(),
            commandVersion: 1,
            target: 'search',
            tenantContext: { hospitalId: user.hospitalId, branchId: user.branchId || 'default' },
            actorContext: { actorId: user.id, actorType: 'DOCTOR' },
            correlationId: crypto.randomUUID(),
            idempotencyKey: `index-prescription-${prescription.id}`,
            timestamp: new Date().toISOString(),
            payload: {
              entityType: 'prescription',
              entityId: prescription.id,
              hospitalId: user.hospitalId,
              title: `Prescription for ${patient.name}`,
              content: items.map((i: any) => i.drugName || i.medicineName).join(', '),
              metadata: {
                patientId,
                appointmentId,
                itemCount: items.length,
              },
            },
          },
          processed: false,
        },
      });
    }

    return NextResponse.json({ success: true, prescription });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

