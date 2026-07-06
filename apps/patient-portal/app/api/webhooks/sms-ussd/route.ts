import { NextResponse } from 'next/server';

/**
 * @deprecated SMS/USSD service was removed as part of the 9-wave migration.
 * This endpoint now returns a placeholder response.
 * See MIGRATION_PLAN.md Wave 9 for details.
 */
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

    // Placeholder: SmsUssdService was removed in Wave 9 migration.
    return NextResponse.json({ ok: true, reply: 'Service temporarily unavailable' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
