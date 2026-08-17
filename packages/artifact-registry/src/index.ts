import db from '@haspataal/db';

export type ArtifactType = 'RULE' | 'WORKFLOW' | 'POLICY' | 'REPORT' | 'DASHBOARD';

export class ArtifactRegistry {
  /**
   * Registers a newly generated artifact from the Authoring Pipeline as a DRAFT.
   */
  static async registerArtifact(
    type: ArtifactType,
    name: string,
    source: 'HUMAN' | 'AI',
    contentAst: any,
    dependencies: string[] = [],
  ) {
    return await db.platformArtifact.create({
      data: {
        type,
        name,
        source,
        contentAst,
        dependencies,
        status: 'DRAFT',
      },
    });
  }

  static async markSimulated(artifactId: string) {
    return await db.platformArtifact.update({
      where: { id: artifactId },
      data: { status: 'SIMULATED' },
    });
  }

  static async publish(artifactId: string) {
    const artifact = await db.platformArtifact.findUnique({ where: { id: artifactId } });
    if (artifact?.status !== 'SIMULATED' && artifact?.status !== 'APPROVED') {
      throw new Error('Artifact must be simulated or approved before publishing.');
    }

    return await db.platformArtifact.update({
      where: { id: artifactId },
      data: { status: 'PUBLISHED' },
    });
  }
}
