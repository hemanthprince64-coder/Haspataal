import db from '@haspataal/db';

export class KnowledgeGraphManager {
  /**
   * Syncs an operational record to the semantic graph.
   * This is typically called by Event Bus workers when entities change.
   */
  static async upsertNode(nodeType: string, referenceId: string, summary: any) {
    const existing = await db.knowledgeGraphNode.findUnique({
      where: {
        nodeType_referenceId: { nodeType, referenceId },
      },
    });

    if (existing) {
      return db.knowledgeGraphNode.update({
        where: { id: existing.id },
        data: {
          summary,
          lastSyncedAt: new Date(),
          sourceVersion: existing.sourceVersion + 1,
        },
      });
    }

    return db.knowledgeGraphNode.create({
      data: {
        nodeType,
        referenceId,
        summary,
      },
    });
  }

  /**
   * Defines a semantic relationship between two graph nodes.
   */
  static async linkNodes(
    sourceId: string,
    targetId: string,
    relation: string,
    derivedFrom: string = 'EXPLICIT',
  ) {
    return db.knowledgeGraphEdge.upsert({
      where: {
        sourceNodeId_targetNodeId_relation: {
          sourceNodeId: sourceId,
          targetNodeId: targetId,
          relation,
        },
      },
      create: {
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        relation,
        derivedFrom,
        lastValidated: new Date(),
      },
      update: {
        lastValidated: new Date(),
      },
    });
  }
}
