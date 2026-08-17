/* eslint-disable no-console */
import { NextResponse } from 'next/server';

import { sendOtp, verifyOtp } from '@/app/api/auth/otp';
import { hashPassword } from '@/lib/auth/hash';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get('hospitalId');

    const where = hospitalId ? { affiliations: { some: { hospitalId } } } : {};

    const doctors = await prisma.doctorMaster.findMany({
      where,
      include: {
        profile: true,
        affiliations: { include: { hospital: true } },
        verification: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json({ success: true, data: doctors });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { mobile, action, otp, email, password, fullName, dob, gender, doctorId } =
      await req.json();

    // Step 1: Send OTP
    if (action === 'send_otp') {
      if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
        return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 });
      }

      await sendOtp(mobile);
      return NextResponse.json({ success: true, message: 'OTP sent' });
    }

    // Step 2: Verify OTP and create doctor account
    if (action === 'verify_otp') {
      if (!otp || !mobile) {
        return NextResponse.json({ error: 'Missing OTP or mobile' }, { status: 400 });
      }

      const isValid = await verifyOtp(mobile, otp);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
      }

      // Create DoctorMaster with DRAFT status
      const existingDoctor = await prisma.doctorMaster.findUnique({
        where: { mobile },
      });

      let doctor;
      if (existingDoctor) {
        doctor = existingDoctor;
      } else {
        doctor = await prisma.doctorMaster.create({
          data: {
            fullName: fullName || 'Pending',
            mobile,
            email: email || `${mobile}@haspataal.com`,
            password: password ? await hashPassword(password) : '',
            kycStatus: 'PENDING',
            accountStatus: 'ACTIVE',
          },
        });
      }

      // Create initial verification record
      const verification = await prisma.doctorVerification.upsert({
        where: { doctorId: doctor.id },
        create: {
          doctorId: doctor.id,
          status: 'DOCUMENT_PENDING',
        },
        update: {
          status: 'DOCUMENT_PENDING',
          verifiedAt: null,
          rejectionReason: null,
        },
      });

      // Audit log using Prisma
      await prisma.auditLog.create({
        data: {
          userId: doctor.id,
          action: 'DOCTOR_REGISTER',
          entity: 'doctor',
          entityId: doctor.id,
        },
      });

      return NextResponse.json({
        success: true,
        doctorId: doctor.id,
        verificationStatus: verification.status,
      });
    }

    // Step 3: Update profile
    if (action === 'update_profile') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Verify token and get doctor
      // ... implementation would verify JWT ...

      if (!doctorId) {
        return NextResponse.json({ error: 'Missing doctorId' }, { status: 400 });
      }

      const profile = await prisma.doctorProfile.upsert({
        where: { doctorId },
        create: {
          doctorId,
          firstName: fullName?.split(' ')[0] || '',
          lastName: fullName?.split(' ').slice(1).join(' ') || '',
          gender,
          dob: dob ? new Date(dob) : undefined,
        },
        update: {
          firstName: fullName?.split(' ')[0] || '',
          lastName: fullName?.split(' ').slice(1).join(' ') || '',
          gender,
          dob: dob ? new Date(dob) : undefined,
        },
      });

      return NextResponse.json({ success: true, profile });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Doctor registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
