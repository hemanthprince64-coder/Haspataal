import { SearchQuery, SearchResponse, EntityType } from '../../domain/types';
import { SearchIndexProvider } from '../../infrastructure/providers/index-provider';

export class SearchService {
  constructor(private provider: SearchIndexProvider) {}

  async search(query: SearchQuery): Promise<SearchResponse> {
    return this.provider.search(query);
  }

  async autocomplete(text: string, limit = 10, types?: string[], hospitalId?: string) {
    return this.provider.autocomplete(text, { limit, types, hospitalId });
  }

  async health() {
    return this.provider.health();
  }

  async index(
    document: {
      entityType: string;
      entityId: string;
      hospitalId?: string;
      title: string;
      content?: string;
      metadata?: Record<string, any>;
    },
    tx?: any,
  ) {
    return this.provider.index(document as any, tx);
  }

  async delete(entityId: string, entityType: EntityType, tx?: any) {
    return this.provider.delete(entityId, entityType, tx);
  }
}
