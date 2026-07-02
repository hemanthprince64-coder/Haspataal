/**
 * workers/escalation.worker.ts
 *
 * Escalation Alert Worker — nightly / 15-min batch processor
 *
 * Reads unacknowledged EscalationAlerts and sends doctor notification
 * via the NotificationEngine pipeline (WhatsApp-primary / SMS-fallback),
 * then marks the alert as `notification_sent = true`.
 *
 * Upgrades from previous version:
 *  - Redis Lua lock per patient per worker cycle (prevents re-processing)
 *  - Prometheus escalation_events_total counter
 *  - Notification curfew integration
 */
import { prisma } from '@haspataal/db';
import { Pool } from 'pg';

import { evaluateCurfew } from '../lib/notification-curfew';
import redis from '../lib/redis';
import { EventService } from '../services/event.service';

// ---- Prometheus counter (best-effort; skip if prom-client not present) --------

let escalationCounter: any = null;

try {
  const prom = require('prom-client');
  escalationCounter = new prom.Counter({
    name: 'escalation_events_total',
    help: 'Total escalation alerts processed',
    labelNames: ['hospitalId', 'chronicTag', 'acknowledged'],
  });
} catch {
  // prom-client not installed — counter is a no-op stub
}

function recordMetric(hospitalId: string, chronicTag: string, acknowledged: boolean) {
  if (escalationCounter) {
    escalationCounter.inc({ hospitalId, chronicTag, acknowledged });
  }
}

// ---- Redis Lua lock scripts ------------------------------------------------
const LUA_ACQUIRE = `
  local key = KEYS[1]
  local ttl = tonumber(ARGV[1])
  if redis.call('SETNX', key, '1') == 1 then
    redis.call('EXPIRE', key, ttl)
    return 1
  end
  return 0
`;
const LUA_RELEASE = `
  if redis.call('GET', KEYS[1]) == '1' then
    return redis.call('DEL', KEYS[1])
  end
  return 0
`;

const LOCK_TTL_SECONDS = 300; // 5 min lock — covers one worker cycle

/** Batch size — process 50 alerts per run to keep execution under ~5 s */
const BATCH_LIMIT = 50;

// Pool is exposed as a static class member so tests can inject a mock pool
// without touching module-scoped closures.
const _pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

export class EscalationWorker {
  static pool = _pgPool;

