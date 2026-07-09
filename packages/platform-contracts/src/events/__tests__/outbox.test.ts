import { describe, it, expect } from 'vitest';

import {
  normalizeLegacyOutbox,
  buildCanonicalOutbox,
  canonicalEventEnvelopeSchema,
  ScopeType,
  ActorType,
  OutboxDeliveryStatus,
  InMemoryIdempotencyLedger,
  type RawOutboxRecord,
} from '../outbox';

describe('Phase 0A — canonical event envelope (acceptance criteria)', () => {
  it('1. legacy event with only eventType + payload is normalized with nulls', () => {
    const env = normalizeLegacyOutbox({ id: 'evt-1', eventType: 'FOO', payload: { a: 1 } });
    expect(env.eventId).toBe('evt-1');
    expect(env.eventVersion).toBe(1); // safe default, not fabricated
    expect(env.scope.scopeType).toBeNull();
    expect(env.scope.hospitalId).toBeNull();
    expect(env.actor.actorId).toBeNull();
    expect(env.actor.actorType).toBeNull();
    expect(env.chain.correlationId).toBeNull();
    expect(env.chain.causationId).toBeNull();
    expect(env.chain.depth).toBe(0);
    expect(env.occurredAt).toBeNull();
    expect(env.payload).toEqual({ a: 1 });
    expect(env.normalizedFromLegacy).toBe(true);
  });

  it('2. canonical event with all structured metadata is preserved', () => {
    const record: RawOutboxRecord = {
      id: 'evt-2',
      eventType: 'BAR',
      payload: { x: 2 },
      eventVersion: 3,
      aggregateType: 'ADMISSION',
      aggregateId: 'adm-9',
      scopeType: 'HOSPITAL',
      hospitalId: 'hosp-1',
      tenantId: 'ten-1',
      actorId: 'doc-1',
      actorType: 'DOCTOR',
      actorRole: 'CLINICIAN',
      correlationId: 'corr-1',
      causationId: 'caus-1',
      depth: 2,
      occurredAt: '2026-07-09T10:00:00.000Z',
    };
    const env = normalizeLegacyOutbox(record);
    expect(env.eventVersion).toBe(3);
    expect(env.aggregate).toEqual({ aggregateType: 'ADMISSION', aggregateId: 'adm-9' });
    expect(env.scope).toEqual({ scopeType: 'HOSPITAL', hospitalId: 'hosp-1', tenantId: 'ten-1' });
    expect(env.actor).toEqual({ actorId: 'doc-1', actorType: 'DOCTOR', role: 'CLINICIAN' });
    expect(env.chain).toEqual({ correlationId: 'corr-1', causationId: 'caus-1', depth: 2 });
    expect(env.occurredAt).toEqual(new Date('2026-07-09T10:00:00.000Z'));
    expect(env.normalizedFromLegacy).toBe(false);
    // passes Zod schema
    expect(() => canonicalEventEnvelopeSchema.parse(env)).not.toThrow();
  });

  it('3. mixed structured + legacy payload → structured wins', () => {
    const record: RawOutboxRecord = {
      id: 'evt-3',
      eventType: 'MIX',
      payload: { correlationId: 'legacy-corr', hospitalId: 'legacy-hosp' },
      correlationId: 'struct-corr',
    };
    const env = normalizeLegacyOutbox(record);
    expect(env.chain.correlationId).toBe('struct-corr'); // structured overrides
    expect(env.scope.hospitalId).toBe('legacy-hosp'); // fallback used (no structured)
    expect(env.normalizedFromLegacy).toBe(false);
  });

  it('4. structured value overrides conflicting legacy payload value', () => {
    const record: RawOutboxRecord = {
      id: 'evt-4',
      eventType: 'CONFLICT',
      payload: { actorId: 'legacy-actor', depth: 99 },
      actorId: 'struct-actor',
      depth: 5,
    };
    const env = normalizeLegacyOutbox(record);
    expect(env.actor.actorId).toBe('struct-actor');
    expect(env.chain.depth).toBe(5);
  });

  it('5. platform-scoped event with no hospital', () => {
    const env = normalizeLegacyOutbox({
      id: 'evt-5',
      eventType: 'PLATFORM_MERGE',
      scopeType: 'PLATFORM',
      payload: {},
    });
    expect(env.scope.scopeType).toBe('PLATFORM');
    expect(env.scope.hospitalId).toBeNull();
  });

  it('6. hospital-scoped event', () => {
    const env = normalizeLegacyOutbox({
      id: 'evt-6',
      eventType: 'DISCHARGE',
      scopeType: 'HOSPITAL',
      hospitalId: 'hosp-2',
      payload: {},
    });
    expect(env.scope).toEqual({ scopeType: 'HOSPITAL', hospitalId: 'hosp-2', tenantId: null });
  });

  it('7. system actor with no human actor id', () => {
    const env = normalizeLegacyOutbox({
      id: 'evt-7',
      eventType: 'SYS',
      actorType: 'PLATFORM_SYSTEM',
      payload: {},
    });
    expect(env.actor.actorType).toBe('PLATFORM_SYSTEM');
    expect(env.actor.actorId).toBeNull();
  });

  it('8. child event with correlationId + causationId', () => {
    const env = normalizeLegacyOutbox({
      id: 'evt-8',
      eventType: 'CHILD',
      correlationId: 'root',
      causationId: 'parent',
      payload: {},
    });
    expect(env.chain).toEqual({ correlationId: 'root', causationId: 'parent', depth: 0 });
  });

  it('9. depth zero root event', () => {
    const env = normalizeLegacyOutbox({ id: 'evt-9', eventType: 'ROOT', payload: {}, depth: 0 });
    expect(env.chain.depth).toBe(0);
  });

  it('10. existing DB row created before migration (no structured cols) processes', () => {
    const env = normalizeLegacyOutbox({
      id: 'evt-legacy',
      eventType: 'OLD',
      payload: { hospitalId: 'hosp-old', correlationId: 'c-old' },
    });
    expect(env.eventId).toBe('evt-legacy');
    expect(env.scope.hospitalId).toBe('hosp-old');
    expect(env.chain.correlationId).toBe('c-old');
    expect(env.normalizedFromLegacy).toBe(true);
  });

  it('11. payload is preserved verbatim (producers unchanged contract)', () => {
    const payload = { foo: 'bar', nested: { a: 1 } };
    const env = normalizeLegacyOutbox({ id: 'evt-11', eventType: 'P', payload });
    expect(env.payload).toBe(payload);
  });

  it('12. canonical producer using new helper builds correct row', () => {
    const row = buildCanonicalOutbox({
      eventId: 'evt-12',
      eventType: 'CANON',
      payload: { k: 1 },
      scopeType: ScopeType.HOSPITAL,
      hospitalId: 'hosp-12',
      actorType: ActorType.NURSE,
      actorId: 'nurse-12',
      correlationId: 'c-12',
      causationId: 'p-12',
      depth: 1,
      occurredAt: '2026-07-09T12:00:00.000Z',
      deliveryStatus: OutboxDeliveryStatus.PENDING,
    });
    expect(row.id).toBe('evt-12');
    expect(row.eventVersion).toBe(1);
    expect(row.scopeType).toBe('HOSPITAL');
    expect(row.hospitalId).toBe('hosp-12');
    expect(row.actorId).toBe('nurse-12');
    expect(row.depth).toBe(1);
    // round-trips through normalization
    const env = normalizeLegacyOutbox(row);
    expect(env.eventId).toBe('evt-12');
    expect(env.normalizedFromLegacy).toBe(false);
  });

  it('13. occurredAt is distinct from row insertion and coercion-safe', () => {
    const env = normalizeLegacyOutbox({
      id: 'evt-13',
      eventType: 'T',
      occurredAt: '2026-07-08T00:00:00.000Z',
      payload: {},
    });
    expect(env.occurredAt).toEqual(new Date('2026-07-08T00:00:00.000Z'));
  });

  it('14. unknown legacy event does NOT receive fabricated identity/context', () => {
    const env = normalizeLegacyOutbox({ id: 'evt-14', eventType: 'MYSTERY', payload: {} });
    expect(env.scope.hospitalId).toBeNull();
    expect(env.scope.tenantId).toBeNull();
    expect(env.actor.actorId).toBeNull();
    expect(env.actor.actorType).toBeNull();
    expect(env.aggregate.aggregateId).toBeNull();
    expect(env.normalizedFromLegacy).toBe(true);
  });

  it('enums are exposed for producer/consumer use', () => {
    expect(OutboxDeliveryStatus.DEAD_LETTERED).toBe('DEAD_LETTERED');
    expect(ScopeType.PLATFORM).toBe('PLATFORM');
  });

  it('InMemoryIdempotencyLedger enforces per-consumer dedup contract', async () => {
    const ledger = new InMemoryIdempotencyLedger();
    expect(await ledger.isProcessed('search', 'e1')).toBe(false);
    await ledger.markProcessed('search', 'e1');
    expect(await ledger.isProcessed('search', 'e1')).toBe(true);
    // different consumer sees it independently (ledger is per consumerName)
    expect(await ledger.isProcessed('timeline', 'e1')).toBe(false);
  });
});
