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
    async index(document, tx) {
        return this.provider.index(document, tx);
    }
    async delete(entityId, entityType, tx) {
        return this.provider.delete(entityId, entityType, tx);
    }
}
