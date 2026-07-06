import { NextResponse } from 'next/server';

/**
 * @deprecated USSD service was removed as part of the 9-wave migration.
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

    // Telco USSD specifications: sessionId, phoneNumber, text, serviceCode
    const sessionId = payload.sessionId || '';
    const phoneNumber = payload.phoneNumber || payload.phone || '';
    const text = payload.text || '';
    const serviceCode = payload.serviceCode || '*321#';

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Missing phoneNumber' }, { status: 400 });
    }

    const reply = 'Service temporarily unavailable';

    // Most USSD gateways require pure text response with status code 200
    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      request.headers.get('accept')?.includes('text/plain')
    ) {
      return new Response(reply, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
