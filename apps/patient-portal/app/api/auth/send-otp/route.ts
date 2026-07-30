import { OtpService, OtpPurpose, SendOtpRequest } from '@haspataal/auth';
import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import logger from '@/lib/logger';

const sendOtpSchema = z.object({
  phone: z.string().min(10),
  purpose: z.nativeEnum(OtpPurpose),
  tenantId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendOtpSchema.parse(body);

    const ipAddress = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const request: SendOtpRequest = {
      ...parsed,
      ipAddress,
      userAgent,
    };

    const result = await OtpService.sendOtp(request);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 429 }, // Defaulting to 429 for rate limits, customize if needed
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload', errors: error.errors },
        { status: 400 },
      );
    }
    logger.error({ err: error }, 'Send OTP Error');
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
