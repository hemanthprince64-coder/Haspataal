import { Prisma } from '@prisma/client';

export class PostgresSearchProvider {
  constructor(prisma) {
    this.prisma = prisma;
  }
  async search(query) {
    const { text, limit = 20, cursor, types, hospitalId } = query;
    const tsQuery = text.trim().split(/\s+/).join(' | ');
    const results = await this.prisma.$queryRaw`
      SELECT 
        id, 
        entity_type as "entityType", 
        entity_id as "entityId", 
        hospital_id as "hospitalId", 
        title, 
        content, 
        metadata,
        ts_rank(search_vector, to_tsquery('english', ${tsQuery})) as rank,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM searchable_entities
      WHERE search_vector @@ to_tsquery('english', ${tsQuery})
      ${types && types.length > 0 ? Prisma.sql`AND entity_type IN (${Prisma.join(types)})` : Prisma.empty}
      ${hospitalId ? Prisma.sql`AND hospital_id = ${hospitalId}::uuid` : Prisma.empty}
      ORDER BY rank DESC
      LIMIT ${limit}
    `;
    return {
      results: results.map((r) => ({
        id: r.id,
        entityType: r.entityType,
        entityId: r.entityId,
        hospitalId: r.hospitalId,
        title: r.title,
        content: r.content,
        metadata: r.metadata,
        rank: Number(r.rank),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      total: results.length, // approximation
      tookMs: 0,
    };
  }
  async index(document) {
    const textContent = `${document.title} ${document.content || ''}`;
    const existing = await this.prisma.$queryRaw`
      SELECT id FROM searchable_entities
      WHERE entity_type = ${document.entityType} AND entity_id = ${document.entityId}
      LIMIT 1
    `;
    const hId = document.hospitalId || null;
    if (existing && existing.length > 0) {
      await this.prisma.$executeRaw`
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
      await this.prisma.$executeRaw`
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
  async delete(entityId, entityType) {
    await this.prisma.searchableEntity.deleteMany({
      where: { entityId, entityType },
    });
  }
  async autocomplete(text, options) {
    const start = Date.now();
    const results = await this.prisma.searchableEntity.findMany({
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
    const count = await this.prisma.searchableEntity.count();
    return {
      status: 'healthy',
      documentCount: count,
      indexSizeBytes: 0,
      queueDepth: 0,
    };
  }
}
