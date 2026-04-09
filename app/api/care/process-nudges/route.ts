import { NextResponse } from "next/server";
import { CareLifecycleService } from "@/lib/services/care-lifecycle";
import logger from "@/lib/logger";

/**
 * GET /api/care/process-nudges
 * 
 * Scheduled job to process all pending patient nudges.
 * In production, this should be secured by a secret token in the header.
 */
export async function GET(request: Request) {
    try {
        logger.info({ action: 'api_process_nudges' }, 'Nudge processor triggered');
        
        const results = await CareLifecycleService.processPendingNudges();
        
        return NextResponse.json({
            success: true,
            processedCount: results.length,
            details: results
        });
    } catch (error) {
        logger.error({ error }, 'Failed to process nudges via API');
        return NextResponse.json({ 
            success: false, 
            error: (error as Error).message 
        }, { status: 500 });
    }
}
