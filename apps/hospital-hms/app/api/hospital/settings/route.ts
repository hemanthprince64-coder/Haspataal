import { ConfigEngine, ConfigCommandHandler, ConfigQueryHandler } from '@haspataal/config';
import { NextResponse } from 'next/server';
import { checkRole, Roles } from '@/lib/auth/roleGuard';
import { createPlatformQueryContext } from '@/lib/platform';
import { v4 as uuidv4 } from 'uuid';

const configEngine = new ConfigEngine();
const queryHandler = new ConfigQueryHandler(configEngine);
const commandHandler = new ConfigCommandHandler(configEngine);

/**
 * GET /api/hospital/settings?type=hospital|opd|billing
 * Returns the configuration for the authenticated hospital.
 */
export async function GET(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.SUPER_ADMIN]);

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;
    platformContext.actorScope.actorId = user.user_id;

    const { searchParams } = new URL(req.url);
    const configType = searchParams.get('type');

    const platformQuery = {
      ...platformContext,
      filters: {},
    };

    let result;
    if (configType === 'opd') {
      result = await queryHandler.handleGetOpdConfig(platformQuery as any);
    } else if (configType === 'billing') {
      result = await queryHandler.handleGetBillingProfile(platformQuery as any);
    } else {
      // Default: return main hospital config
      result = await queryHandler.handleGetHospitalConfig(platformQuery as any);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/hospital/settings
 * Body: { type: 'hospital' | 'opd' | 'billing', payload: {...} }
 * Updates the configuration for the authenticated hospital.
 */
export async function POST(req: Request) {
  try {
    const user = await checkRole(req, [Roles.ADMIN, Roles.SUPER_ADMIN]);
    const body = await req.json();

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = user.hospital_id;
    platformContext.actorScope.actorId = user.user_id;

    const { type: configType, payload } = body;

    if (!configType || !payload) {
      return NextResponse.json({ error: 'Config type and payload required' }, { status: 400 });
    }

    const command = {
      commandId: uuidv4(),
      commandVersion: 1,
      target: 'config',
      tenantContext: platformContext.tenantScope,
      actorContext: platformContext.actorScope,
      correlationId: platformContext.correlationId,
      idempotencyKey: `update-config-${configType}-${user.hospital_id}-${uuidv4()}`,
      timestamp: new Date(),
      payload,
    };

    let result;
    if (configType === 'opd') {
      result = await commandHandler.handleUpdateOpdConfig(command as any);
    } else if (configType === 'billing') {
      result = await commandHandler.handleUpdateBillingProfile(command as any);
    } else {
      result = await commandHandler.handleUpdateHospitalConfig(command as any);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
