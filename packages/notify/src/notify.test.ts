import { describe, it, expect } from 'vitest';

import { TwilioSMSAdapter } from '../src/adapters';
import { NotificationEngine } from '../src/engine';

describe('NotificationEngine', () => {
  it('should create an engine with adapters', () => {
    const engine = new NotificationEngine([
      new TwilioSMSAdapter({ accountSid: 'test', authToken: 'test', from: 'test' }),
    ]);
    expect(engine).toBeDefined();
  });
});

describe('TwilioSMSAdapter', () => {
  it('should validate config', () => {
    const adapter = new TwilioSMSAdapter({ accountSid: 'sid', authToken: 'token', from: 'from' });
    expect(adapter.validateConfig({ accountSid: 'sid', authToken: 'token' })).toBe(true);
    expect(adapter.validateConfig({})).toBe(false);
  });
});
