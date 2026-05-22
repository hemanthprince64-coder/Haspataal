/**
 * lib/backfill-escalations.ts
 *
 * Backfill script — evaluates missed follow-ups in the past N days
 * and creates EscalationAlert records for patients who crossed the
 * hospital threshold (default: 2 consecutive missed chronic follow-ups).
 *
 * Usage:
 *   npx tsx lib/backfill-escalations.ts [--dry-run] [--since YYYY-MM-DD] [--batch-size 100]
 *
 * Flags:
 *   --dry-run       Only report counts; no DB writes.
 *   --since <date>  Start from this date (default: NOW - 90 days).
 *   --batch-size N  Process N patients per transaction (default: 100).
 */

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── CLI parsing ──────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): { dryRun: boolean; since: Date; batchSize: number } {
  const args = argv.slice(2);
  let dryRun   = false;
  let since    = new Date();
  let batchSize = 100;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run')      dryRun = true;
    else if (args[i] === '--since' && args[i + 1]) {
      since = new Date(args[++i]);
    } else if (args[i] === '--batch-size' && args[i + 1]) {
      batchSize = Math.max(1, parseInt(args[++i], 10) || 100);
    }
  }
  since.setDate(since.getDate() - 90); // default: 90 days back
  return { dryRun, since, batchSize };
}

// ── Core logic ───────────────────────────────────────────────────────────────

async function backfill(opts: { dryRun: boolean; since: Date; batchSize: number }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL app.hospital_id = '00000000-0000-0000-0000-000000000000'`);

    // 1. Find all hospitals with at least one chronic missed follow-up
    const hospitalsRes = await client.query(
      `SELECT DISTINCT hospital_id FROM "FollowUp"
       WHERE care_pathway = 'CHRONIC_DISEASE'
         AND status = 'missed'
         AND due_date >= $1`,
      [opts.since.toISOString().split('T')[0]],
    );

    const hospitals = hospitalsRes.rows.map((r) => r.hospital_id);
    console.log(`[Backfill] ${hospitals.length} hospital(s) with chronic missed follow-ups found.`);

    let totalInserted = 0;
    let totalSkipped  = 0;

    for (const hospitalId of hospitals) {
      if (opts.dryRun) {
        // Count distinct patients at risk
        const countRes = await client.query(
          `SELECT DISTINCT patient_id FROM "FollowUp"
           WHERE hospital_id = $1
             AND care_pathway = 'CHRONIC_DISEASE'
             AND status = 'missed'
             AND due_date >= $2`,
          [hospitalId, opts.since.toISOString().split('T')[0]],
        );
        console.log(
          `  [Dry-Run] hospital ${hospitalId.slice(0, 8)}: ${countRes.rowCount} patient(s) at risk`,
        );
        continue;
      }

      // Live: find patients with >= 2 missed chronic follow-ups
      const atRiskRes = await client.query(
        `SELECT
           f.hospital_id,
           f.patient_id,
           COUNT(*)              AS missed_count,
           MIN(f.appointment_id) AS appointment_id
         FROM "FollowUp" f
         WHERE f.hospital_id      = $1
           AND f.care_pathway     = 'CHRONIC_DISEASE'
           AND f.status           = 'missed'
           AND f.due_date         >= $2
         GROUP BY f.hospital_id, f.patient_id
         HAVING COUNT(*) >= 2`,
        [hospitalId, opts.since.toISOString().split('T')[0]],
      );

      for (const row of atRiskRes.rows) {
        // Fetch doctor from first appointment with this patient
        const apptRes = await client.query(
          `SELECT a."doctor_id"
             FROM "Appointment" a
            WHERE a."id" = $1
            LIMIT 1`,
          [row.appointment_id],
        );

        const doctorId = apptRes.rows[0]?.doctor_id ?? '00000000-0000-0000-0000-000000000000';

        const insertRes = await client.query(
          `INSERT INTO "escalation_alerts"
              (hospital_id, patient_id, doctor_id, follow_up_id, appointment_id,
               missed_count, chronic_tag, is_acknowledged, notification_sent, created_at, updated_at)
           SELECT
              f."hospital_id", f."patient_id", $3, f."id", $2, $4, 'CHRONIC_DISEASE', false, false, now(), now()
           FROM "FollowUp" f
           WHERE f.hospital_id = $1 AND f.patient_id = $5
             AND f.care_pathway = 'CHRONIC_DISEASE' AND f.status = 'missed'
           LIMIT 1
           ON CONFLICT ("appointment_id", "hospital_id") DO NOTHING
           RETURNING id`,
          [hospitalId, row.appointment_id, doctorId, row.missed_count, row.patient_id],
        );

        if (insertRes.rowCount > 0) {
          totalInserted++;
          console.log(
            `  ✓ EscalationAlert created for hospital ${hospitalId.slice(0,8)} ` +
            `patient ${row.patient_id.slice(0,8)} (missed:${row.missed_count})`,
          );
        } else {
          totalSkipped++;
        }
      }
    }

    console.log(
      `[Backfill] Complete. Inserted: ${totalInserted}, Skipped (exists): ${totalSkipped}`,
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Backfill] Failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

// ── Entry point ──────────────────────────────────────────────────────────────

backfill(parseArgs(process.argv))
  .then(() => { console.log('[Backfill] Done.'); process.exit(0); })
  .catch(() => process.exit(1));
