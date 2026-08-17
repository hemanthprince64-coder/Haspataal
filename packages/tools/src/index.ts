/**
 * Tool Registry for Copilots.
 * This ensures copilots only invoke registered, safe tools and keeps business logic out of LLM prompts.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  schema: any;
  handler: (args: any) => Promise<any>;
}

export class ToolRegistry {
  private static tools: Map<string, ToolDefinition> = new Map();

  static register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  static getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  static getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
}

// Initial Tool Stubs
ToolRegistry.register({
  name: 'WorkflowSearchTool',
  description: 'Search active workflows by hospital ID or status',
  schema: { type: 'object', properties: { status: { type: 'string' } } },
  handler: async () => [{ id: 'wf-123', status: 'FAILED' }],
});

ToolRegistry.register({
  name: 'HospitalLookupTool',
  description: 'Lookup hospital operational metrics',
  schema: { type: 'object', properties: { hospitalId: { type: 'string' } } },
  handler: async () => ({ id: 'h-123', healthScore: 92 }),
});
