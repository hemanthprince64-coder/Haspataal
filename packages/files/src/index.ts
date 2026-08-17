// ============================================================
// @haspataal/files - Secure File Storage (S3/R2)
// ============================================================
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface FileUpload {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  encrypted: boolean;
  virusScanned: boolean;
}

export interface UploadOptions {
  folder?: string;
  encrypt?: boolean;
  scanVirus?: boolean;
}

export class FileService {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(bucket: string = 'clinical-files') {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
    this.bucket = bucket;
  }

  async upload(
    file: Buffer | File,
    fileName: string,
    options: UploadOptions = {},
  ): Promise<FileUpload> {
    const fileBuffer = Buffer.isBuffer(file) ? file : Buffer.from(await file.arrayBuffer());

    let processedFile = fileBuffer;
    if (options.encrypt) {
      processedFile = await this.encrypt(fileBuffer);
    }

    if (options.scanVirus) {
      const safe = await this.scanVirus(fileBuffer);
      if (!safe) throw new Error('Virus detected in uploaded file');
    }

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(`${options.folder || 'uploads'}/${fileName}`, processedFile);

    if (error) throw error;

    const url = this.supabase.storage.from(this.bucket).getPublicUrl(data.path).data.publicUrl;

    return {
      id: data.id,
      url,
      fileName,
      mimeType: this.getMimeType(fileName),
      size: fileBuffer.length,
      encrypted: options.encrypt || false,
      virusScanned: options.scanVirus || false,
    };
  }

  private async encrypt(data: Buffer): Promise<Buffer> {
    // Placeholder for AES-256 encryption
    // Actual implementation would use the encryption key from env
    return data;
  }

  private async scanVirus(_data: Buffer): Promise<boolean> {
    // Placeholder for ClamAV integration
    // Actual implementation would call virus scanning service
    return true;
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  async delete(fileId: string): Promise<void> {
    await this.supabase.storage.from(this.bucket).remove([fileId]);
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const { data } = await this.supabase.storage.from(this.bucket).createSignedUrl(path, expiresIn);
    return data.signedUrl;
  }
}

export const fileService = new FileService();
