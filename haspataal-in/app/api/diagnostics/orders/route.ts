import { NextResponse } from 'next/server';
import { DiagnosticsService } from '@/lib/services/diagnostics';
import { checkRole, Roles } from '@/lib/auth/roleGuard';

export async function GET(req: Request) {
    try {
        const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST]);
        // @ts-ignore
        const data = await DiagnosticsService.getOrders(user.hospital_id);

        return NextResponse.json(data);
    } catch (err: any) {
        if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
            return NextResponse.json({ error: err.message }, { status: err.message.startsWith('Unauthorized') ? 401 : 403 });
        }
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Only Admin and Doctor can order diagnostics
        const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR]);
        const body = await req.json();

        // @ts-ignore
        const data = await DiagnosticsService.createOrder(user.hospital_id, body);

        return NextResponse.json(data);
    } catch (err: any) {
        if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
            return NextResponse.json({ error: err.message }, { status: err.message.startsWith('Unauthorized') ? 401 : 403 });
        }
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await checkRole(req, [Roles.ADMIN, Roles.DOCTOR]);
        const { orderId, status, reportUrl } = await req.json();

        // @ts-ignore
        const data = await DiagnosticsService.updateStatus(orderId, status, reportUrl);

        // Audit Log
        const { AuditService } = await import('@/lib/services/audit');
        // @ts-ignore
        await AuditService.log('DIAGNOSTIC_UPDATE', user.hospital_id, user.user_id, 'diagnostic_orders', orderId, { status, reportUrl });

        return NextResponse.json(data);
    } catch (err: any) {
        if (err.message.startsWith('Forbidden') || err.message.startsWith('Unauthorized')) {
            return NextResponse.json({ error: err.message }, { status: err.message.startsWith('Unauthorized') ? 401 : 403 });
        }
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
