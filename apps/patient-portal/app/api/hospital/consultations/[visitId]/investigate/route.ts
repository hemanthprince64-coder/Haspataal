import { withAuth } from '@haspataal/auth';
import { ROLES } from '@haspataal/auth';
import { RequestInvestigationUseCase } from '@haspataal/consultation';

import { NextRequest, NextResponse } from 'next/server';

const useCase = new RequestInvestigationUseCase();

export const POST = withAuth(
  async (req: NextRequest, { params }: { params: { visitId: string } }, session: any) => {
    try {
      const visitId = params.visitId;
      const doctorId = session.user.id;
      const { requests } = await req.json();

      if (session.user.role !== ROLES.DOCTOR) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (!requests || !Array.isArray(requests)) {
        return NextResponse.json({ error: 'Investigation requests are required' }, { status: 400 });
      }

      const note = await useCase.execute(visitId, doctorId, requests);

      return NextResponse.json({ success: true, note });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 },
      );
    }
  },
);
