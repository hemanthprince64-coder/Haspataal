import { prisma } from '@haspataal/db';
export class RuleRegistry {
    constructor() { }
    async create(data) {
        var _a, _b;
        const rule = await prisma.rule.create({
            data: {
                id: data.id,
                hospitalId: data.hospitalId,
                name: data.name,
                description: data.description,
                category: data.category,
                triggerType: data.triggerType,
                triggerEvent: data.triggerEvent,
                conditionJson: data.conditionJson,
                actionJson: data.actionJson,
                isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true,
                priority: (_b = data.priority) !== null && _b !== void 0 ? _b : 100,
            },
        });
        return this.toRule(rule);
    }
    async findById(id) {
        const rule = await prisma.rule.findUnique({ where: { id } });
        return rule ? this.toRule(rule) : null;
    }
    async findByEvent(eventType, hospitalId) {
        const rules = await prisma.rule.findMany({
            where: {
                triggerType: 'EVENT',
                triggerEvent: eventType,
                isActive: true,
                OR: [{ hospitalId: null }, { hospitalId }],
            },
            orderBy: { priority: 'desc' },
        });
        return rules.map(this.toRule);
    }
    async list(hospitalId, category) {
        const rules = await prisma.rule.findMany({
            where: Object.assign({ OR: [{ hospitalId: null }, { hospitalId }] }, (category && { category })),
            orderBy: { priority: 'desc' },
        });
        return rules.map(this.toRule);
    }
    async update(id, data) {
        const rule = await prisma.rule.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                triggerType: data.triggerType,
                triggerEvent: data.triggerEvent,
                conditionJson: data.conditionJson,
                actionJson: data.actionJson,
                isActive: data.isActive,
                priority: data.priority,
            },
        });
        return this.toRule(rule);
    }
    async delete(id) {
        await prisma.rule.delete({ where: { id } });
    }
    toRule(db) {
        return {
            id: db.id,
            hospitalId: db.hospitalId,
            name: db.name,
            description: db.description,
            category: db.category,
            triggerType: db.triggerType,
            triggerEvent: db.triggerEvent,
            conditionJson: db.conditionJson,
            actionJson: db.actionJson,
            isActive: db.isActive,
            priority: db.priority,
        };
    }
}
