import { Rule, RuleContext, RuleResult } from './types';

export declare class ExecutionEngine {
  private prisma;
  constructor(prismaClient: any);
  execute(rule: Rule, context: RuleContext): Promise<RuleResult>;
  private executeAction;
  private createTimelineEvent;
  private sendNotification;
  private updateRecord;
  private callApi;
  private assignTask;
  private escalate;
  private logExecution;
}
