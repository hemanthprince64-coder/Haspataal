import { prisma } from '@haspataal/db';
import { Prisma } from '@prisma/client';
import { PlatformQuery, createPlatformQuerySchema } from '@haspataal/platform-contracts';
import { z } from 'zod';
import IORedis from 'ioredis';
import { createHash } from 'crypto';
import { SearchService, PostgresSearchProvider } from '@haspataal/search';

const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const PAGE_SIZE = 50;
const CACHE_TTL = 300; // 5 minutes

export const TimelineFiltersSchema = z.object({
  patientId: z.string().optional(),
  hospitalId: z.string().optional(),
  category: z.string().optional(),
  severity: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  module: z.string().optional(),
  tags: z.array(z.string()).optional(),
  group: z.enum(['month', 'type', 'hospital', 'doctor']).optional(),
  q: z.string().optional(),
});
export type TimelineFilters = z.infer<typeof TimelineFiltersSchema>;

export const TimelineQuerySchema = createPlatformQuerySchema(TimelineFiltersSchema as any);
export type TimelineQuery = z.infer<typeof TimelineQuerySchema>;

function buildWhereClause(
  base: Prisma.TimelineEventWhereInput,
  filters: TimelineFilters,
): Prisma.TimelineEventWhereInput {
  const where: Prisma.TimelineEventWhereInput = { ...base };

  if (filters.category) {
    const cats = filters.category.split(',').map((c) => c.trim());
    where.category = { in: cats };
  }
  if (filters.severity) {
    where.severity = filters.severity;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.timestamp = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
    };
  }
  if (filters.module) {
    where.module = filters.module;
  }
  if (filters.tags && filters.tags.length > 0) {
    where.tags = { hasEvery: filters.tags };
  }

  return where;
}

export class TimelineQueryHandler {
  static async getPatientTimeline(query: PlatformQuery<TimelineFilters>) {
    const { patientId } = query.filters;
    if (!patientId) throw new Error('patientId is required');

    const cursor = query.pagination?.cursor;
    const cacheKey = `timeline:patient:${patientId}:cursor:${cursor ?? 'start'}:${JSON.stringify(query.filters)}`;

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const where = buildWhereClause({ patientId, status: 'ACTIVE' }, query.filters);

    const pinnedEvents = !cursor
      ? await prisma.timelineEvent.findMany({
          where: { ...where, isPinned: true },
          orderBy: { timestamp: 'desc' },
          take: 10,
        })
      : undefined;

    const limit = query.pagination?.limit ?? PAGE_SIZE;
    const events = await prisma.timelineEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = events.length > limit;
    const data = events.slice(0, limit);
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    const result = { data, nextCursor, hasMore, pinnedEvents };
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  static async getDoctorTimeline(query: PlatformQuery<TimelineFilters>) {
    const { patientId } = query.filters;
    const { hospitalId } = query.tenantScope;
    if (!patientId) throw new Error('patientId is required');

    const where = buildWhereClause({ patientId, hospitalId, status: 'ACTIVE' }, query.filters);
    const cursor = query.pagination?.cursor;
    const limit = query.pagination?.limit ?? PAGE_SIZE;

    const events = await prisma.timelineEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = events.length > limit;
    const data = events.slice(0, limit);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const criticalAlerts = data.filter(
      (e) => e.severity === 'CRITICAL' && new Date(e.timestamp) >= ninetyDaysAgo,
    );

    const clinicalHighlights = {
      criticalAlerts: criticalAlerts.map((e) => ({
        id: e.id,
        title: e.title,
        timestamp: e.timestamp,
        category: e.category,
      })),
      activeMedicationEvents: data.filter((e) => e.category === 'PRESCRIPTION').length,
      lastLabAbnormalities: data
        .filter((e) => e.category === 'INVESTIGATION' && e.severity === 'HIGH')
        .slice(0, 3),
    };

    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore, clinicalHighlights };
  }

