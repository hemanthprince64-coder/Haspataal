import { Pool } from 'pg';
import { EventService } from './event.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface HospitalConfig {
  hospital_id: string;
  specialities: string[];
  doctors: any[];
  bed_counts: { general: number; icu: number; private: number; semi: number };
  opd_timings: any;
  pricing: { opd_fees: number; ipd_rate: number; diag_markup: number };
}

export class HospitalConfigService {
  public static async savePartialConfig(hospitalId: string, step: number, configData: Partial<HospitalConfig>): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update Hospital table with JSONB config and onboarding_pct
      const pct = Math.min(step * 16.6, 99); // 6 steps, max 99% until activated
      
      await client.query(
        `
        UPDATE "Hospital" 
        SET 
          onboarding_pct = $1,
          audit_trail = jsonb_set(
            COALESCE(audit_trail, '{}'::jsonb), 
            '{config}', 
            COALESCE(audit_trail->'config', '{}'::jsonb) || $2::jsonb
          )
        WHERE id = $3
        `,
        [Math.round(pct), JSON.stringify(configData), hospitalId]
      );

      // Emit partial_setup_saved
      await EventService.publish('partial_setup_saved', { step, config: configData }, hospitalId);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public static async activateHospital(hospitalId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Set to 100% and verified_at if not already
      await client.query(
        `
        UPDATE "Hospital" 
        SET onboarding_pct = 100 
        WHERE id = $1
        `,
        [hospitalId]
      );

      // Emit hospital_activated
      await EventService.publish('hospital_activated', { activated_at: new Date() }, hospitalId);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public static async getConfig(hospitalId: string): Promise<any> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT onboarding_pct, audit_trail->'config' as config FROM "Hospital" WHERE id = $1`,
        [hospitalId]
      );
      if (res.rowCount === 0) return null;
      return {
        pct: res.rows[0].onboarding_pct,
        config: res.rows[0].config || {}
      };
    } finally {
      client.release();
    }
  }
}
