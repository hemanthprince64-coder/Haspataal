import { Pool } from 'pg';
import { prisma } from '@haspataal/db';
import { EventService } from '../services/event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class FollowUpWorker {
  /**
   * Designed to be run nightly via cron.
   * Scans for follow-ups due tomorrow and misses.
   */
  public static async runNightlyScan() {
    console.log('[FollowUpWorker] Starting nightly scan...');
    const isSqlite = process.env.DATABASE_PROVIDER === 'sqlite';

    if (isSqlite) {
      try {
        // 1. Process Due Tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const startOfTomorrow = new Date(tomorrowStr + 'T00:00:00.000Z');
        const endOfTomorrow = new Date(tomorrowStr + 'T23:59:59.999Z');

        const dueFollowUps = await prisma.followUp.findMany({
          where: {
            scheduledAt: { gte: startOfTomorrow, lte: endOfTomorrow },
            status: 'PENDING',
          },
          select: { id: true, hospitalId: true, patientId: true },
        });

        for (const row of dueFollowUps) {
          await EventService.publish(
            'notification_queued',
            {
              type: 'followup_reminder',
              followup_id: row.id,
            },
            row.hospitalId,
            row.patientId,
          );
        }
        console.log(`[FollowUpWorker] Queued ${dueFollowUps.length} reminders for tomorrow.`);

        // 2. Process Missed (Due yesterday or earlier, and still pending)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayEnd = new Date(yesterday.toISOString().split('T')[0] + 'T23:59:59.999Z');

        const missedFollowUps = await prisma.followUp.findMany({
          where: {
            scheduledAt: { lte: yesterdayEnd },
            status: 'PENDING',
          },
        });

        for (const row of missedFollowUps) {
          await prisma.followUp.update({
            where: { id: row.id },
            data: { status: 'NO_RESPONSE' },
          });

          const isChronic = row.type === 'RETENTION' || (row.payload as any)?.carePathway === 'CHRONIC_DISEASE';

          await EventService.publish(
            'followup_missed',
            {
              followup_id: row.id,
              care_pathway: isChronic ? 'CHRONIC_DISEASE' : 'GENERAL',
            },
            row.hospitalId,
            row.patientId,
          );

          if (isChronic) {
            await this.checkChronicEscalationPrisma(row.hospitalId, row.patientId);
          }
        }
        console.log(`[FollowUpWorker] Marked ${missedFollowUps.length} follow-ups as missed.`);

      } catch (err) {
        console.error('[FollowUpWorker] SQLite Nightly Scan failed:', err);
      }
      return;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Process Due Tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const dueRes = await client.query(
        `SELECT id, hospital_id, patient_id FROM "FollowUp" 
         WHERE due_date = $1 AND status = 'scheduled'`,
        [tomorrowStr],
      );

      for (const row of dueRes.rows) {
        // Emit a generic notification event. Phase 8 picks this up.
        await EventService.publish(
          'notification_queued',
          {
            type: 'followup_reminder',
            followup_id: row.id,
          },
          row.hospital_id,
          row.patient_id,
        );
      }
      console.log(`[FollowUpWorker] Queued ${dueRes.rowCount} reminders for tomorrow.`);

      // 2. Process Missed (Due yesterday, still scheduled)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const missedRes = await client.query(
        `UPDATE "FollowUp" SET status = 'missed'
         WHERE due_date <= $1 AND status = 'scheduled'
         RETURNING id, hospital_id, patient_id, care_pathway`,
        [yesterdayStr],
      );

      for (const row of missedRes.rows) {
        await EventService.publish(
          'followup_missed',
          {
            followup_id: row.id,
            care_pathway: row.care_pathway,
          },
          row.hospital_id,
          row.patient_id,
        );

        // Chronic Escalation Rule
        if (row.care_pathway === 'CHRONIC_DISEASE') {
          await this.checkChronicEscalation(client, row.hospital_id, row.patient_id);
        }
      }
      console.log(`[FollowUpWorker] Marked ${missedRes.rowCount} follow-ups as missed.`);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[FollowUpWorker] Scan failed', err);
    } finally {
      client.release();
    }
  }

  private static async checkChronicEscalationPrisma(hospitalId: string, patientId: string) {
    const missedCount = await prisma.followUp.count({
      where: {
        hospitalId,
        patientId,
        status: 'NO_RESPONSE',
      },
    });

    if (missedCount < 2) return;

    const lastAppt = await prisma.appointment.findFirst({
      where: { patientId, hospitalId },
      orderBy: { date: 'desc' },
      select: { doctorId: true, id: true },
    });

    if (!lastAppt) return;

    await prisma.escalationAlert.create({
      data: {
        hospitalId,
        patientId,
        doctorId: lastAppt.doctorId,
        followUpId: 'sqlite-followup-placeholder',
        appointmentId: lastAppt.id,
        missedCount,
        chronicTag: 'CHRONIC_DISEASE',
        isAcknowledged: false,
      },
    }).catch((e: any) => {
      console.warn('[FollowUpWorker] SQLite escalation alert already exists:', e.message);
    });

    await EventService.publish(
      'chronic_escalation_alert',
      { reason: `Missed ${missedCount} chronic follow-ups`, missedCount },
      hospitalId,
      patientId,
    );
  }

  /**
   * Patched 2025-05-20: persistence → EscalationAlert table.
   * Now writes an alert record (idempotent trigger) instead of only emitting a volatile event.
   */
  private static async checkChronicEscalation(client: any, hospitalId: string, patientId: string) {
    const res = await client.query(
      `SELECT count(*) FROM "FollowUp"
       WHERE hospital_id=$1 AND patient_id=$2 AND care_pathway='CHRONIC_DISEASE' AND status='missed'`,
      [hospitalId, patientId],
    );
    const missedCount = parseInt(res.rows[0].count, 10);
    if (missedCount < 2) return;   // threshold not yet reached

    // Idempotent insert — trigger on escalation_alerts prevents duplicates at DB level
    await client.query(
      `INSERT INTO "escalation_alerts"
         (hospital_id, patient_id, doctor_id, follow_up_id, appointment_id,
          missed_count, chronic_tag, is_acknowledged, created_at, updated_at)
       SELECT
         f."hospital_id", f."patient_id",
         a."doctor_id", f."id", f."appointment_id",
         $3, 'CHRONIC_DISEASE', false, now(), now()
       FROM "FollowUp" f
       LEFT JOIN "Appointment" a ON a."id" = f."appointment_id"
       WHERE f."hospital_id" = $1 AND f."patient_id" = $2
         AND f."care_pathway" = 'CHRONIC_DISEASE' AND f."status" = 'missed'
       LIMIT 1
       ON CONFLICT ("appointment_id", "hospital_id") DO NOTHING`,
      [hospitalId, patientId, missedCount],
    );

    await EventService.publish(
      'chronic_escalation_alert',
      { reason: `Missed ${missedCount} chronic follow-ups`, missedCount },
      hospitalId,
      patientId,
    );
  }
}

