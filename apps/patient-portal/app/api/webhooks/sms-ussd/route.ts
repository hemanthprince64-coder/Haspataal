import { NextResponse } from 'next/server';

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

    // Minimal stub until full webhook wiring is restored.
    return NextResponse.json({ ok: true, received: payload });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
