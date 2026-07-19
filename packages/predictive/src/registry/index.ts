import db from '@haspataal/db';

/**
 * FeatureRegistryManager manages the lifecycle of reusable ML features.
 */
export class FeatureRegistryManager {
  static async registerFeature(
    key: string,
    domain: string,
    calculation: string,
    sourceTables: string[],
    refreshFrequency: string,
  ) {
    return db.featureRegistry.upsert({
      where: { key },
      create: { key, domain, calculation, sourceTables, refreshFrequency },
      update: { calculation, sourceTables, refreshFrequency },
    });
  }

  static async getFeaturesByDomain(domain: string) {
    return db.featureRegistry.findMany({
      where: { domain },
    });
  }
}
