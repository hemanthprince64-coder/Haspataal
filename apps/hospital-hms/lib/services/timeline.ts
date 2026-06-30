import { PrismaClient, type Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import IORedis from 'ioredis';

const prisma = new PrismaClient();

const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const PAGE_SIZE = 50;
const CACHE_TTL = 300; // 5 minutes

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface TimelineFilters {
  category?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  module?: string;
  tags?: string[];
  group?: 'month' | 'type' | 'hospital' | 'doctor';
}

export interface TimelinePage {
  data: object[];
  nextCursor: string | null;
  hasMore: boolean;
  pinnedEvents?: object[];
}

export interface SearchFilters extends TimelineFilters {
  q: string;
  patientId?: string;
  hospitalId?: string;
  doctorId?: string;
  tag?: string;
  cursor?: string;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// 1. PATIENT TIMELINE
// ─────────────────────────────────────────────────────────────

export async function getPatientTimeline(
  patientId: string,
  cursor?: string,
  filters: TimelineFilters = {},
): Promise<TimelinePage> {
  const cacheKey = `timeline:patient:${patientId}:cursor:${cursor ?? 'start'}:${JSON.stringify(filters)}`;

  // Check Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as TimelinePage;
  }

  const where = buildWhereClause({ patientId, status: 'ACTIVE' }, filters);

  // Fetch pinned events (only on first page)
  const pinnedEvents = !cursor
    ? await prisma.timelineEvent.findMany({
        where: { ...where, isPinned: true },
        orderBy: { timestamp: 'desc' },
        take: 10,
      })
    : undefined;

  // Cursor-paginated fetch
  const events = await prisma.timelineEvent.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = events.length > PAGE_SIZE;
  const data = events.slice(0, PAGE_SIZE);
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  const result: TimelinePage = {
    data,
    nextCursor,
    hasMore,
    pinnedEvents,
  };

  // Cache the result
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

  return result;
}

// ─────────────────────────────────────────────────────────────
// 2. DOCTOR TIMELINE (clinical view)
// ─────────────────────────────────────────────────────────────

export async function getDoctorTimeline(
  patientId: string,
  hospitalId: string,
  cursor?: string,
  filters: TimelineFilters = {},
) {
  const where = buildWhereClause({ patientId, hospitalId, status: 'ACTIVE' }, filters);

  const events = await prisma.timelineEvent.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = events.length > PAGE_SIZE;
  const data = events.slice(0, PAGE_SIZE);

  // Compute clinical highlights
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

  return {
    data,
    nextCursor: hasMore ? data[data.length - 1].id : null,
    hasMore,
    clinicalHighlights,
  };
}

// ─────────────────────────────────────────────────────────────
// 3. DOCTOR CLINICAL SUMMARY (AI-ready)
// ─────────────────────────────────────────────────────────────

export async function getClinicalSummary(patientId: string, hospitalId: string) {
  const [diagnoses, prescriptions, labs, lastAdmission] = await Promise.all([
    prisma.timelineEvent.findMany({
      where: { patientId, hospitalId, category: 'DIAGNOSIS' },
      orderBy: { timestamp: 'desc' },
      take: 5,
      select: { title: true, timestamp: true, metadata: true },
    }),
    prisma.timelineEvent.findMany({
      where: {
        patientId,
        hospitalId,
        category: { in: ['PRESCRIPTION'] },
        status: 'ACTIVE',
      },
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

  return {
    diagnoses,
    medications: prescriptions,
    labs,
    lastAdmission,
  };
}

// ─────────────────────────────────────────────────────────────
// 4. HOSPITAL TIMELINE
// ─────────────────────────────────────────────────────────────

export async function getHospitalTimeline(
  patientId: string,
  hospitalId: string,
  cursor?: string,
  filters: TimelineFilters = {},
) {
  const where = buildWhereClause({ patientId, hospitalId, status: 'ACTIVE' }, filters);

  const events = await prisma.timelineEvent.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = events.length > PAGE_SIZE;
  const data = events.slice(0, PAGE_SIZE);

  return {
    data,
    nextCursor: hasMore ? data[data.length - 1].id : null,
    hasMore,
  };
}

// ─────────────────────────────────────────────────────────────
// 5. FULL-TEXT SEARCH
// ─────────────────────────────────────────────────────────────

export async function searchTimeline(filters: SearchFilters) {
  const { q, patientId, hospitalId, doctorId, cursor, limit = 20 } = filters;
  const safeLimit = Math.min(limit, 100);

  // Build dynamic WHERE using Prisma raw
  const whereConditions: string[] = [
    `search_vector @@ to_tsquery('english', ${prisma.$queryRaw`${q.split(/\s+/).join(' & ')}`})`,
  ];

  const params: unknown[] = [q.split(/\s+/).join(' & ')];
  let paramIdx = 2;

  if (patientId) {
    whereConditions.push(`patient_id = $${paramIdx++}`);
    params.push(patientId);
  }
  if (hospitalId) {
    whereConditions.push(`hospital_id = $${paramIdx++}`);
    params.push(hospitalId);
  }
  if (doctorId) {
    whereConditions.push(`doctor_id = $${paramIdx++}`);
    params.push(doctorId);
  }
  if (filters.category) {
    whereConditions.push(`category = ANY($${paramIdx++}::text[])`);
    params.push(filters.category.split(','));
  }
  if (filters.severity) {
    whereConditions.push(`severity = $${paramIdx++}`);
    params.push(filters.severity);
  }
  if (filters.dateFrom) {
    whereConditions.push(`timestamp >= $${paramIdx++}`);
    params.push(new Date(filters.dateFrom));
  }
  if (filters.dateTo) {
    whereConditions.push(`timestamp <= $${paramIdx++}`);
    params.push(new Date(filters.dateTo));
  }

  const searchResults = await prisma.$queryRaw<object[]>`
    SELECT *, ts_rank(search_vector, to_tsquery('english', ${q.split(/\s+/).join(' & ')})) AS rank
    FROM timeline_events
    WHERE status = 'ACTIVE'
      AND (${patientId ? prisma.$queryRaw`patient_id = ${patientId}` : prisma.$queryRaw`TRUE`})
      AND (${hospitalId ? prisma.$queryRaw`hospital_id = ${hospitalId}` : prisma.$queryRaw`TRUE`})
      AND search_vector @@ to_tsquery('english', ${q.split(/\s+/).join(' & ')})
    ORDER BY rank DESC, timestamp DESC
    LIMIT ${safeLimit}
  `;

  return {
    data: searchResults,
    hasMore: searchResults.length === safeLimit,
    nextCursor: null, // simplified — full cursor support can use offset
  };
}

// ─────────────────────────────────────────────────────────────
// 6. BOOKMARKS
// ─────────────────────────────────────────────────────────────

export async function addBookmark(userId: string, eventId: string, note?: string) {
  return prisma.timelineBookmark.create({
    data: { userId, eventId, note },
  });
}

export async function removeBookmark(bookmarkId: string, userId: string) {
  return prisma.timelineBookmark.deleteMany({
    where: { id: bookmarkId, userId },
  });
}

export async function getBookmarks(userId: string) {
  return prisma.timelineBookmark.findMany({
    where: { userId },
    include: { event: true },
    orderBy: { createdAt: 'desc' },
  });
}

// ─────────────────────────────────────────────────────────────
// 7. PIN / UNPIN
// ─────────────────────────────────────────────────────────────

export async function pinEvent(eventId: string, isPinned: boolean) {
  return prisma.timelineEvent.update({
    where: { id: eventId },
    data: { isPinned },
  });
}

// ─────────────────────────────────────────────────────────────
// 8. EXPORT REQUEST
// ─────────────────────────────────────────────────────────────

export async function requestExport(
  patientId: string,
  format: string,
  requestedBy: string,
  filters?: object,
) {
  const exportRecord = await prisma.timelineExport.create({
    data: {
      patientId,
      requestedBy,
      format,
      status: 'QUEUED',
      filters: filters ? (filters as Prisma.InputJsonValue) : undefined,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return { jobId: exportRecord.id, status: 'queued' };
}

export async function getExportStatus(jobId: string) {
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

// ─────────────────────────────────────────────────────────────
// 9. INTEGRITY VERIFICATION
// ─────────────────────────────────────────────────────────────

export async function verifyIntegrity(eventId: string) {
  const event = await prisma.timelineEvent.findUnique({
    where: { id: eventId },
    select: {
      patientId: true,
      eventType: true,
      timestamp: true,
      metadata: true,
      integrityHash: true,
    },
  });

  if (!event) return { valid: false, error: 'Event not found' };

  const recomputed = createHash('sha256')
    .update(
      JSON.stringify({
        patientId: event.patientId,
        eventType: event.eventType,
        timestamp: event.timestamp.toISOString(),
        metadata: event.metadata,
      }),
    )
    .digest('hex');

  const valid = recomputed === event.integrityHash;
  return { valid, tampered: !valid };
}

// ─────────────────────────────────────────────────────────────
// 10. ADMIN ANALYTICS
// ─────────────────────────────────────────────────────────────

export async function getAdminAnalytics(hospitalId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where: Prisma.TimelineEventWhereInput = {
    ...(hospitalId ? { hospitalId } : {}),
  };

  const [totalToday, byCategory, failedAuditCount] = await Promise.all([
    prisma.timelineEvent.count({ where: { ...where, createdAt: { gte: today } } }),
    prisma.timelineEvent.groupBy({
      by: ['category'],
      where,
      _count: { id: true },
    }),
    prisma.timelineAudit.count({ where: { action: 'INGESTION_FAILED' } }),
  ]);

  return {
    totalEventsToday: totalToday,
    byCategory: byCategory.map((g) => ({ category: g.category, count: g._count.id })),
    failedCount: failedAuditCount,
    deadLetterCount: failedAuditCount, // same source
  };
}
