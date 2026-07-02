import { Rule, Condition, Action, RuleResult } from './types';

export class RuleValidator {
  /**
   * Validates a complete rule.
   * Returns an object with a valid boolean and an array of error messages.
   */
  static validateRule(rule: Rule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.name || rule.name.trim() === '') {
      errors.push('Rule must have a valid name.');
    }

    if (
      !rule.conditionJson ||
      !Array.isArray(rule.conditionJson) ||
      rule.conditionJson.length === 0
    ) {
      errors.push('Rule must have at least one condition.');
    } else {
      rule.conditionJson.forEach((condition, index) => {
        const conditionErrors = this.validateCondition(condition as Condition);
        if (conditionErrors.length > 0) {
          errors.push(`Condition ${index + 1} invalid: ${conditionErrors.join(', ')}`);
        }
      });
    }

    if (!rule.actionJson || !Array.isArray(rule.actionJson) || rule.actionJson.length === 0) {
      errors.push('Rule must have at least one action.');
    } else {
      rule.actionJson.forEach((action, index) => {
        const actionErrors = this.validateAction(action as Action);
        if (actionErrors.length > 0) {
          errors.push(`Action ${index + 1} invalid: ${actionErrors.join(', ')}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a single condition object.
   */
  static validateCondition(condition: Condition): string[] {
    const errors: string[] = [];

    if (!condition.field || typeof condition.field !== 'string') {
      errors.push('Condition must specify a valid field.');
    }

    const validOperators = [
      'eq',
      'ne',
      'gt',
      'gte',
      'lt',
      'lte',
      'in',
      'not_in',
      'contains',
      'between',
    ];
    if (!validOperators.includes(condition.operator)) {
      errors.push(`Invalid operator: ${condition.operator}`);
    }

    if (condition.operator === 'between') {
      if (!Array.isArray(condition.value) || condition.value.length !== 2) {
        errors.push("Operator 'between' requires a value array of length 2.");
      }
    }

    if (['in', 'not_in'].includes(condition.operator)) {
      if (!Array.isArray(condition.value) || condition.value.length === 0) {
        errors.push(`Operator '${condition.operator}' requires a non-empty array value.`);
      }
    }

    if (condition.value === undefined || condition.value === null) {
      errors.push('Condition value cannot be null or undefined.');
    }

    return errors;
  }

  /**
   * Validates a single action object based on its type.
   */
  static validateAction(action: Action): string[] {
    const errors: string[] = [];

    if (!action.type) {
      errors.push('Action must specify a type.');
      return errors;
    }

    if (!action.payload || typeof action.payload !== 'object') {
      errors.push('Action must contain a valid payload object.');
      return errors;
    }

    switch (action.type) {
      case 'create_timeline':
        if (!action.payload.eventType)
          errors.push("Missing 'eventType' in create_timeline payload.");
        if (!action.payload.title) errors.push("Missing 'title' in create_timeline payload.");
        break;
      case 'send_notification':
        if (!action.payload.template)
          errors.push("Missing 'template' in send_notification payload.");
        break;
      case 'update_record':
        if (!action.payload.table) errors.push("Missing 'table' in update_record payload.");
        if (!action.payload.id) errors.push("Missing 'id' in update_record payload.");
        if (!action.payload.data) errors.push("Missing 'data' in update_record payload.");
        break;
      case 'call_api':
        if (!action.payload.url) errors.push("Missing 'url' in call_api payload.");
        break;
      case 'assign_task':
        if (!action.payload.title) errors.push("Missing 'title' in assign_task payload.");
        if (!action.payload.assignedTo) errors.push("Missing 'assignedTo' in assign_task payload.");
        break;
      case 'escalate':
        if (!action.payload.reason) errors.push("Missing 'reason' in escalate payload.");
        break;
      case 'complete_milestone':
        if (!action.payload.milestoneId)
          errors.push("Missing 'milestoneId' in complete_milestone payload.");
        break;
      case 'update_journey_risk':
        if (!action.payload.journeyId)
          errors.push("Missing 'journeyId' in update_journey_risk payload.");
        if (typeof action.payload.score !== 'number')
          errors.push("'score' must be a number in update_journey_risk payload.");
        break;
      default:
        errors.push(`Unknown action type: ${action.type}`);
    }

    return errors;
  }
}
