'use server';

import { auth } from "@/auth";
import { logAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function grantConsentAction(formData) {
    const session = await auth();
    if (!session || !session.user) return { message: 'Unauthorized' };

    const requestId = formData.get('requestId');
    const hospitalName = formData.get('hospitalName');
    const decision = formData.get('decision'); // 'APPROVE' or 'DENY'

    if (decision === 'APPROVE') {
        // Simulate ABDM Consent Artifact Creation
        // 1. Call /consent/on-init
        // 2. Generate Consent Artefact
        // 3. Push Health Data (HIP -> HIU)

        console.log(`[ABDM SIMULATION] Granting consent to ${hospitalName} for User ${session.user.id}`);
        console.log(`[ABDM SIMULATION] Pushing 5 Health Records...`);

        await logAction(session.user.id, 'GRANT_CONSENT', 'Consent', requestId, {
            hospital: hospitalName,
            status: 'GRANTED',
            artifacts: 1
        });

        revalidatePath('/profile/consent');
        return { success: true, message: `Consent Granted to ${hospitalName}. Data shared.` };
    } else {
        await logAction(session.user.id, 'DENY_CONSENT', 'Consent', requestId, {
            hospital: hospitalName,
            status: 'DENIED'
        });

        revalidatePath('/profile/consent');
        return { success: true, message: `Consent Denied for ${hospitalName}.` };
    }
}
