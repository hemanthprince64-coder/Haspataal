import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth/hash';
import { generateToken } from '@/lib/auth/jwt';
import prisma from '@/lib/prisma';
import { AuditService } from '@/lib/services/audit';

export async function POST(req: Request) {
    try {
        const { mobile, password } = await req.json();

        if (!mobile || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const user = await prisma.staff.findUnique({
            where: { mobile }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const valid = await verifyPassword(password, user.password);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await generateToken({
            id: user.id,
            hospital_id: user.hospitalId,
            role: user.role.toLowerCase()
        });

        // Audit Log
        try {
            await AuditService.log('LOGIN', user.hospitalId, user.id, 'staff', user.id);
        } catch (e) { /* ignore audit error safely */ }

        return NextResponse.json({ token, hospital_id: user.hospitalId, user_id: user.id });
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
