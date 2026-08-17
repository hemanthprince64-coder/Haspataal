import { PlatformQuery, createPlatformQuerySchema } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { SearchService } from './application/services/search-service';
import { EntityType } from './domain/types';

export const SearchFiltersSchema = z.object({
  query: z.string(),
  types: z.array(z.string()).optional(),
  limit: z.number().optional(),
  cursor: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export const AutocompleteFiltersSchema = z.object({
  query: z.string(),
  types: z.array(z.string()).optional(),
  limit: z.number().optional(),
});
export type AutocompleteFilters = z.infer<typeof AutocompleteFiltersSchema>;

export const SearchQuerySchema = createPlatformQuerySchema(SearchFiltersSchema as any);
export const AutocompleteQuerySchema = createPlatformQuerySchema(AutocompleteFiltersSchema as any);

export class SearchQueryHandler {
  constructor(private searchService: SearchService) {}

  async handleSearch(query: PlatformQuery<SearchFilters>) {
    const { hospitalId } = query.tenantScope;
    const { query: text, types, limit, cursor, from, to } = query.filters;

    const dateRange = (from || to) ? {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    } : undefined;

    return await this.searchService.search({
      text,
      types: types as EntityType[] | undefined || ['timeline'],
      hospitalId,
      limit: limit || 20,
      cursor,
      sort: types?.includes('timeline') ? 'created_at' : 'relevance',
      order: 'desc',
      dateRange,
    });
  }

  async handleAutocomplete(query: PlatformQuery<AutocompleteFilters>) {
    const { hospitalId } = query.tenantScope;
    const { query: text, types, limit } = query.filters;

    return await this.searchService.autocomplete(
      text,
      limit || 10,
      types as EntityType[] | undefined,
      hospitalId
    );
  }
}
