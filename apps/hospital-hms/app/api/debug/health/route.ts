/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug endpoints are disabled in production' }, { status: 404 });
  }

  return NextResponse.json({
    server_status: 'online',
    timestamp: new Date().toISOString(),
  });
}
