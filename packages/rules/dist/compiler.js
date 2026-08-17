export class RuleCompiler {
    static evaluateCondition(condition, context) {
        const { field, operator, value } = condition;
        const actualValue = this.getFieldFromContext(field, context);
        switch (operator) {
            case 'eq':
                return actualValue === value;
            case 'ne':
                return actualValue !== value;
            case 'gt':
                return actualValue > value;
            case 'gte':
                return actualValue >= value;
            case 'lt':
                return actualValue < value;
            case 'lte':
                return actualValue <= value;
            case 'in':
                return Array.isArray(value) && value.includes(actualValue);
            case 'not_in':
                return Array.isArray(value) && !value.includes(actualValue);
            case 'contains':
                return String(actualValue).toLowerCase().includes(String(value).toLowerCase());
            case 'between':
                return Array.isArray(value) && actualValue >= value[0] && actualValue <= value[1];
            default:
                return false;
        }
    }
    static evaluateAllConditions(conditions, context) {
        if (!conditions.length)
            return true;
        return conditions.every((condition) => this.evaluateCondition(condition, context));
    }
    static getFieldFromContext(field, context) {
        var _a, _b;
        const [parent, child] = field.split('.');
        if (!context.event)
            return undefined;
        if (parent && child) {
            return (_a = context.event[parent]) === null || _a === void 0 ? void 0 : _a[child];
        }
        return (_b = context.event[field]) !== null && _b !== void 0 ? _b : context[field];
    }
}
