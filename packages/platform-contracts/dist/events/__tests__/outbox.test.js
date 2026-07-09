'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const vitest_1 = require('vitest');
const outbox_1 = require('../outbox');
(0, vitest_1.describe)('Phase 0A — canonical event envelope (acceptance criteria)', () => {
  (0, vitest_1.it)('1. legacy event with only eventType + payload is normalized with nulls', () => {
    const env = (0, outbox_1.normalizeLegacyOutbox)({
      id: 'evt-1',
      eventType: 'FOO',
      payload: { a: 1 },
    });
    (0, vitest_1.expect)(env.eventId).toBe('evt-1');
    (0, vitest_1.expect)(env.eventVersion).toBe(1); // safe default, not fabricated
    (0, vitest_1.expect)(env.scope.scopeType).toBeNull();
    (0, vitest_1.expect)(env.scope.hospitalId).toBeNull();
    (0, vitest_1.expect)(env.actor.actorId).toBeNull();
    (0, vitest_1.expect)(env.actor.actorType).toBeNull();
    (0, vitest_1.expect)(env.chain.correlationId).toBeNull();
    (0, vitest_1.expect)(env.chain.causationId).toBeNull();
    (0, vitest_1.expect)(env.chain.depth).toBe(0);
    (0, vitest_1.expect)(env.occurredAt).toBeNull();
    (0, vitest_1.expect)(env.payload).toEqual({ a: 1 });
    (0, vitest_1.expect)(env.normalizedFromLegacy).toBe(true);
  });
  (0, vitest_1.it)('2. canonical event with all structured metadata is preserved', () => {
    const record = {
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
    const env = (0, outbox_1.normalizeLegacyOutbox)(record);
    (0, vitest_1.expect)(env.eventVersion).toBe(3);
    (0, vitest_1.expect)(env.aggregate).toEqual({
      aggregateType: 'ADMISSION',
      aggregateId: 'adm-9',
    });
    (0, vitest_1.expect)(env.scope).toEqual({
      scopeType: 'HOSPITAL',
      hospitalId: 'hosp-1',
      tenantId: 'ten-1',
    });
    (0, vitest_1.expect)(env.actor).toEqual({
      actorId: 'doc-1',
      actorType: 'DOCTOR',
      role: 'CLINICIAN',
    });
    (0, vitest_1.expect)(env.chain).toEqual({
      correlationId: 'corr-1',
      causationId: 'caus-1',
      depth: 2,
    });
    (0, vitest_1.expect)(env.occurredAt).toEqual(new Date('2026-07-09T10:00:00.000Z'));
    (0, vitest_1.expect)(env.normalizedFromLegacy).toBe(false);
    // passes Zod schema
    (0, vitest_1.expect)(() => outbox_1.canonicalEventEnvelopeSchema.parse(env)).not.toThrow();
  });
  (0, vitest_1.it)('3. mixed structured + legacy payload → structured wins', () => {
    const record = {
      id: 'evt-3',
      eventType: 'MIX',
      payload: { correlationId: 'legacy-corr', hospitalId: 'legacy-hosp' },
      correlationId: 'struct-corr',
    };
    const env = (0, outbox_1.normalizeLegacyOutbox)(record);
    (0, vitest_1.expect)(env.chain.correlationId).toBe('struct-corr'); // structured overrides
    (0, vitest_1.expect)(env.scope.hospitalId).toBe('legacy-hosp'); // fallback used (no structured)
    (0, vitest_1.expect)(env.normalizedFromLegacy).toBe(false);
  });
  (0, vitest_1.it)('4. structured value overrides conflicting legacy payload value', () => {
    const record = {
      id: 'evt-4',
      eventType: 'CONFLICT',
      payload: { actorId: 'legacy-actor', depth: 99 },
      actorId: 'struct-actor',
      depth: 5,
    };
    const env = (0, outbox_1.normalizeLegacyOutbox)(record);
    (0, vitest_1.expect)(env.actor.actorId).toBe('struct-actor');
    (0, vitest_1.expect)(env.chain.depth).toBe(5);
  });
  (0, vitest_1.it)('5. platform-scoped event with no hospital', () => {
    const env = (0, outbox_1.normalizeLegacyOutbox)({
      id: 'evt-5',
      eventType: 'PLATFORM_MERGE',
      scopeType: 'PLATFORM',
      payload: {},
    });
    (0, vitest_1.expect)(env.scope.scopeType).toBe('PLATFORM');
    (0, vitest_1.expect)(env.scope.hospitalId).toBeNull();
  });
  (0, vitest_1.it)('6. hospital-scoped event', () => {
    const env = (0, outbox_1.normalizeLegacyOutbox)({
      id: 'evt-6',
      eventType: 'DISCHARGE',
      scopeType: 'HOSPITAL',
      hospitalId: 'hosp-2',
      payload: {},
    });
    (0, vitest_1.expect)(env.scope).toEqual({
      scopeType: 'HOSPITAL',
      hospitalId: 'hosp-2',
      tenantId: null,
    });
  });
  (0, vitest_1.it)('7. system actor with no human actor id', () => {
    const env = (0, outbox_1.normalizeLegacyOutbox)({
      id: 'evt-7',
      eventType: 'SYS',
      actorType: 'PLATFORM_SYSTEM',
      payload: {},
    });
    (0, vitest_1.expect)(env.actor.actorType).toBe('PLATFORM_SYSTEM');
    (0, vitest_1.expect)(env.actor.actorId).toBeNull();
  });
  (0, vitest_1.it)('8. child event with correlationId + causationId', () => {
    const env = (0, outbox_1.normalizeLegacyOutbox)({
      id: 'evt-8',
      eventType: 'CHILD',
      correlationId: 'root',
      causationId: 'parent',
      payload: {},
    });
    (0, vitest_1.expect)(env.chain).toEqual({
      correlationId: 'root',
      causationId: 'parent',
      depth: 0,
    });
  });
  (0, vitest_1.it)('9. depth zero root event', () => {
    const env = (0, outbox_1.normalizeLegacyOutbox)({
      id: 'evt-9',
      eventType: 'ROOT',
      payload: {},
      depth: 0,
    });
    (0, vitest_1.expect)(env.chain.depth).toBe(0);
  });
  (0, vitest_1.it)(
    '10. existing DB row created before migration (no structured cols) processes',
    () => {
      const env = (0, outbox_1.normalizeLegacyOutbox)({
        id: 'evt-legacy',
        eventType: 'OLD',
        payload: { hospitalId: 'hosp-old', correlationId: 'c-old' },
      });
      (0, vitest_1.expect)(env.eventId).toBe('evt-legacy');
      (0, vitest_1.expect)(env.scope.hospitalId).toBe('hosp-old');
      (0, vitest_1.expect)(env.chain.correlationId).toBe('c-old');
      (0, vitest_1.expect)(env.normalizedFromLegacy).toBe(true);
    },
  );
  (0, vitest_1.it)('11. payload is preserved verbatim (producers unchanged contract)', () => {
    const payload = { foo: 'bar', nested: { a: 1 } };
    const env = (0, outbox_1.normalizeLegacyOutbox)({ id: 'evt-11', eventType: 'P', payload });
    (0, vitest_1.expect)(env.payload).toBe(payload);
  });
  (0, vitest_1.it)('12. canonical producer using new helper builds correct row', () => {
    const row = (0, outbox_1.buildCanonicalOutbox)({
      eventId: 'evt-12',
      eventType: 'CANON',
      payload: { k: 1 },
      scopeType: outbox_1.ScopeType.HOSPITAL,
      hospitalId: 'hosp-12',
      actorType: outbox_1.ActorType.NURSE,
      actorId: 'nurse-12',
      correlationId: 'c-12',
      causationId: 'p-12',
      depth: 1,
      occurredAt: '2026-07-09T12:00:00.000Z',
      deliveryStatus: outbox_1.OutboxDeliveryStatus.PENDING,
    });
    (0, vitest_1.expect)(row.id).toBe('evt-12');
    (0, vitest_1.expect)(row.eventVersion).toBe(1);
    (0, vitest_1.expect)(row.scopeType).toBe('HOSPITAL');
    (0, vitest_1.expect)(row.hospitalId).toBe('hosp-12');
    (0, vitest_1.expect)(row.actorId).toBe('nurse-12');
    (0, vitest_1.expect)(row.depth).toBe(1);
    // round-trips through normalization
    const env = (0, outbox_1.normalizeLegacyOutbox)(row);
    (0, vitest_1.expect)(env.eventId).toBe('evt-12');
    (0, vitest_1.expect)(env.normalizedFromLegacy).toBe(false);
  });
  (0, vitest_1.it)('13. occurredAt is distinct from row insertion and coercion-safe', () => {
    const env = (0, outbox_1.normalizeLegacyOutbox)({
      id: 'evt-13',
      eventType: 'T',
      occurredAt: '2026-07-08T00:00:00.000Z',
      payload: {},
    });
    (0, vitest_1.expect)(env.occurredAt).toEqual(new Date('2026-07-08T00:00:00.000Z'));
  });
  (0, vitest_1.it)('14. unknown legacy event does NOT receive fabricated identity/context', () => {
    const env = (0, outbox_1.normalizeLegacyOutbox)({
      id: 'evt-14',
      eventType: 'MYSTERY',
      payload: {},
    });
    (0, vitest_1.expect)(env.scope.hospitalId).toBeNull();
    (0, vitest_1.expect)(env.scope.tenantId).toBeNull();
    (0, vitest_1.expect)(env.actor.actorId).toBeNull();
    (0, vitest_1.expect)(env.actor.actorType).toBeNull();
    (0, vitest_1.expect)(env.aggregate.aggregateId).toBeNull();
    (0, vitest_1.expect)(env.normalizedFromLegacy).toBe(true);
  });
  (0, vitest_1.it)('enums are exposed for producer/consumer use', () => {
    (0, vitest_1.expect)(outbox_1.OutboxDeliveryStatus.DEAD_LETTERED).toBe('DEAD_LETTERED');
    (0, vitest_1.expect)(outbox_1.ScopeType.PLATFORM).toBe('PLATFORM');
  });
  (0, vitest_1.it)('InMemoryIdempotencyLedger enforces per-consumer dedup contract', async () => {
    const ledger = new outbox_1.InMemoryIdempotencyLedger();
    (0, vitest_1.expect)(await ledger.isProcessed('search', 'e1')).toBe(false);
    await ledger.markProcessed('search', 'e1');
    (0, vitest_1.expect)(await ledger.isProcessed('search', 'e1')).toBe(true);
    // different consumer sees it independently (ledger is per consumerName)
    (0, vitest_1.expect)(await ledger.isProcessed('timeline', 'e1')).toBe(false);
  });
});
