/**
 * lib/redis.ts
 *
 * Root-level Redis client entry-point shared by services/ and workers/.
 * Delegates to the real client in apps/patient-portal/lib/redis.ts.
 */
import redisClient from '../apps/patient-portal/lib/redis';

export default redisClient;
export { redisClient as redis };
