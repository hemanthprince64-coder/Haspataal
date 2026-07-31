import { withAuth } from '@haspataal/auth';
import { ROLES } from '@haspataal/auth';
import { CompleteConsultationUseCase } from '@haspataal/consultation';

import { NextRequest, NextResponse } from 'next/server';

const useCase = new CompleteConsultationUseCase();

export const POST = withAuth(
  async (req: NextRequest, { params }: { params: { visitId: string } }, session: any) => {
    try {
      const visitId = params.visitId;
      const doctorId = session.user.id;

      if (session.user.role !== ROLES.DOCTOR) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const result = await useCase.execute(visitId, doctorId);

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
