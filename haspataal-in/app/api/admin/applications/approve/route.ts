
import { NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/services/onboarding';
import { checkRole, Roles } from '@/lib/auth/roleGuard';

export async function POST(req: Request) {
    try {
        await checkRole(req, [Roles.ADMIN]);
        const { applicationId } = await req.json();

        const result = await OnboardingService.approveApplication(applicationId);
        return NextResponse.json(result);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to approve application' }, { status: 500 });
    }
}
