import { vi } from 'vitest';

vi.mock('ioredis', () => {
  const RedisMock = require('ioredis-mock');
  return {
    default: RedisMock,
    Redis: RedisMock,
  };
});
