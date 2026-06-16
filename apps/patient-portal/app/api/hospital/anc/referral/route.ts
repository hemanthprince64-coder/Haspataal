import { NextResponse } from 'next/server';

import { prisma } from '@/lib/util/prisma-singleton';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pregnancyId, referralReason, referredTo, referringDoctor, isUrgent } = body;

    if (!pregnancyId || !referralReason || !referredTo || !referringDoctor) {
      return NextResponse.json({ error: 'Missing required referral fields' }, { status: 400 });
    }

    const pregnancy = await prisma.pregnancyProfile.findUnique({
      where: { id: pregnancyId },
      include: { patient: true },
    });

    if (!pregnancy) {
      return NextResponse.json({ error: 'Pregnancy profile not found' }, { status: 404 });
    }

    // Save Referral Slip
    const referral = await prisma.referralSlip.create({
      data: {
        pregnancyId,
        referralReason,
        referredTo,
        referringDoctor,
        isUrgent: !!isUrgent,
        smsSent: true, // Simulated SMS dispatch
      },
    });

    // Simulate sending SMS to patient
    console.log(
      `[SMS Notification] To: ${pregnancy.patient.phone}. Message: "Dear ${pregnancy.patient.name}, Dr. ${referringDoctor} has referred you to ${referredTo} for ${referralReason}. Please visit immediately."`,
    );

    return NextResponse.json({ success: true, referral });
  } catch (err) {
    console.error('[Referral API] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process referral', detail: String(err) },
      { status: 500 },
    );
  }
}
