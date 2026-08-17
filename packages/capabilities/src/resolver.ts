import { prisma } from '@haspataal/db';

import { CapabilityEvaluation } from './types';

export class CapabilityResolver {
  /**
   * Resolves the effective capabilities for a given hospital.
   * This is the single source of truth for runtime capability decisions.
   * It evaluates:
   * 1. Global defaults
   * 2. Active plans/subscriptions (TBD)
   * 3. Feature flags (TBD)
   * 4. Manual overrides / Hospital settings (from HospitalCapability)
   */
  static async resolve(hospitalId: string): Promise<CapabilityEvaluation> {
    // 1. Fetch all catalog capabilities
    const registry = await prisma.capabilityRegistry.findMany();

    // 2. Fetch specific grants/overrides for this hospital
    const hospitalCaps = await prisma.hospitalCapability.findMany({
      where: { hospitalId },
      orderBy: { sourcePriority: 'desc' },
    });

    const evalResult: CapabilityEvaluation = {};

    // 3. Apply defaults
    registry.forEach((cap) => {
      evalResult[cap.key] = cap.defaultEnabled;
    });

    // 4. Apply hospital specific overrides (highest priority wins due to order by)
    // In a real system, we would also resolve subscriptions and feature flags here.
    // We treat HospitalCapability as the materialized override for now.
    const evaluatedKeys = new Set<string>();

    for (const hc of hospitalCaps) {
      if (!evaluatedKeys.has(hc.capabilityKey)) {
        // If status is ACTIVE and not expired, it's enabled
        const isActive = hc.status === 'ACTIVE';
        const isNotExpired = !hc.expiresAt || hc.expiresAt > new Date();
        const hasStarted = hc.effectiveFrom <= new Date();

        evalResult[hc.capabilityKey] = isActive && isNotExpired && hasStarted;
        evaluatedKeys.add(hc.capabilityKey);
      }
    }

    // 5. Apply Dependencies (if a parent is false, children might be disabled, or vice versa)
    // For now, simple dependency check: if dependency is false, this is false.
    let changed = true;
    while (changed) {
      changed = false;
      for (const cap of registry) {
        if (evalResult[cap.key]) {
          for (const dep of cap.dependencies) {
            if (!evalResult[dep]) {
              evalResult[cap.key] = false;
              changed = true; // Need to re-evaluate cascaded dependencies
            }
          }
        }
      }
    }

    return evalResult;
  }

  /**
   * Helper to check a single capability quickly.
   * NOTE: In production, this should hit `CapabilityCache` instead of database directly.
   */
  static async canUse(hospitalId: string, capabilityKey: string): Promise<boolean> {
    const capabilities = await this.resolve(hospitalId);
    return capabilities[capabilityKey] === true;
  }
}
