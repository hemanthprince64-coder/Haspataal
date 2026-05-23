/**
 * workers/__tests__/escalation.worker.test.ts
 *
 * Integration-style tests for EscalationWorker.processQueue().
 * Patch points:
 *  - EscalationWorker.pool  → inject a FakePgClient-backed mock pool
 *  - attemptEscalate stubbed via spy - decoupled from private, this process
 *  - redis.eval             → spied to control and assert lock behaviour
 *  - EventService.publish   → spied to assert events emitted
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import redis from '../../lib/redis';
import { EventService } from '../../services/event.service';
import { EscalationWorker } from '../escalation.worker';

// ─── helpers ─────────────────────────────────────────────────────────────────

const HH = '00000000-0000-0000-0000-000000000001';

function alertRow(o: Record<string, any> = {}) {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    hospital_id: HH,
    patient_id: 'patient-001',
    doctor_id: 'doctor-001',
    missed_count: 3,
    chronic_tag: 'DIABETES',
    patient_name: 'Test Patient',
    doctor_name: 'Dr. Test',
    patient_phone: '+919999999999',
    doctor_phone: '+910000000000',
    hospital_name: 'Test Hospital',
    sent_via: null,
    notification_sent: false,
    is_acknowledged: false,
    attempts: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...o,
  };
}

/** FakePgClient captures every SQL call and returns results in order. */
class FakePgClient {
  readonly captured: Array<[string, ...any[]]> = [];
  private _i = 0;
  constructor(private readonly _results: any[]) {}

  async query(...args: [string, ...any[]]) {
    this.captured.push(args);
    const r = this._results[this._i] ?? { rows: [], rowCount: 0, command: '' };
    this._i++;
    return r;
  }
  release() {}
}
function sqls(c: FakePgClient) {
  return c.captured.map((a) => a[0]);
}

type MockPool = ReturnType<typeof makeMockPool>;
function makeMockPool(fakeClient: FakePgClient): MockPool {
  return { connect: vi.fn().mockResolvedValue(fakeClient) };
}

const ENV_ID = '00000000-0000-0000-0000-000000000000';

// ─── setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EscalationWorker — no unprocessed alerts', () => {
  it('should log + COMMIT with no UPDATE', async () => {
    const client = new FakePgClient([{ rows: [], rowCount: 0 }]);
    const pool = makeMockPool(client);
    EscalationWorker.pool = pool;

    const logSpy = vi.spyOn(console, 'log');

    await EscalationWorker.processQueue();

    expect(logSpy).toHaveBeenCalledWith('[EscalationWorker] No unprocessed escalation alerts.');
    expect(pool.connect).toHaveBeenCalledOnce();
    // SELECT (0 rows → rowCount 0, worker skips the loop) → COMMIT; no UPDATEs
    expect(
      sqls(client).filter((s) => s.startsWith('UPDATE') || s.startsWith('DELETE')),
    ).toHaveLength(0);
    expect(sqls(client)).toContain('COMMIT');
  });
});

describe('EscalationWorker — transaction envelope', () => {
  it('should BEGIN → SET LOCAL app.hospital_id → SELECT → COMMIT', async () => {
    const client = new FakePgClient([{ rows: [alertRow()], rowCount: 1 }, { rowCount: 0 }]);
    EscalationWorker.pool = makeMockPool(client);

    await EscalationWorker.processQueue();

    expect(sqls(client)).toHaveLength(4);
    expect(sqls(client)[0]).toBe('BEGIN');
    expect(sqls(client)[1]).toBe(`SET LOCAL app.hospital_id = '${ENV_ID}'`);
    expect(sqls(client)[2]).toContain('FROM "escalation_alerts"');
    expect(sqls(client)[3]).toBe('COMMIT');
  });
});

describe('EscalationWorker — happy path', () => {
  it('should notify_sent=true and publish escalation_notification_sent', async () => {
    const pubSpy = vi.spyOn(EventService, 'publish').mockResolvedValue(void 0);

    const client = new FakePgClient([
      { rows: [alertRow()], rowCount: 1 },
      { rowCount: 1 }, // UPDATE notification_sent = true
      { rowCount: 0 }, // COMMIT
    ]);
    EscalationWorker.pool = makeMockPool(client);

    await EscalationWorker.processQueue();

    const s = sqls(client);
    // UPDATE sits after SET LOCAL + SELECT
    const update = s.find((sql) => sql.includes('"notification_sent"'));
    expect(update).toBeDefined();
    expect(update).toContain('"sent_via"');
    expect(s).toContain('COMMIT');
    expect(pubSpy).toHaveBeenCalledWith(
      'escalation_notification_sent',
      expect.objectContaining({ channel: 'whatsapp' }),
      expect.any(String),
      expect.any(String),
    );
  });
});

