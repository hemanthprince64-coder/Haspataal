import { Condition, RuleContext } from './types';
export declare class RuleCompiler {
    static evaluateCondition(condition: Condition, context: RuleContext): boolean;
    static evaluateAllConditions(conditions: Condition[], context: RuleContext): boolean;
    static getFieldFromContext(field: string, context: RuleContext): any;
}
