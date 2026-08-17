import { CapabilityCache } from './cache';

export async function requireCapability(hospitalId: string, capabilityKey: string): Promise<void> {
  const isEnabled = await CapabilityCache.canUse(hospitalId, capabilityKey);
  if (!isEnabled) {
    throw new Error(
      `Capability Denied: ${capabilityKey} is not enabled for hospital ${hospitalId}`,
    );
  }
}
