import { NextResponse } from 'next/server';

import { SmsUssdService } from '@/lib/services/sms-ussd';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let payload: any = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        payload[key] = value;
      });
    } else {
      payload = await request.json();
    }

    const from = payload.From || payload.from || payload.sender || payload.mobile;
    const body = payload.Body || payload.body || payload.message || payload.text || '';

    if (!from) {
      return NextResponse.json(
        { error: 'Missing sender number (from/sender/mobile)' },
        { status: 400 },
      );
    }

    const responseText = await SmsUssdService.handleIncomingSMS(from, body);
    return NextResponse.json({ ok: true, reply: responseText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
