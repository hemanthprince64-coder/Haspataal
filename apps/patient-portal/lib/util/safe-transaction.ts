import logger from '../logger';

/**
 * Safe Transaction Wrapper
 * Handles Serializable Conflict Retries (Gap 1 Fix - Production Essential)
 */
export async function withRetry<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
  delayBase: number = 100,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;

      const err = error as { code?: string; message?: string };
      // Check for Postgres Serialization Failure (40001)
      if (err.code === 'P2034' || err.message?.includes('could not serialize access')) {
        const delay = delayBase * Math.pow(2, attempt);
        logger.warn(
          `Serialization conflict. Retrying in ${delay}ms (Attempt ${attempt + 1}/${maxRetries})...`,
        );
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }

      throw error; // Not a retryable error
    }
  }

  throw new Error(
    `Transaction failed after ${maxRetries} retries: ${(lastError as Error).message}`,
  );
}
