import { withAuth } from '@haspataal/auth';
import { ROLES } from '@haspataal/auth';
import { CheckInUseCase } from '@haspataal/consultation';

import { NextRequest, NextResponse } from 'next/server';

const checkInUseCase = new CheckInUseCase();

export const POST = withAuth(
  async (req: NextRequest, { params }: { params: { visitId: string } }, session: any) => {
    try {
      const appointmentId = params.visitId;
      const actorId = session.user.id;
      const hospitalId = session.user.hospitalId;

      if (!hospitalId) {
        return NextResponse.json({ error: 'Hospital ID is required' }, { status: 400 });
      }

      if (![ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.NURSE].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized to perform check-in' }, { status: 403 });
      }

      const result = await checkInUseCase.execute(appointmentId, actorId, hospitalId);

      return NextResponse.json({
        success: true,
        visit: result.visit,
        appointment: result.appointment,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 },
      );
    }
  },
);
