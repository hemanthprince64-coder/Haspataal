import { vi } from 'vitest';

process.env.NEXTAUTH_SECRET = 'test-secret-for-jwt-signing-which-is-at-least-32-chars-long';
process.env.JWT_SECRET = 'test-secret-for-jwt-signing-which-is-at-least-32-chars-long';

vi.mock('ioredis', () => {
  const RedisMock = require('ioredis-mock');
  return {
    default: RedisMock,
    Redis: RedisMock,
  };
});
