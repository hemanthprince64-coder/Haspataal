
import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth/hash';
import { generateToken } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/client'; // Using the centralized client

export async function POST(req: Request) {
    try {
        const { mobile, password } = await req.json();

        if (!mobile || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const supabase = createClient();

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('mobile', mobile)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await generateToken(user);

        // Audit Log
        const { AuditService } = await import('@/lib/services/audit');
        // user.hospital_id might be null for super admins, but schema allows nullable
        await AuditService.log('LOGIN', user.hospital_id, user.id, 'users', user.id);

        return NextResponse.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
