import { NextRequest, NextResponse } from 'next/server';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { provider, config } = await req.json();

  // In production, actually test the gateway connection
  // For now, simulate with basic validation
  if (provider === 'RAZORPAY') {
    if (!config['Key ID'] || !config['Key Secret']) {
      return NextResponse.json({ ok: false, error: 'Missing Razorpay credentials' });
    }
    // Would make a real API call to Razorpay here
    return NextResponse.json({ ok: true, message: 'Razorpay credentials accepted (test mode)' });
  }

  if (provider === 'STRIPE') {
    if (!config['Publishable Key'] || !config['Secret Key']) {
      return NextResponse.json({ ok: false, error: 'Missing Stripe credentials' });
    }
    return NextResponse.json({ ok: true, message: 'Stripe credentials accepted (test mode)' });
  }

  if (provider === 'UPI') {
    if (!config['VPA Address']) {
      return NextResponse.json({ ok: false, error: 'Missing UPI VPA' });
    }
    return NextResponse.json({ ok: true, message: 'UPI VPA accepted' });
  }

  return NextResponse.json({ ok: false, error: 'Unknown provider' }, { status: 400 });
}
