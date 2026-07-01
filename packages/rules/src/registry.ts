import { Rule, Condition, Action } from './types';

export class RuleRegistry {
  private prisma: any;

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
  }

  async create(data: Omit<Rule, 'id'> & { id?: string }): Promise<Rule> {
    const rule = await this.prisma.rule.create({
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
        isActive: data.isActive ?? true,
        priority: data.priority ?? 100,
      },
    });
    return this.toRule(rule);
  }

  async findById(id: string): Promise<Rule | null> {
    const rule = await this.prisma.rule.findUnique({ where: { id } });
    return rule ? this.toRule(rule) : null;
  }

  async findByEvent(eventType: string, hospitalId?: string): Promise<Rule[]> {
    const rules = await this.prisma.rule.findMany({
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

  async list(hospitalId?: string, category?: string): Promise<Rule[]> {
    const rules = await this.prisma.rule.findMany({
      where: {
        OR: [{ hospitalId: null }, { hospitalId }],
        ...(category && { category }),
      },
      orderBy: { priority: 'desc' },
    });
    return rules.map(this.toRule);
  }

  async update(id: string, data: Partial<Omit<Rule, 'id'>>): Promise<Rule> {
    const rule = await this.prisma.rule.update({
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

  async delete(id: string): Promise<void> {
    await this.prisma.rule.delete({ where: { id } });
  }

  private toRule(db: any): Rule {
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
    } as Rule;
  }
}
