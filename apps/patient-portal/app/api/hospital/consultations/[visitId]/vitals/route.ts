import { withAuth } from '@haspataal/auth';
import { RecordVitalsUseCase } from '@haspataal/consultation';

import { NextRequest, NextResponse } from 'next/server';

const useCase = new RecordVitalsUseCase();

export const POST = withAuth(
  async (req: NextRequest, { params }: { params: { visitId: string } }, session: any) => {
    try {
      const visitId = params.visitId;
      const actorId = session.user.id;
      const body = await req.json();

      const result = await useCase.execute(visitId, actorId, body);

      return NextResponse.json({ success: true, vitalRecord: result });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 },
      );
    }
  },
);
