import { requirePlatformRole } from '@haspataal/auth';

import { NextResponse } from 'next/server';

// Note: MVP implementation. Need to connect to actual cross-tenant service.

export async function GET() {
  try {
    await requirePlatformRole(['PLATFORM_ADMIN']);

    // Dummy data for MVP. Later replace with real NetworkOperationsService aggregate calls
    const kpis = {
      totalHospitals: 1248,
      activeSubscriptions: 1102,
      platformUsers: 45231,
      activeIncidents: 3,
    };

    return NextResponse.json({ kpis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
