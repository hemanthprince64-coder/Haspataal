import { describe, it, expect, vi, beforeEach } from 'vitest';

import { EventService, EVENT_LOG_INSERT_SQL } from '../event.service.ts';

// Phase 0A EventLog repair test. Network-free:
//  - asserts the repaired SQL constant targets `event_logs` with the new columns;
//  - asserts idempotency-key determinism;
//  - exercises the runtime path via the SQLite branch with a mocked Prisma client
//    (the PostgreSQL raw-SQL branch is validated separately by applying the
//    migration 10_add_outbox_canonical_columns.sql to a test database).

const eventLogCreate = vi.hoisted(() => vi.fn().mockResolvedValue({}));

vi.mock('@haspataal/db', () => ({
  prisma: { eventLog: { create: eventLogCreate } },
}));

describe('Phase 0A — EventLog service repair (services/event.service.ts)', () => {
  beforeEach(() => {
    eventLogCreate.mockClear();
    process.env.DATABASE_PROVIDER = 'sqlite'; // exercise the prisma-backed branch
  });

  it('EVENT_LOG_INSERT_SQL targets event_logs (not the nonexistent "EventLog")', () => {
    expect(EVENT_LOG_INSERT_SQL).toContain('event_logs');
    expect(EVENT_LOG_INSERT_SQL).not.toContain('"EventLog"');
    expect(EVENT_LOG_INSERT_SQL).toContain('idempotency_key');
    expect(EVENT_LOG_INSERT_SQL).toContain('metadata');
    expect(EVENT_LOG_INSERT_SQL).toContain('ON CONFLICT (idempotency_key) DO NOTHING');
  });

  it('runtime path executes the prisma eventLog.create without throwing', async () => {
    const ok = await EventService.publish(
      'PATIENT_REGISTERED',
      { foo: 'bar' },
      'hosp-1',
      'p-1',
      'r-1',
    );
    expect(ok).toBe(true);
    expect(eventLogCreate).toHaveBeenCalledTimes(1);
    const data = eventLogCreate.mock.calls[0][0].data;
    expect(data.eventType).toBe('PATIENT_REGISTERED');
    expect(data.hospitalId).toBe('hosp-1');
    expect(data.patientId).toBe('p-1');
  });

  it('generateIdempotencyKey is deterministic per (hospital, type, resource, day)', () => {
    const a = EventService.generateIdempotencyKey('hosp-x', 'DUP', 'res-x');
    const b = EventService.generateIdempotencyKey('hosp-x', 'DUP', 'res-x');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/); // sha256 hex
    expect(EventService.generateIdempotencyKey('hosp-y', 'DUP', 'res-x')).not.toBe(a);
  });
});
