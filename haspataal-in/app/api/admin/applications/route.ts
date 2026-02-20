
import { NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/services/onboarding';
import { checkRole, Roles } from '@/lib/auth/roleGuard';

// POST: Public endpoint for submitting applications
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = await OnboardingService.submitApplication(body);
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }
}

// GET: Admin only - View pending applications
export async function GET(req: Request) {
    try {
        // In a real scenario, we'd have a Super Admin role. 
        // For MVP, using 'admin' role but this technically allows any hospital admin to see applications?
        // We need a SUPER_ADMIN role or specific user ID check.
        // For now, restricting to a hardcoded 'super-admin' check ideally, or just allowing admins for demo.
        await checkRole(req, [Roles.ADMIN]);

        const data = await OnboardingService.getPendingApplications();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
}
