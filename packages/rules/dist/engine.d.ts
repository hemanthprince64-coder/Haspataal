import { Rule, RuleContext, RuleResult } from './types';

export declare class ExecutionEngine {
  constructor();
  execute(rule: Rule, context: RuleContext, tx?: any): Promise<RuleResult>;
  private executeAction;
  private createTimelineEvent;
  private sendNotification;
  private updateRecord;
  private callApi;
  private assignTask;
  private escalate;
  private completeMilestone;
  private updateJourneyRisk;
  private logExecution;
}
