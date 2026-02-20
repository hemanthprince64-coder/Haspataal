import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth/hash';
import { generateToken } from '@/lib/auth/jwt';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { hospital_name, mobile, password, city } = await req.json();

        if (!hospital_name || !mobile || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create hospital via Prisma
        // Required fields: legalName, registrationNumber
        const mockRegNumber = `REG-${Date.now()}`;
        const hospital = await prisma.hospital.create({
            data: {
                legalName: hospital_name,
                displayName: hospital_name,
                registrationNumber: mockRegNumber,
                city: city || 'Unknown',
            }
        });

        if (!hospital) {
            return NextResponse.json({ error: 'Failed to create hospital' }, { status: 500 });
        }

        // 2. Hash password
        const password_hash = await hashPassword(password);

        // 3. Create Admin User
        // Prisma Schema has `HospitalAdmin` and `Staff` tables, but also `User` based on previous migrations.
        // Let's create `HospitalAdmin` and link it based on the schema mapping above.
        const adminUser = await prisma.hospitalAdmin.create({
            data: {
                hospitalId: hospital.id,
                fullName: 'Hospital Admin',
                mobile,
                email: `admin_${Date.now()}@haspataal.com`,
            }
        });

        // Let's also create the Staff login representation used in Legacy logic to store password since HospitalAdmin lacks it
        const staffLogin = await prisma.staff.create({
            data: {
                hospitalId: hospital.id,
                name: 'Hospital Admin',
                mobile,
                password: password_hash,
                role: 'HOSPITAL_ADMIN'
            }
        });

        if (!adminUser || !staffLogin) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        // 4. Issue JWT
        const token = await generateToken({
            id: staffLogin.id,
            hospital_id: hospital.id,
            role: 'hospital_admin'
        });

        return NextResponse.json({ token, hospital_id: hospital.id, user_id: staffLogin.id });
    } catch (err: any) {
        console.error('Registration error details:', err.message || err);
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
