import { NextResponse } from 'next/server';
import { prisma } from '@/lib/util/prisma-singleton';
import { runDHIS2Reporting } from '@/lib/workers/dhis2.worker';
import { generatePMJAYClaim } from '@/lib/services/pmjay';

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: '/api/hospital/anc/export', methods: ['POST'] });
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'dhis2' | 'pmjay'
    const body = await req.json();
    const { patientId, hospitalId, startDate, endDate } = body;

    if (!hospitalId) {
      return NextResponse.json({ error: 'hospitalId is required' }, { status: 400 });
    }

    if (type === 'dhis2') {
      const d = startDate ? new Date(startDate) : new Date();
      await runDHIS2Reporting(d);
      return NextResponse.json({ success: true, message: 'DHIS2 report exported to public/reports/', type: 'dhis2' });
    }

    if (type === 'pmjay') {
      const visitId = patientId ? `anc-${patientId}-${Date.now()}` : `anc-${Date.now()}`;
      const claim = await generatePMJAYClaim(visitId);
      return NextResponse.json({ success: true, claim, type: 'pmjay' });
    }

    return NextResponse.json({ error: `Unsupported export type: ${type}` }, { status: 400 });
  } catch (err) {
    console.error('[ANC Export] Error:', err);
    return NextResponse.json({ error: 'Export failed', detail: String(err) }, { status: 500 });
  }
}
