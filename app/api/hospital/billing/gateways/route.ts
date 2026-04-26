import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function encryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY_REQUIRED');
  }
  return key.slice(0, 32);
}

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(encryptionKey()), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const [ivHex, encHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey()), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}

const gatewaySchema = z.object({
  provider: z.enum(['RAZORPAY', 'STRIPE', 'CASH', 'UPI']),
  config: z.record(z.string(), z.string()),
  isLive: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gateways = await prisma.paymentGateway.findMany({
    where: { hospitalId },
    select: { id: true, provider: true, isLive: true, isActive: true, lastTestedAt: true },
    // NOTE: Never return encrypted keys in GET
  });

  return NextResponse.json({ gateways });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = gatewaySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 });

  const { provider, config, isLive } = parsed.data;

  let encryptedConfig: string | null;
  try {
    encryptedConfig = Object.keys(config).length ? encrypt(JSON.stringify(config)) : null;
  } catch (error) {
    if (error instanceof Error && error.message === 'ENCRYPTION_KEY_REQUIRED') {
      return NextResponse.json({ error: 'ENCRYPTION_KEY must be configured with at least 32 characters' }, { status: 500 });
    }
    throw error;
  }

  await prisma.paymentGateway.upsert({
    where: { hospitalId_provider: { hospitalId, provider } },
    update: { encryptedKey: encryptedConfig, isLive, isActive: true },
    create: { hospitalId, provider, encryptedKey: encryptedConfig, isLive, isActive: true },
  });

  return NextResponse.json({ ok: true });
}
