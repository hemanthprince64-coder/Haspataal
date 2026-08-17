export interface SemanticFilter {
  attribute: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'between';
  value: any;
}

export interface SemanticQuery {
  baseEntity: string;
  select: string[];
  filters?: SemanticFilter[];
  groupBy?: string[];
  aggregations?: Array<{
    type: 'sum' | 'avg' | 'count' | 'min' | 'max';
    attribute: string;
    alias: string;
  }>;
  joins?: Array<{
    entity: string;
    type: 'inner' | 'left';
  }>;
}

export interface ReportExecutionResult {
  reportId: string;
  data: any[];
  rowCount: number;
  latencyMs: number;
}
