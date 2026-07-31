import { withAuth } from '@haspataal/auth';
import { ROLES } from '@haspataal/auth';
import { StartConsultationUseCase } from '@haspataal/consultation';

import { NextRequest, NextResponse } from 'next/server';

const useCase = new StartConsultationUseCase();

export const POST = withAuth(
  async (req: NextRequest, { params }: { params: { visitId: string } }, session: any) => {
    try {
      const visitId = params.visitId;
      const actorId = session.user.id;
      const hospitalId = session.user.hospitalId;

      if (!hospitalId) {
        return NextResponse.json({ error: 'Hospital ID is required' }, { status: 400 });
      }

      if (session.user.role !== ROLES.DOCTOR) {
        return NextResponse.json({ error: 'Unauthorized to start consultation' }, { status: 403 });
      }

      const result = await useCase.execute(visitId, actorId, hospitalId);

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
