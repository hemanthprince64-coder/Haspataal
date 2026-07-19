import { CapabilityResolver } from './resolver';
import { CapabilityEvaluation } from './types';

/**
 * A basic in-memory cache for capabilities.
 * In a real distributed system, this should be backed by Redis
 * and invalidated via Event Bus when HospitalCapability changes.
 */
export class CapabilityCache {
  private static cache = new Map<string, { data: CapabilityEvaluation; expiresAt: number }>();
  private static TTL_MS = 60 * 1000; // 1 minute

  static async get(hospitalId: string): Promise<CapabilityEvaluation> {
    const cached = this.cache.get(hospitalId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const resolved = await CapabilityResolver.resolve(hospitalId);

    this.cache.set(hospitalId, {
      data: resolved,
      expiresAt: Date.now() + this.TTL_MS,
    });

    return resolved;
  }

  static invalidate(hospitalId: string) {
    this.cache.delete(hospitalId);
  }

  static async canUse(hospitalId: string, capabilityKey: string): Promise<boolean> {
    const caps = await this.get(hospitalId);
    return caps[capabilityKey] === true;
  }
}
