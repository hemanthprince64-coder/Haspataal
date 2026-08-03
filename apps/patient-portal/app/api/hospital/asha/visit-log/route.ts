/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';

import { validateAshaPin, matchAshaToPatient, formatVisitLogForSms } from '@/features/anc/lib/asha';
import { requireRole } from '@/lib/auth/requireRole';
import logger from '@/lib/logger';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole('STAFF' as any, 'session').catch(() => null);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ashaId, pin, patientId, ...visitData } = body;

    if (!ashaId || !pin) {
      return NextResponse.json({ error: 'ASHA ID and PIN required' }, { status: 400 });
    }

    // In production, validate against stored ASHA credentials
    const isValid = validateAshaPin(ashaId, pin);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid ASHA PIN' }, { status: 401 });
    }

    const visit = await prisma.eventLog.create({
      data: {
        eventType: 'ASHA_HOME_VISIT',
        payload: {
          ashaId,
          patientId,
          visitDate: visitData.visitDate,
          vitals: visitData.vitals,
          symptoms: visitData.symptoms,
          adviceGiven: visitData.adviceGiven,
          ifaGiven: visitData.ifaGiven,
          ttGiven: visitData.ttGiven,
          notes: visitData.notes,
        } as any,
        hospitalId: session.hospitalId,
        patientId,
      },
    });

    // Queue SMS notification to ANM/block coordinator
    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { name: true },
      });
      if (patient) {
        // TODO: call NotificationService.send(smsText) via notification queue
        logger.info({ action: 'asha_visit_sms_queued', visitId: visit.id, patientId });
      }
    }

    return NextResponse.json({ success: true, visitId: visit.id });
  } catch (error: any) {
    console.error('ASHA visit log error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
