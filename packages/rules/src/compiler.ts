import { Condition, RuleContext } from './types';

export class RuleCompiler {
  static evaluateCondition(condition: Condition, context: RuleContext): boolean {
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

  static evaluateAllConditions(conditions: Condition[], context: RuleContext): boolean {
    if (!conditions.length) return true;
    return conditions.every((condition) => this.evaluateCondition(condition, context));
  }

  static getFieldFromContext(field: string, context: RuleContext): any {
    const [parent, child] = field.split('.');
    if (!context.event) return undefined;

    if (parent && child) {
      return context.event[parent]?.[child];
    }
    return context.event[field] ?? context[field as keyof RuleContext];
  }
}