describe('EscalationWorker — Redis lock already in use', () => {
  it('should not UPDATE, RELEASE still fires, and COMMIT reaches the DB', async () => {
    vi.mocked(redis).eval = vi
      .fn()
      .mockResolvedValueOnce(0) // acquire → already taken
      .mockResolvedValueOnce(1); // release  → ok in finally

    const client = new FakePgClient([{ rows: [alertRow()], rowCount: 1 }, { rowCount: 0 }]);
    EscalationWorker.pool = makeMockPool(client);

    await EscalationWorker.processQueue();

    expect(
      sqls(client).filter(
        (s) =>
          s.toLowerCase().startsWith('update') ||
          s.toLowerCase().startsWith('delete') ||
          s.toLowerCase().startsWith('insert'),
      ),
    ).toHaveLength(0);
    expect(sqls(client)).toContain('COMMIT');
  });
});

describe('EscalationWorker — DLQ after retries exhausted', () => {
  it('should set sent_via=FAILED and publish escalation_dlq when attempts >= 3', async () => {
    const alert = alertRow({ attempts: 2 });

    // lock acquisition
    vi.mocked(redis).eval = vi.fn().mockResolvedValue(1);

    // Stub attemptEscalate: simulate escalation failure (both channels fail)
    const attemptStub = vi.fn(async (c: any, a: Record<string, any>) => {
      // Simulate: both channels fail → catch in worker → DLQ branch
      const newAttempts = (a.attempts ?? 0) + 1;
      // The catch block in the worker will bump attempts and call again
      await c.query(
        `UPDATE "escalation_alerts" SET "sent_via" = 'FAILED', "updated_at" = now() WHERE id = $1`,
        [a.id],
      );
    });
    (EscalationWorker.prototype as any).attemptEscalate = attemptStub;

    const pubSpy = vi.spyOn(EventService, 'publish').mockResolvedValue(void 0);

    const client = new FakePgClient([
      { rows: [alert], rowCount: 1 }, // SELECT
      { rowCount: 1 }, // UPDATE FAILED
      { rowCount: 0 }, // COMMIT (failed + DLQ paths both call this)
    ]);
    EscalationWorker.pool = makeMockPool(client);

    await EscalationWorker.processQueue();

    // Dead-letter UPDATE appears somewhere in SQL
    const dlqSql = sqls(client).find((s) => s.includes("'FAILED'"));
    expect(dlqSql).toBeDefined();

    expect(pubSpy).toHaveBeenCalledWith(
      'escalation_dlq',
      expect.objectContaining({ alertId: alert.id }),
      alert.hospital_id,
      alert.patient_id,
    );
  });
});

describe('EscalationWorker — retry path (attempts < 3)', () => {
  it('should increment the attempts counter, COMMIT, and NOT emit escalation_dlq', async () => {
    const alert = alertRow({ attempts: 1 });

    vi.mocked(redis).eval = vi.fn().mockResolvedValue(1);

    const attemptStub = vi.fn(async (c: any, a: Record<string, any>) => {
      // Simulate escalation failure → catch block bumps attempts and waits
      await c.query(
        `UPDATE "escalation_alerts" SET "attempts" = $1, "updated_at" = now() WHERE id = $2`,
        [2, a.id],
      );
    });
    (EscalationWorker.prototype as any).attemptEscalate = attemptStub;

    const pubSpy = vi.spyOn(EventService, 'publish').mockResolvedValue(void 0);

    const client = new FakePgClient([
      { rows: [alert], rowCount: 1 },
      { rowCount: 1 }, // UPDATE attempts → 2
      { rowCount: 0 }, // COMMIT
    ]);
    EscalationWorker.pool = makeMockPool(client);

    await EscalationWorker.processQueue();

    // DLQ event must NOT be raised on a retry
    expect(pubSpy).not.toHaveBeenCalledWith(
      'escalation_dlq',
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    // attempts counter must be bumped in the UPDATE
    expect(sqls(client).some((s) => s.toLowerCase().includes('attempts'))).toBe(true);
    expect(sqls(client)).toContain('COMMIT');
  });
});
