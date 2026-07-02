import { SearchQuery, SearchResponse } from '../../domain/types';

export class SearchService {
  constructor(private provider: any) {}

  async search(query: SearchQuery): Promise<SearchResponse> {
    return this.provider.search(query);
  }

  async autocomplete(text: string, limit = 10) {
    return this.provider.autocomplete(text, { limit });
  }

  async health() {
    return this.provider.health();
  }
}
