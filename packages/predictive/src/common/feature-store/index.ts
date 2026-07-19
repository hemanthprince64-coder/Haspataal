import db from '@haspataal/db';

/**
 * FeatureStore computes and retrieves standardized ML features
 * so all predictive models use the exact same definitions.
 */
export class FeatureStore {
  /**
   * Retrieves a compiled feature value for an entity.
   * In a production enterprise system, this would read from a fast Redis/KV cache
   * populated by batch jobs, rather than computing on the fly.
   */
  static async getFeature(featureKey: string, entityId: string): Promise<any> {
    const feature = await db.featureRegistry.findUnique({
      where: { key: featureKey },
    });

    if (!feature) {
      throw new Error(`Feature ${featureKey} not found in registry`);
    }

    // Mock computation - in reality this runs the `feature.calculation` logic
    return Math.random() * 100;
  }
}
