import { NextResponse } from 'next/server';
import { services } from '@/lib/services';
import logger from '@/lib/logger';

/**
 * POST /api/ai/process-visit
 * Body: { visitId: string, notes: string }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { visitId, notes } = body;

        if (!visitId || !notes) {
            return NextResponse.json({ error: 'visitId and notes are required' }, { status: 400 });
        }

        logger.info({ action: 'api_ai_process_visit', visitId }, 'Triggering AI processing via API');
        
        const summary = await services.ai.processVisit(visitId, notes);

        return NextResponse.json({ success: true, summary });
        
    } catch (error: any) {
        logger.error({ action: 'api_ai_process_visit_failed', error: error.message }, 'AI processing API failed');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
