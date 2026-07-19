import { requirePlatformRole } from '@haspataal/auth';

import { NextResponse } from 'next/server';

// import { NetworkOperationsService } from "@haspataal/hospital-hms/lib/services/cross-tenant-service";

export async function GET(request: Request) {
  try {
    const user = await requirePlatformRole(['PLATFORM_ADMIN', 'NETWORK_ADMIN']);

    // MVP: return dummy list. Later:
    // const { searchParams } = new URL(request.url);
    // const status = searchParams.get("status");
    // const hospitals = await NetworkOperationsService.listHospitals(user.networkId, status);

    return NextResponse.json({ hospitals: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requirePlatformRole(['PLATFORM_ADMIN']);

    // const data = await request.json();
    // const hospital = await NetworkOperationsService.createHospital(data);
    // EventBus.getInstance().publish({ type: 'hospital_created', payload: { hospitalId: hospital.id } });

    return NextResponse.json({ success: true, message: 'MVP mockup' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
