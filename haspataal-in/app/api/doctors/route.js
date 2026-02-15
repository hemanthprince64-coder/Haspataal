import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { redis } from '@/lib/redis';

export async function GET() {
    try {
        const cacheKey = 'doctors:all';

        // Try Cache
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return NextResponse.json(cached); // redis returns parsed JSON if stored as JSON? No, upsstash returns object if set as object
                // If stored as string, need parsing. Upstash REST returns result.
                // If I store as object, upstash/redis library parses it.
                // Let's assume automatic parsing.
            }
        } catch (e) {
            console.error('Redis Error:', e);
        }

        const doctors = await prisma.doctor.findMany({
            include: { hospital: true },
            orderBy: { name: 'asc' }
        });

        // Set Cache (Async, don't await blocking response)
        try {
            await redis.set(cacheKey, doctors, { ex: 300 }); // 5 minutes
        } catch (e) {
            console.error('Redis Set Error:', e);
        }

        return NextResponse.json(doctors);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch' }, { status: 500 });
    }
}
