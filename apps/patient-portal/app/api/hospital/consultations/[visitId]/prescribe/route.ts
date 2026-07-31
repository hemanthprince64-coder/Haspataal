import { withAuth } from '@haspataal/auth';
import { ROLES } from '@haspataal/auth';
import { PrescribeMedicationUseCase } from '@haspataal/consultation';

import { NextRequest, NextResponse } from 'next/server';

const useCase = new PrescribeMedicationUseCase();

export const POST = withAuth(
  async (req: NextRequest, { params }: { params: { visitId: string } }, session: any) => {
    try {
      const visitId = params.visitId;
      const doctorId = session.user.id;
      const { items } = await req.json();

      if (session.user.role !== ROLES.DOCTOR) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (!items || !Array.isArray(items)) {
        return NextResponse.json({ error: 'Medication items are required' }, { status: 400 });
      }

      const prescription = await useCase.execute(visitId, doctorId, items);

      return NextResponse.json({ success: true, prescription });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 },
      );
    }
  },
);
