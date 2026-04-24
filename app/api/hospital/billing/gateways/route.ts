import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY ?? '').padEnd(32, '0').slice(0, 32);

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const [ivHex, encHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}

const gatewaySchema = z.object({
  provider: z.enum(['RAZORPAY', 'STRIPE', 'CASH', 'UPI']),
  config: z.record(z.string()),
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

  // Encrypt sensitive config
  const encryptedConfig = config['Key ID'] || config['Publishable Key'] || config['VPA Address']
    ? encrypt(JSON.stringify(config))
    : null;

  await prisma.paymentGateway.upsert({
    where: { hospitalId_provider: { hospitalId, provider } },
    update: { encryptedKey: encryptedConfig, isLive, isActive: true },
    create: { hospitalId, provider, encryptedKey: encryptedConfig, isLive, isActive: true },
  });

  return NextResponse.json({ ok: true });
}
