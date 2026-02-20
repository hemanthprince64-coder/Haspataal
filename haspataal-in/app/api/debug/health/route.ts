import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
    let dbStatus = 'disconnect';
    try {
        const supabase = createClient();
        const { error } = await supabase.from('hospitals').select('id').limit(1);
        if (!error) {
            dbStatus = 'connected';
        } else {
            dbStatus = `error: ${error.message}`;
        }
    } catch (err) {
        dbStatus = 'unreachable';
    }

    return NextResponse.json({
        server_status: 'online',
        db_status: dbStatus,
        auth_status: process.env.JWT_SECRET ? 'configured' : 'missing_secret',
        timestamp: new Date().toISOString()
    });
}
