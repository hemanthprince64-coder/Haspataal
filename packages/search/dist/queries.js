import { createPlatformQuerySchema } from '@haspataal/platform-contracts';
import { z } from 'zod';
export const SearchFiltersSchema = z.object({
    query: z.string(),
    types: z.array(z.string()).optional(),
    limit: z.number().optional(),
    cursor: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
});
export const AutocompleteFiltersSchema = z.object({
    query: z.string(),
    types: z.array(z.string()).optional(),
    limit: z.number().optional(),
});
export const SearchQuerySchema = createPlatformQuerySchema(SearchFiltersSchema);
export const AutocompleteQuerySchema = createPlatformQuerySchema(AutocompleteFiltersSchema);
export class SearchQueryHandler {
    constructor(searchService) {
        this.searchService = searchService;
    }
    async handleSearch(query) {
        const { hospitalId } = query.tenantScope;
        const { query: text, types, limit, cursor, from, to } = query.filters;
        const dateRange = (from || to) ? {
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        } : undefined;
        return await this.searchService.search({
            text,
            types: types || ['timeline'],
            hospitalId,
            limit: limit || 20,
            cursor,
            sort: (types === null || types === void 0 ? void 0 : types.includes('timeline')) ? 'created_at' : 'relevance',
            order: 'desc',
            dateRange,
        });
    }
    async handleAutocomplete(query) {
        const { hospitalId } = query.tenantScope;
        const { query: text, types, limit } = query.filters;
        return await this.searchService.autocomplete(text, limit || 10, types, hospitalId);
    }
}
