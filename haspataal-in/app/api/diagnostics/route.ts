
import { NextResponse } from 'next/server';
import { DiagnosticsService } from '@/lib/services/diagnostics';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: Request) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await verifyToken(token);
        // Catalog is likely public to all auth users regardless of hospital?
        // Or maybe specific to hospital? Schema doesn't link catalog to hospital.
        // Assuming global catalog.

        const data = await DiagnosticsService.getCatalog();

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch diagnostics catalog' }, { status: 500 });
    }
}
