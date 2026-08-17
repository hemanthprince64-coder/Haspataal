import { NextResponse } from 'next/server';
export declare function rateLimitMiddleware(request: Request, maxRequests?: number, window?: number): NextResponse<{
    error: string;
}> | null;
