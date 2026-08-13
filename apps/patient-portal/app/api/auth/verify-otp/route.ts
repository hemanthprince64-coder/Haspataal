import { OtpService, OtpPurpose, VerifyOtpRequest } from '@haspataal/auth';
import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import logger from '@/lib/logger';

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
  purpose: z.nativeEnum(OtpPurpose),
  tenantId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.parse(body);

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const request: VerifyOtpRequest = {
      ...parsed,
      ipAddress,
      userAgent,
    };

    const result = await OtpService.verifyOtp(request);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    // TODO: Issue JWT upon successful transaction (Sprint 3 integration)
    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload', errors: error.issues },
        { status: 400 },
      );
    }
    logger.error({ err: error }, 'Verify OTP Error');
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
