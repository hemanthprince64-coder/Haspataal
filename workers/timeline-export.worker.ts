import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const prisma = new PrismaClient();
const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// ─────────────────────────────────────────────────────────────
// FHIR R4 Bundle Generator
// ─────────────────────────────────────────────────────────────
function generateFHIRBundle(events: any[], patientId: string) {
  const entries = events.map((e) => {
    const resource: Record<string, any> = {
      resourceType: e.fhirResourceType ?? 'Observation',
      id: e.id,
      status: 'final',
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: e.timestamp.toISOString(),
      code: {
        coding: [{ display: e.title }],
        text: e.summary ?? e.title,
      },
    };

    if (e.fhirMapping) {
      Object.assign(resource, e.fhirMapping);
    }

    return {
      fullUrl: `${supabaseUrl}/fhir/${resource.resourceType}/${e.id}`,
      resource,
    };
  });

  return {
    resourceType: 'Bundle',
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: entries,
  };
}

// ─────────────────────────────────────────────────────────────
// HTML/PDF Formatter
// ─────────────────────────────────────────────────────────────
function generateHTMLExport(events: any[], patientId: string) {
  const rows = events
    .map(
      (e) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; font-size: 14px; color: #111827;">${e.timestamp.toLocaleDateString('en-IN')}</td>
      <td style="padding: 12px; font-size: 14px; color: #374151;"><strong>${e.category}</strong></td>
      <td style="padding: 12px; font-size: 14px; color: #111827;">${e.title}</td>
      <td style="padding: 12px; font-size: 14px; color: #4b5563;">${e.summary ?? ''}</td>
      <td style="padding: 12px; font-size: 14px; color: #6b7280;">${e.severity}</td>
    </tr>
  `,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Clinical Timeline Export - ${patientId}</title>
    </head>
    <body style="font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #1f2937;">
      <h1 style="border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Haspataal Patient Clinical Timeline</h1>
      <p>Patient ID: ${patientId}</p>
      <p>Generated: ${new Date().toLocaleString('en-IN')}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f3f4f6; text-align: left;">
            <th style="padding: 12px; font-weight: 600;">Date</th>
            <th style="padding: 12px; font-weight: 600;">Category</th>
            <th style="padding: 12px; font-weight: 600;">Title</th>
            <th style="padding: 12px; font-weight: 600;">Details</th>
            <th style="padding: 12px; font-weight: 600;">Severity</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

// ─────────────────────────────────────────────────────────────
// WORKER PROCESSOR
// ─────────────────────────────────────────────────────────────
async function processExportJob(job: Job) {
  const { id: jobId, patientId, format, filters } = job.data;

  try {
    await prisma.timelineExport.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    // 1. Fetch filtered events
    const where: any = { patientId, status: 'ACTIVE' };
    if (filters?.category) {
      where.category = { in: filters.category.split(',').map((c: string) => c.trim()) };
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.timestamp = {
        ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
      };
    }

    const events = await prisma.timelineEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    // 2. Generate content
    let content: string;
    let contentType: string;
    let fileExtension: string;

    if (format === 'FHIR') {
      content = JSON.stringify(generateFHIRBundle(events, patientId), null, 2);
      contentType = 'application/json';
      fileExtension = 'json';
    } else if (format === 'JSON') {
      content = JSON.stringify(events, null, 2);
      contentType = 'application/json';
      fileExtension = 'json';
    } else {
      // PDF format -> outputting HTML document which serves as premium export (and can be print-to-pdf)
      content = generateHTMLExport(events, patientId);
      contentType = 'text/html';
      fileExtension = 'html';
    }

    const filePath = `exports/${patientId}/${jobId}.${fileExtension}`;
    const buffer = Buffer.from(content, 'utf-8');

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('timeline-exports')
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 4. Generate Signed URL (24 hours expiry = 86400 seconds)
    const { data: signedData, error: signError } = await supabase.storage
      .from('timeline-exports')
      .createSignedUrl(filePath, 86400);

    if (signError) {
      throw signError;
    }

    // 5. Complete export record
    await prisma.timelineExport.update({
      where: { id: jobId },
      data: {
        status: 'DONE',
        fileUrl: signedData.signedUrl,
        fileSizeKb: parseFloat((buffer.length / 1024).toFixed(2)),
        completedAt: new Date(),
      },
    });

    console.log(`[Timeline Export Worker] ✓ Export complete for job ${jobId}`);
  } catch (err: any) {
    console.error(`[Timeline Export Worker] ✗ Export failed for job ${jobId}:`, err.message);

    await prisma.timelineExport.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errorMessage: err.message,
        completedAt: new Date(),
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────
// WORKER START
// ─────────────────────────────────────────────────────────────
export const timelineExportWorker = new Worker('timeline-export', processExportJob, {
  connection: redis,
  concurrency: 5,
});

timelineExportWorker.on('ready', () => {
  console.log('[Timeline Export Worker] Ready — listening on queue: timeline-export');
});
