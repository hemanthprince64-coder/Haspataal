import { withAuth } from '@haspataal/auth';
import { ROLES } from '@haspataal/auth';
import { AddDiagnosisUseCase } from '@haspataal/consultation';

import { NextRequest, NextResponse } from 'next/server';

const useCase = new AddDiagnosisUseCase();

export const POST = withAuth(
  async (req: NextRequest, { params }: { params: { visitId: string } }, session: any) => {
    try {
      const visitId = params.visitId;
      const doctorId = session.user.id;
      const { content } = await req.json();

      if (session.user.role !== ROLES.DOCTOR) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (!content) {
        return NextResponse.json({ error: 'Diagnosis content is required' }, { status: 400 });
      }

      const note = await useCase.execute(visitId, content, doctorId);

      return NextResponse.json({ success: true, note });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 },
      );
    }
  },
);
