import { withAuth } from '@haspataal/auth';
import { ROLES } from '@haspataal/auth';
import { ScheduleFollowUpUseCase } from '@haspataal/consultation';

import { NextRequest, NextResponse } from 'next/server';

const useCase = new ScheduleFollowUpUseCase();

export const POST = withAuth(
  async (req: NextRequest, { params }: { params: { visitId: string } }, session: any) => {
    try {
      const visitId = params.visitId;
      const doctorId = session.user.id;
      const input = await req.json();

      if (session.user.role !== ROLES.DOCTOR) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (!input || !input.instructions) {
        return NextResponse.json({ error: 'Instructions are required' }, { status: 400 });
      }

      const note = await useCase.execute(visitId, doctorId, input);

      return NextResponse.json({ success: true, note });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 },
      );
    }
  },
);
