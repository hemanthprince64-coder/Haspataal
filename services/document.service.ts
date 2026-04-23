import { Pool } from 'pg';
import crypto from 'crypto';

// In a real scenario, this would use AWS SDK (S3Client, PutObjectCommand)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface DocumentMetadata {
  id: string;
  hospital_id: string;
  doc_type: string;
  s3_key: string;
  url: string;
  uploaded_at: Date;
  expires_at: Date | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
}

export class DocumentService {
  /**
   * Mocks S3 upload and saves metadata to DB.
   */
  public static async uploadDocument(
    hospitalId: string, 
    docType: string, 
    fileBuffer: Buffer, 
    mimetype: string
  ): Promise<DocumentMetadata> {
    const s3Key = `hospitals/${hospitalId}/documents/${docType}_${Date.now()}`;
    const mockUrl = `https://s3.mock.aws.com/${s3Key}`;

    // Here we would run: await s3Client.send(new PutObjectCommand({...}))

    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        INSERT INTO "HospitalDocuments" 
          (hospital_id, doc_type, s3_key, url, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING *;
        `,
        [hospitalId, docType, s3Key, mockUrl]
      );
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Utility to check for documents nearing expiry (e.g., 30 days).
   * Typically run via a Cron job.
   */
  public static async checkExpiries(): Promise<void> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        SELECT * FROM "HospitalDocuments"
        WHERE expires_at IS NOT NULL 
          AND expires_at <= NOW() + INTERVAL '30 days'
          AND status = 'approved';
        `
      );
      
      for (const doc of result.rows) {
        // Here we would integrate with EventService from Phase 1
        // EventService.publish('document_expiring_soon', { doc }, doc.hospital_id);
        console.log(`[DocumentService] Alert: Document ${doc.id} expiring soon.`);
      }
    } finally {
      client.release();
    }
  }
}
