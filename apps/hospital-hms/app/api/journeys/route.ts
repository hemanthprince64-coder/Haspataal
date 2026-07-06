import { JourneyQueryHandler, JourneyCommandHandler } from '@haspataal/journey';
import { NextResponse } from 'next/server';
import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { createPlatformQueryContext } from '@/lib/platform';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR]);
    const body = await req.json();

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;
    platformContext.actorScope.actorId = user.user_id;

    const command = {
      commandId: uuidv4(),
      commandVersion: 1,
      target: 'journey',
      tenantContext: platformContext.tenantScope,
      actorContext: platformContext.actorScope,
      correlationId: platformContext.correlationId,
      idempotencyKey: `start-journey-${uuidv4()}`,
      timestamp: new Date().toISOString(),
      payload: {
        templateId: body.templateId,
        patientId: body.patientId,
        hospitalId: user.hospital_id,
        careTeam: body.careTeam,
      },
    };

    const handler = new JourneyCommandHandler();
    // This synchronously enrolls and queues downstream outbox events
    await handler.handleStartJourney(command);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message?.startsWith('Forbidden') || err.message?.startsWith('Unauthorized')) {
      return NextResponse.json(
        { error: err.message },
        { status: err.message.startsWith('Unauthorized') ? 401 : 403 },
      );
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.PATIENT]);
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'patientId required' }, { status: 400 });
    }

    const platformContext = await createPlatformQueryContext(req);
    // Secure the query to the user's hospital
    if (user.hospital_id) {
        platformContext.tenantScope.hospitalId = user.hospital_id;
    }

    const query = {
      ...platformContext,
      filters: { patientId },
    };

    const journeys = await JourneyQueryHandler.getPatientJourneys(query);
    return NextResponse.json({ success: true, data: journeys });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
