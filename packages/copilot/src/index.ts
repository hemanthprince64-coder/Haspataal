import db from '@haspataal/db';
import { ToolRegistry } from '@haspataal/tools';

export class SpecializedCopilotRouter {
  /**
   * Routes a user message to the appropriate specialized Copilot.
   */
  static async handleMessage(sessionId: string, message: string) {
    const session = await db.copilotSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new Error('Session not found');

    // In a real system, the router uses an Intent Detection model first
    // Here we just delegate based on the session's agentType

    let availableTools = [];
    let systemPrompt = '';

    switch (session.agentType) {
      case 'OPERATIONS_COPILOT':
        availableTools = [
          ToolRegistry.getTool('WorkflowSearchTool'),
          ToolRegistry.getTool('IncidentSearchTool'),
        ];
        systemPrompt =
          'You are the Operations Copilot. You assist with workflow health and incidents.';
        break;
      case 'CLINICAL_COPILOT':
        availableTools = [ToolRegistry.getTool('HospitalLookupTool')];
        systemPrompt =
          'You are the Clinical Copilot. You assist with occupancy, quality, and capacity.';
        break;
      // ... other agents
      default:
        systemPrompt = 'You are the General Assistant.';
        break;
    }

    // Pass the message, systemPrompt, and availableTools to the AI Policy layer
    // and ultimately the LLM.

    return {
      agent: session.agentType,
      response: `[Simulated response from ${session.agentType}] Processed: "${message}" using context and restricted tools.`,
      toolsCalled: [],
    };
  }
}
