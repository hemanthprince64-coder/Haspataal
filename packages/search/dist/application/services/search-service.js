export class SearchService {
    constructor(provider) {
        this.provider = provider;
    }
    async search(query) {
        return this.provider.search(query);
    }
    async autocomplete(text, limit = 10, types, hospitalId) {
        return this.provider.autocomplete(text, { limit, types, hospitalId });
    }
    async health() {
        return this.provider.health();
    }
    async index(document) {
        return this.provider.index(document);
    }
    async delete(entityId, entityType) {
        return this.provider.delete(entityId, entityType);
    }
}
