"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigQueryHandler = exports.ConfigCommandHandler = void 0;
const schemas_1 = require("./domain/schemas");
class ConfigCommandHandler {
    configEngine;
    constructor(configEngine) {
        this.configEngine = configEngine;
    }
    async handleUpdateHospitalConfig(command) {
        const { tenantContext, payload } = command;
        const validated = schemas_1.UpdateHospitalConfigSchema.parse(payload);
        return await this.configEngine.updateHospitalConfig(tenantContext.hospitalId, validated);
    }
    async handleUpdateOpdConfig(command) {
        const { tenantContext, payload } = command;
        const validated = schemas_1.UpdateOpdConfigSchema.parse(payload);
        return await this.configEngine.updateOpdConfig(tenantContext.hospitalId, validated);
    }
    async handleUpdateBillingProfile(command) {
        const { tenantContext, payload } = command;
        const validated = schemas_1.UpdateBillingProfileSchema.parse(payload);
        return await this.configEngine.updateBillingProfile(tenantContext.hospitalId, validated);
    }
}
exports.ConfigCommandHandler = ConfigCommandHandler;
class ConfigQueryHandler {
    configEngine;
    constructor(configEngine) {
        this.configEngine = configEngine;
    }
    async handleGetHospitalConfig(query) {
        return await this.configEngine.getHospitalConfig(query.tenantScope.hospitalId);
    }
    async handleGetOpdConfig(query) {
        return await this.configEngine.getOpdConfig(query.tenantScope.hospitalId);
    }
    async handleGetBillingProfile(query) {
        return await this.configEngine.getBillingProfile(query.tenantScope.hospitalId);
    }
}
exports.ConfigQueryHandler = ConfigQueryHandler;
//# sourceMappingURL=handlers.js.map