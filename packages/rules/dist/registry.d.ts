import { Rule } from './types';

export declare class RuleRegistry {
  private prisma;
  constructor(prismaClient: any);
  create(
    data: Omit<Rule, 'id'> & {
      id?: string;
    },
  ): Promise<Rule>;
  findById(id: string): Promise<Rule | null>;
  findByEvent(eventType: string, hospitalId?: string): Promise<Rule[]>;
  list(hospitalId?: string, category?: string): Promise<Rule[]>;
  update(id: string, data: Partial<Omit<Rule, 'id'>>): Promise<Rule>;
  delete(id: string): Promise<void>;
  private toRule;
}
