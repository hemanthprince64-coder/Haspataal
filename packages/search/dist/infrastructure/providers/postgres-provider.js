import { prisma } from '@haspataal/db';
import { Prisma } from '@prisma/client';

import { RankingEngine } from '../../application/services/ranking-engine';

export class PostgresSearchProvider {
  // prisma is imported directly from @haspataal/db as a singleton
  async search(query) {
    const start = Date.now();
    const { text, limit = 20, cursor, types, hospitalId, dateRange, status, sort, order } = query;
    const tsQuery = text.trim() ? text.trim().split(/\s+/).join(' | ') : null;
    const whereConditions = [];
    if (tsQuery) {
      whereConditions.push(Prisma.sql`search_vector @@ to_tsquery('english', ${tsQuery})`);
    }
    if (types && types.length > 0) {
      whereConditions.push(Prisma.sql`entity_type IN (${Prisma.join(types)})`);
    }
    if (hospitalId) {
      whereConditions.push(Prisma.sql`hospital_id = ${hospitalId}::uuid`);
    }
    if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) {
      whereConditions.push(Prisma.sql`created_at >= ${dateRange.from}`);
    }
    if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.to) {
      whereConditions.push(Prisma.sql`created_at <= ${dateRange.to}`);
    }
    if (status) {
      whereConditions.push(Prisma.sql`metadata->>'status' = ${status}`);
    }
    let offset = 0;
    if (cursor) {
      if (cursor.startsWith('offset:')) {
        offset = parseInt(cursor.replace('offset:', ''), 10) || 0;
      } else {
        // Fallback for older opaque cursor assuming id
        whereConditions.push(Prisma.sql`id != ${cursor}::uuid`);
      }
    }
    const whereClause =
      whereConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
        : Prisma.empty;
    const tsRankSelect = tsQuery
      ? Prisma.sql`ts_rank(search_vector, to_tsquery('english', ${tsQuery}))`
      : Prisma.sql`1.0`;
    const tsHeadlineSelect = tsQuery
      ? Prisma.sql`ts_headline('english', content, to_tsquery('english', ${tsQuery}))`
      : Prisma.sql`content`;
    let orderByClause = Prisma.empty;
    if (sort === 'created_at') {
      orderByClause = Prisma.sql`ORDER BY created_at ${order === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`}`;
    } else if (sort === 'updated_at') {
      orderByClause = Prisma.sql`ORDER BY updated_at ${order === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`}`;
    } else {
      orderByClause = Prisma.sql`ORDER BY rank DESC`;
    }
    const results = await prisma.$queryRaw`
      SELECT 
        id, 
        entity_type as "entityType", 
        entity_id as "entityId", 
        hospital_id as "hospitalId", 
        title, 
        content, 
        metadata,
        ${tsRankSelect} as rank,
        ${tsHeadlineSelect} as highlight_content,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM searchable_entities
      ${whereClause}
      ${orderByClause}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const facetResults = await prisma.$queryRaw`
      SELECT entity_type, count(*) as count
      FROM searchable_entities
      ${whereClause}
      GROUP BY entity_type
    `;
    const facets = {
      entityType: facetResults.map((f) => ({ value: f.entity_type, count: Number(f.count) })),
    };
    let mappedResults = results.map((r) => ({
      id: r.id,
      entityType: r.entityType,
      entityId: r.entityId,
      hospitalId: r.hospitalId,
      title: r.title,
      content: r.content,
      metadata: r.metadata,
      rank: Number(r.rank),
      highlight: { content: [r.highlight_content] },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    if (sort === 'relevance' || !sort) {
      mappedResults = mappedResults
        .map((doc) => {
          const newRank = RankingEngine.calculateRelevance(text, doc, { hospitalId });
          return Object.assign(Object.assign({}, doc), { rank: newRank });
        })
        .sort((a, b) => (order === 'asc' ? a.rank - b.rank : b.rank - a.rank));
    }
    return {
      results: mappedResults,
      total: results.length,
      tookMs: Date.now() - start,
      facets,
      nextCursor: results.length === limit ? `offset:${offset + limit}` : undefined,
    };
  }
  async index(document, tx) {
    const textContent = `${document.title} ${document.content || ''}`;
    const db = tx || prisma;
    const existing = await db.$queryRaw`
      SELECT id FROM searchable_entities
      WHERE entity_type = ${document.entityType} AND entity_id = ${document.entityId}
      LIMIT 1
    `;
    const hId = document.hospitalId || null;
    if (existing && existing.length > 0) {
      await db.$executeRaw`
        UPDATE searchable_entities SET
          hospital_id = ${hId}::uuid,
          title = ${document.title},
          content = ${document.content},
          metadata = ${document.metadata ? JSON.stringify(document.metadata) : null}::jsonb,
          search_vector = to_tsvector('english', ${textContent}),
          updated_at = NOW()
        WHERE id = ${existing[0].id}::uuid
      `;
    } else {
      await db.$executeRaw`
        INSERT INTO searchable_entities (
          id, entity_type, entity_id, hospital_id, title, content, metadata, search_vector, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${document.entityType},
          ${document.entityId},
          ${hId}::uuid,
          ${document.title},
          ${document.content},
          ${document.metadata ? JSON.stringify(document.metadata) : null}::jsonb,
          to_tsvector('english', ${textContent}),
          NOW(),
          NOW()
        )
      `;
    }
  }
  async delete(entityId, entityType, tx) {
    const db = tx || prisma;
    await db.searchableEntity.deleteMany({
      where: { entityId, entityType },
    });
  }
  async autocomplete(text, options) {
    const start = Date.now();
    const results = await prisma.searchableEntity.findMany({
      where: Object.assign(
        Object.assign(
          { title: { startsWith: text, mode: 'insensitive' } },
          options.types ? { entityType: { in: options.types } } : {},
        ),
        options.hospitalId ? { hospitalId: options.hospitalId } : {},
      ),
      select: { title: true, entityType: true, entityId: true },
      take: options.limit || 10,
    });
    return {
      suggestions: results.map((r) => ({
        text: r.title,
        entityType: r.entityType,
        entityId: r.entityId,
      })),
      tookMs: Date.now() - start,
    };
  }
  async health() {
    var _a;
    try {
      const count = await prisma.searchableEntity.count();
      const sizeResult = await prisma.$queryRaw`
        SELECT pg_total_relation_size('searchable_entities') as size
      `;
      const outboxCount = await prisma.outboxEvent.count({ where: { processed: false } });
      const lastIndexedResult = await prisma.searchableEntity.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      });
      return {
        status: 'healthy',
        documentCount: count,
        indexSizeBytes: Number(
          ((_a = sizeResult[0]) === null || _a === void 0 ? void 0 : _a.size) || 0,
        ),
        queueDepth: outboxCount,
        lastIndexedAt:
          (lastIndexedResult === null || lastIndexedResult === void 0
            ? void 0
            : lastIndexedResult.updatedAt) || new Date(0),
      };
    } catch (error) {
      return {
        status: 'error',
        documentCount: 0,
        indexSizeBytes: 0,
        queueDepth: 0,
      };
    }
  }
}
