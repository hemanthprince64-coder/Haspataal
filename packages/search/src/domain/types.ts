import { z } from 'zod';

export const EntityType = z.enum([
  'patient',
  'doctor',
  'hospital',
  'appointment',
  'journey',
  'prescription',
  'lab',
  'radiology',
  'bill',
  'medicine',
  'investigation',
  'notification',
  'task',
  'clinical',
  'timeline',
]);
export type EntityType = z.infer<typeof EntityType>;

export const SearchQuery = z.object({
  text: z.string(),
  types: z.array(EntityType).optional(),
  hospitalId: z.string().uuid().optional(),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  status: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  sort: z.enum(['relevance', 'created_at', 'updated_at']).default('relevance'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
export type SearchQuery = z.infer<typeof SearchQuery>;

export const SearchResult = z.object({
  id: z.string().uuid(),
  entityType: EntityType,
  entityId: z.string().uuid(),
  hospitalId: z.string().uuid().optional(),
  title: z.string(),
  content: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  rank: z.number(),
  highlight: z.record(z.string(), z.array(z.string())).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SearchResult = z.infer<typeof SearchResult>;

export const SearchResponse = z.object({
  results: z.array(SearchResult),
  total: z.number(),
  nextCursor: z.string().optional(),
  tookMs: z.number(),
  facets: z
    .record(z.string(), z.array(z.object({ value: z.string(), count: z.number() })))
    .optional(),
});
export type SearchResponse = z.infer<typeof SearchResponse>;
