import { useEffect, useState } from 'react';

import { CapabilityCache } from './cache';

// Note: In a real Next.js application, this would probably call a React Server Component
// or an API endpoint that wraps CapabilityCache since it needs DB access.
// For now, this serves as the contract for the hook.
export function useCapability(hospitalId: string, capabilityKey: string) {
  const [hasCapability, setHasCapability] = useState<boolean | null>(null);

  useEffect(() => {
    // Mocking an async fetch
    CapabilityCache.canUse(hospitalId, capabilityKey)
      .then((result) => setHasCapability(result))
      .catch(() => setHasCapability(false));
  }, [hospitalId, capabilityKey]);

  return {
    hasCapability,
    isLoading: hasCapability === null,
  };
}
