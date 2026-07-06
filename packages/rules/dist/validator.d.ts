import { Rule, Condition, Action } from './types';
export declare class RuleValidator {
    /**
     * Validates a complete rule.
     * Returns an object with a valid boolean and an array of error messages.
     */
    static validateRule(rule: Rule): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Validates a single condition object.
     */
    static validateCondition(condition: Condition): string[];
    /**
     * Validates a single action object based on its type.
     */
    static validateAction(action: Action): string[];
}
