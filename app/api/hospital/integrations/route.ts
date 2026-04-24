import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';
import { createCipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY ?? '').padEnd(32, '0').slice(0, 32);

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const configs = await prisma.integrationConfig.findMany({
    where: { hospitalId },
    select: { id: true, provider: true, isActive: true, isLive: true }
  });

  return NextResponse.json({ configs });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { provider, config, isActive } = body;

  // Encrypt sensitive config
  const encryptedConfig = encrypt(JSON.stringify(config));

  const integration = await prisma.integrationConfig.upsert({
    where: { hospitalId_provider: { hospitalId, provider } },
    update: {
      encryptedConfig: encryptedConfig as any,
      isActive: isActive ?? true,
      lastTestedAt: new Date(),
    },
    create: {
      hospitalId,
      provider,
      encryptedConfig: encryptedConfig as any,
      isActive: isActive ?? true,
      lastTestedAt: new Date(),
    }
  });

  return NextResponse.json({ ok: true });
}