  static async getClinicalSummary(query: PlatformQuery<TimelineFilters>) {
    const { patientId } = query.filters;
    const { hospitalId } = query.tenantScope;
    if (!patientId) throw new Error('patientId is required');

    const [diagnoses, medications, labs, lastAdmission] = await Promise.all([
      prisma.timelineEvent.findMany({
        where: { patientId, hospitalId, category: 'DIAGNOSIS' },
        orderBy: { timestamp: 'desc' },
        take: 5,
        select: { title: true, timestamp: true, metadata: true },
      }),
      prisma.timelineEvent.findMany({
        where: { patientId, hospitalId, category: { in: ['PRESCRIPTION'] }, status: 'ACTIVE' },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: { title: true, timestamp: true, metadata: true },
      }),
      prisma.timelineEvent.findMany({
        where: { patientId, hospitalId, category: 'INVESTIGATION' },
        orderBy: { timestamp: 'desc' },
        take: 3,
        select: { title: true, timestamp: true, severity: true, summary: true },
      }),
      prisma.timelineEvent.findFirst({
        where: { patientId, hospitalId, category: 'ADMISSION' },
        orderBy: { timestamp: 'desc' },
        select: { title: true, timestamp: true, summary: true },
      }),
    ]);

    return { diagnoses, medications, labs, lastAdmission };
  }

  static async getHospitalTimeline(query: PlatformQuery<TimelineFilters>) {
    const { patientId } = query.filters;
    const { hospitalId } = query.tenantScope;
    
    // In hospital timeline, patientId might be optional if we are viewing a global feed
    const whereParams: any = { hospitalId, status: 'ACTIVE' };
    if (patientId) whereParams.patientId = patientId;

    const where = buildWhereClause(whereParams, query.filters);
    const cursor = query.pagination?.cursor;
    const limit = query.pagination?.limit ?? PAGE_SIZE;

    const events = await prisma.timelineEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = events.length > limit;
    const data = events.slice(0, limit);

    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  static async searchTimeline(query: PlatformQuery<TimelineFilters>) {
    const searchService = new SearchService(new PostgresSearchProvider());
    const { q, dateFrom, dateTo, patientId } = query.filters;
    const { hospitalId } = query.tenantScope;
    const cursor = query.pagination?.cursor;
    const limit = query.pagination?.limit ?? 20;

    const result = await searchService.search({
      text: q ?? '',
      types: ['timeline'],
      hospitalId,
      limit: Math.min(limit, 100),
      cursor,
      sort: 'created_at',
      order: 'desc',
      dateRange: {
        from: dateFrom ? new Date(dateFrom) : undefined,
        to: dateTo ? new Date(dateTo) : undefined,
      },
    });

    // Optionally filter by patientId post-search or rely on search index
    let finalResults = result.results;
    if (patientId) {
      finalResults = finalResults.filter((r: any) => r.metadata?.patientId === patientId);
    }

    return {
      data: finalResults.map((r: any) => ({
        ...(r.metadata || {}), 
        id: r.entityId,
        rank: r.rank,
        search_highlight: r.highlight,
      })),
      hasMore: !!result.nextCursor,
      nextCursor: result.nextCursor,
    };
  }

  static async getBookmarks(query: PlatformQuery<Record<string, never>>) {
    const { actorId } = query.actorScope;
    return prisma.timelineBookmark.findMany({
      where: { userId: actorId },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getExportStatus(query: PlatformQuery<{ jobId: string }>) {
    const { jobId } = query.filters;
    return prisma.timelineExport.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        fileUrl: true,
        format: true,
        createdAt: true,
        completedAt: true,
      },
    });
  }

  static async verifyIntegrity(query: PlatformQuery<{ eventId: string }>) {
    const { eventId } = query.filters;
    const event = await prisma.timelineEvent.findUnique({
      where: { id: eventId },
      select: { patientId: true, eventType: true, timestamp: true, metadata: true, integrityHash: true },
    });

    if (!event) return { valid: false, error: 'Event not found' };

    const recomputed = createHash('sha256')
      .update(JSON.stringify({
        patientId: event.patientId,
        eventType: event.eventType,
        timestamp: event.timestamp.toISOString(),
        metadata: event.metadata,
      }))
      .digest('hex');

    const valid = recomputed === event.integrityHash;
    return { valid, tampered: !valid };
  }

  static async getAdminAnalytics(query: PlatformQuery<Record<string, never>>) {
    const { hospitalId } = query.tenantScope;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: Prisma.TimelineEventWhereInput = {
      ...(hospitalId ? { hospitalId } : {}),
    };

    const [totalToday, byCategory, failedAuditCount] = await Promise.all([
      prisma.timelineEvent.count({ where: { ...where, createdAt: { gte: today } } }),
      prisma.timelineEvent.groupBy({ by: ['category'], where, _count: { id: true } }),
      prisma.timelineAudit.count({ where: { action: 'INGESTION_FAILED' } }),
    ]);

    return {
      totalEventsToday: totalToday,
      byCategory: byCategory.map((g) => ({ category: g.category, count: g._count.id })),
      failedCount: failedAuditCount,
      deadLetterCount: failedAuditCount,
    };
  }
}
