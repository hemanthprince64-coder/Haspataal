import { PrismaClient, Prisma } from '@prisma/client';

import { SearchQuery, SearchResponse } from '../../domain/types';
import {
  SearchIndexProvider,
  SearchDocument,
  AutocompleteOptions,
  AutocompleteResult,
  IndexHealth,
} from './index-provider';

export class PostgresSearchProvider implements SearchIndexProvider {
  constructor(private prisma: PrismaClient) {}

  async search(query: SearchQuery): Promise<SearchResponse> {
    const { text, limit = 20, cursor, types, hospitalId } = query;
    const tsQuery = text.trim().split(/\s+/).join(' | ');

    const results = await this.prisma.$queryRaw<any[]>`
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
      results: results.map((r: any) => ({
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

  async index(document: SearchDocument): Promise<void> {
    const textContent = `${document.title} ${document.content || ''}`;

    await this.prisma.$executeRaw`
      INSERT INTO searchable_entities (
        id, entity_type, entity_id, hospital_id, title, content, metadata, search_vector, created_at, updated_at
      ) VALUES (
        ${document.id}::uuid,
        ${document.entityType},
        ${document.entityId}::uuid,
        ${document.hospitalId ? document.hospitalId + '::uuid' : null},
        ${document.title},
        ${document.content},
        ${document.metadata ? JSON.stringify(document.metadata) : null}::jsonb,
        to_tsvector('english', ${textContent}),
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        metadata = EXCLUDED.metadata,
        search_vector = EXCLUDED.search_vector,
        updated_at = NOW()
    `;
  }

  async delete(entityId: string, entityType: string): Promise<void> {
    await this.prisma.searchableEntity.deleteMany({
      where: { entityId, entityType },
    });
  }

  async autocomplete(text: string, options: AutocompleteOptions): Promise<AutocompleteResult> {
    const start = Date.now();
    const results = await this.prisma.searchableEntity.findMany({
      where: {
        title: { startsWith: text, mode: 'insensitive' },
        ...(options.types ? { entityType: { in: options.types } } : {}),
        ...(options.hospitalId ? { hospitalId: options.hospitalId } : {}),
      },
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

  async health(): Promise<IndexHealth> {
    const count = await this.prisma.searchableEntity.count();
    return {
      status: 'healthy',
      documentCount: count,
      indexSizeBytes: 0,
      queueDepth: 0,
    };
  }
}