  public static async processQueue() {
    const isSqlite = process.env.DATABASE_PROVIDER === 'sqlite';

    if (isSqlite) {
      try {
        const alerts = await prisma.escalationAlert.findMany({
          where: {
            isAcknowledged: false,
            notificationSent: false,
            sentVia: null,
          },
          take: BATCH_LIMIT,
          orderBy: { createdAt: 'asc' },
          include: {
            hospital: { select: { displayName: true } },
            patient: { select: { name: true, phone: true } },
            doctor: { select: { fullName: true, mobile: true } },
          },
        });

        if (alerts.length === 0) {
          console.log('[EscalationWorker] No unprocessed escalation alerts.');
          return;
        }

        console.log(`[EscalationWorker] Processing ${alerts.length} alert(s)…`);

        for (const alert of alerts) {
          // Bypassing Redis locking for in-process SQLite
          try {
            await this.attemptEscalatePrisma(alert);
          } catch (err) {
            console.error(`[EscalationWorker] Alert ${alert.id} failed:`, err);
          }
        }
      } catch (err) {
        console.error('[EscalationWorker] Run failed:', err);
      }
      return;
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.hospital_id = '00000000-0000-0000-0000-000000000000'`);

      const res = await client.query(
        `SELECT
           ea."id", ea."hospital_id", ea."patient_id", ea."doctor_id",
           ea."missed_count", ea."chronic_tag",
           p.name                    AS "patient_name",
           d."full_name"             AS "doctor_name",
           p.phone                   AS "patient_phone",
           d.mobile                  AS "doctor_phone",
           h."display_name"          AS "hospital_name"
         FROM "escalation_alerts" ea
         JOIN "patients"           p ON p."id"       = ea."patient_id"
         JOIN "doctors_master"     d ON d."id"       = ea."doctor_id"
         JOIN "hospitals_master"   h ON h."id"       = ea."hospital_id"
         WHERE ea."is_acknowledged"   = false
           AND ea."notification_sent" = false
           AND ea."sent_via"          IS NULL
         ORDER BY ea."created_at" ASC
         LIMIT $1
         FOR UPDATE SKIP LOCKED`,
        [BATCH_LIMIT],
      );

      if (res.rowCount === 0) {
        console.log('[EscalationWorker] No unprocessed escalation alerts.');
        await client.query('COMMIT');
        return;
      }

      console.log(`[EscalationWorker] Processing ${res.rowCount} alert(s)…`);

      for (const alert of res.rows) {
        const lockKey = `lock:escalation:patient:${alert.patient_id}`;
        if (redis) {
          const acquired = await redis.eval(LUA_ACQUIRE, 1, lockKey, String(LOCK_TTL_SECONDS));
          if (!acquired) {
            console.warn(
              `[EscalationWorker] Skipping alert ${alert.id.slice(0, 8)} — ` +
                `patient ${alert.patient_id} is already being processed in another cycle`,
            );
            continue;
          }
        }

        try {
          await this.attemptEscalate(client, alert);
        } finally {
          if (redis) await redis.eval(LUA_RELEASE, 1, lockKey);
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[EscalationWorker] Run failed:', err);
    } finally {
      client.release();
    }
  }

  private static async attemptEscalatePrisma(alert: any) {
    const { id, hospitalId, patientId, missedCount, chronicTag, patient, doctor, hospital } = alert;

    const patientName = patient?.name || 'Unknown Patient';
    const doctorName = doctor?.fullName || 'Unknown Doctor';
    const doctorPhone = doctor?.mobile || '';
    const hospitalName = hospital?.displayName || 'Unknown Hospital';

    const message = buildEscalationMessage(
      patientName,
      doctorName,
      hospitalName,
      missedCount,
      chronicTag,
    );

    const curfewDecision = evaluateCurfew(new Date());
    if (curfewDecision === 'DEFER') {
      console.warn(
        `[EscalationWorker] Alert ${id.slice(0, 8)} deferred due to notification curfew.`,
      );
      return;
    }

    let sent = false;
    let channel: 'whatsapp' | 'sms' | 'pending' = 'pending';

    try {
      const waOk = await this.mockProviderSend('whatsapp', doctorPhone, message);
      if (waOk) {
        sent = true;
        channel = 'whatsapp';
      } else {
        const smsOk = await this.mockProviderSend('sms', doctorPhone, message);
        if (smsOk) {
          sent = true;
          channel = 'sms';
        }
      }

      if (sent) {
        await prisma.escalationAlert.update({
          where: { id },
          data: {
            notificationSent: true,
            sentVia: channel,
            sentAt: new Date(),
            updatedAt: new Date(),
          },
        });

        recordMetric(hospitalId, chronicTag || 'UNKNOWN', true);

        await EventService.publish(
          'escalation_notification_sent',
          { alertId: id, channel, missedCount, chronicTag },
          hospitalId,
          patientId,
        );
        console.log(`[EscalationWorker] ✓ Alert ${id.slice(0, 8)} sent via ${channel}`);
      } else {
        throw new Error('both WhatsApp and SMS failed');
      }
    } catch (err: any) {
      const attempts = (alert.attempts ?? 0) + 1;
      if (attempts >= 3) {
        await prisma.escalationAlert.update({
          where: { id },
          data: {
            sentVia: 'FAILED',
            updatedAt: new Date(),
          },
        });
        recordMetric(hospitalId, chronicTag || 'UNKNOWN', false);
        console.error(
          `[EscalationWorker] Alert ${id.slice(0, 8)} dead-lettered after ${attempts} attempts:`,
          err.message,
        );
        await EventService.publish(
          'escalation_dlq',
          { alertId: id, reason: err.message },
          hospitalId,
          patientId,
        );
      } else {
        await prisma.escalationAlert.update({
          where: { id },
          data: {
            attempts,
            updatedAt: new Date(),
          },
        });
        console.warn(
          `[EscalationWorker] Alert ${id.slice(0, 8)} attempt ${attempts} failed; retrying next cycle.`,
        );
      }
    }
  }

  private static async attemptEscalate(client: any, alert: Record<string, any>) {
    const {
      id,
      hospital_id: hospitalId,
      patient_id: patientId,
      missed_count: missedCount,
      chronic_tag: chronicTag,
      patient_name: patientName,
      doctor_name: doctorName,
      doctor_phone: doctorPhone,
      hospital_name: hospitalName,
    } = alert;

    const message = buildEscalationMessage(
      patientName,
      doctorName,
      hospitalName,
      missedCount,
      chronicTag,
    );

    // ── Curfew check ─────────────────────────────────────────────────
    const curfewDecision = evaluateCurfew(new Date());
    if (curfewDecision === 'DEFER') {
      // Don't fail the alert — just skip this cycle; it will be retried next run
      console.warn(
        `[EscalationWorker] Alert ${id.slice(0, 8)} deferred due to notification curfew.`,
      );
      return;
    }

    let sent = false;
    let channel: 'whatsapp' | 'sms' | 'pending' = 'pending';

    try {
      const waOk = await this.mockProviderSend('whatsapp', doctorPhone, message);
      if (waOk) {
        sent = true;
        channel = 'whatsapp';
      } else {
        const smsOk = await this.mockProviderSend('sms', doctorPhone, message);
        if (smsOk) {
          sent = true;
          channel = 'sms';
        }
      }

      if (sent) {
        await client.query(
          `UPDATE "escalation_alerts"
             SET "notification_sent" = true,
                 "sent_via"          = $1,
                 "sent_at"           = now(),
                 "updated_at"        = now()
           WHERE id = $2`,
          [channel, id],
        );

        recordMetric(hospitalId, chronicTag || 'UNKNOWN', true);

        await EventService.publish(
          'escalation_notification_sent',
          { alertId: id, channel, missedCount, chronicTag },
          hospitalId,
          patientId,
        );
        console.log(`[EscalationWorker] ✓ Alert ${id.slice(0, 8)} sent via ${channel}`);
      } else {
        throw new Error('both WhatsApp and SMS failed');
      }
    } catch (err) {
      const attempts = (alert.attempts ?? 0) + 1;
      if (attempts >= 3) {
        await client.query(
          `UPDATE "escalation_alerts"
             SET "sent_via" = 'FAILED', "updated_at" = now()
           WHERE id = $1`,
          [id],
        );
        recordMetric(hospitalId, chronicTag || 'UNKNOWN', false);
        console.error(
          `[EscalationWorker] Alert ${id.slice(0, 8)} dead-lettered after ${attempts} attempts:`,
          (err as any).message,
        );
        await EventService.publish(
          'escalation_dlq',
          { alertId: id, reason: (err as any).message },
          hospitalId,
          patientId,
        );
      } else {
        await client.query(
          `UPDATE "escalation_alerts"
             SET "attempts" = $1, "updated_at" = now()
           WHERE id = $2`,
          [attempts, id],
        );
        console.warn(
          `[EscalationWorker] Alert ${id.slice(0, 8)} attempt ${attempts} failed; retrying next cycle.`,
        );
      }
    }
  }

  /**
   * Replace this mock with the real WhatsApp Business API / SMS provider call.
   */
  private static async mockProviderSend(
    channel: string,
    phone: string,
    message: string,
  ): Promise<boolean> {
    const ok = Math.random() > 0.2;
    console.log(
      `[EscalationWorker/MockProvider] ${channel.toUpperCase()} → ${phone}: "${message.slice(0, 50)}…" → ${ok ? 'SUCCESS' : 'FAIL'}`,
    );
    return ok;
  }
}

/** Build human-readable escalation message for doctor notification */
function buildEscalationMessage(
  patientName: string,
  doctorName: string,
  hospitalName: string,
  missedCount: number,
  chronicTag?: string,
): string {
  const tag = chronicTag ? ` [${chronicTag}]` : '';
  return (
    `${doctorName}, ${missedCount} appointment(s) missed consecutively${tag} by ${patientName} at ${hospitalName}. ` +
    `Please review and reach out. HMS link: https://haspataal.com/hospital/escalation-queue`
  );
}
