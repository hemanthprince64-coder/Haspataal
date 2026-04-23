import { Pool } from 'pg';
import { EventService } from './event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class MigrationService {
  /**
   * Imports a batch of patients. Up to 500 rows.
   * If any row in the batch triggers a DB error (e.g. strict constraint violation),
   * the entire batch rolls back, but it doesn't crash the migration process.
   */
  public static async importPatientsBatch(hospitalId: string, mappedRows: any[]): Promise<{ inserted: number, duplicates: number, errors: number }> {
    if (mappedRows.length === 0) return { inserted: 0, duplicates: 0, errors: 0 };
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Set RLS scope
      await client.query(`SET LOCAL app.hospital_id = $1`, [hospitalId]);

      let insertedCount = 0;
      let duplicateCount = 0;

      // We use a prepared statement loop or unnest for batch inserts.
      // For simplicity in this implementation, we construct a parameterized query.
      for (const row of mappedRows) {
        if (!row.name || (!row.phone && !row.dob)) continue;

        try {
          // Attempt insert. We use ON CONFLICT DO NOTHING to skip exact matches.
          // Note: In real PostgreSQL, we'd need a UNIQUE constraint on (hospital_id, phone, name) or similar.
          // Assuming we enforce uniqueness via app logic or DB index:
          const result = await client.query(
            `
            INSERT INTO "Patient" (hospital_id, name, phone, dob, abha_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
            RETURNING id;
            `,
            [hospitalId, row.name, row.phone || null, row.dob || null, row.abha_id || null]
          );

          if (result.rowCount === 0) {
            duplicateCount++;
          } else {
            insertedCount++;
          }
        } catch (err) {
          // Inner catch so a single malformed row doesn't break the JS loop,
          // though PostgreSQL might abort the transaction if it's a hard error.
          // To be perfectly safe with PG transactions, we could use SAVEPOINTs per row,
          // but that's slow. We assume data is pre-validated by `validateRow` utils.
          throw err; // Escalate to batch rollback
        }
      }

      await client.query('COMMIT');
      return { inserted: insertedCount, duplicates: duplicateCount, errors: 0 };

    } catch (error) {
      // Entire batch failed
      await client.query('ROLLBACK');
      console.error(`[MigrationService] Batch failed for hospital ${hospitalId}`, error);
      return { inserted: 0, duplicates: 0, errors: mappedRows.length };
    } finally {
      client.release();
    }
  }

  /**
   * Finalizes the migration session and emits the event.
   */
  public static async finalizeMigration(hospitalId: string, totalRows: number, sourceType: string): Promise<void> {
    await EventService.publish('data_imported', { row_count: totalRows, source_type: sourceType }, hospitalId);
  }
}
