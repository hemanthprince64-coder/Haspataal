import { NextRequest, NextResponse } from 'next/server';
import { AlertService } from '@haspataal/core';
import { prisma } from '@/lib/util/prisma-singleton';
import { requireHospitalAccess, hospitalAccessError } from '@/lib/auth/hospital-access';
import { AlertSeverity } from '@prisma/client';

const alertService = new AlertService(prisma as any);

export async function GET(req: NextRequest) {
  try {
    const access = await requireHospitalAccess('clinical', 'read');
    
    // RBAC: DOCTOR and NURSE have full, HOSPITAL_ADMIN is read-only (which we enforce in action endpoints)
    if (!['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'].includes(access.user.role)) {
      return NextResponse.json({ error: 'Unauthorized role for alerts' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId') || undefined;
    const statusStr = searchParams.get('status') || 'ACTIVE';
    const severityStr = searchParams.get('severity') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const validStatuses = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'ALL'];
    const status = validStatuses.includes(statusStr) ? (statusStr as any) : 'ACTIVE';
    
    const severity = severityStr ? (severityStr as AlertSeverity) : undefined;

    const alerts = await alertService.getAlerts(access.hospitalId, {
      patientId,
      status,
      severity,
      limit,
      offset
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Alerts GET Error:', error);
    return hospitalAccessError(error);
  }
}
