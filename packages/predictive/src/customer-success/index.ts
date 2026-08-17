import { FeatureStore } from '../common/feature-store';

export class CustomerSuccessPredictor {
  /**
   * Calculates a multi-dimensional health score for a hospital.
   */
  static async calculateHealthScore(
    hospitalId: string,
  ): Promise<{ score: number; status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL' }> {
    const adoptionRate = await FeatureStore.getFeature('capability_adoption_rate', hospitalId);
    const incidentCount = await FeatureStore.getFeature('recent_incident_count', hospitalId);
    const activeUsers = await FeatureStore.getFeature('active_users_7d', hospitalId);

    // Weighted scoring
    const score = Math.round(adoptionRate * 0.5 + activeUsers * 0.3 - incidentCount * 2);
    const normalizedScore = Math.max(0, Math.min(100, score));

    let status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL' = 'HEALTHY';
    if (normalizedScore < 40) status = 'CRITICAL';
    else if (normalizedScore < 70) status = 'AT_RISK';

    return { score: normalizedScore, status };
  }
}
