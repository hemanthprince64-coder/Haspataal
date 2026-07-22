/* eslint-disable */
import { IntegrationProvider } from '@prisma/client';
import { randomBytes, createCipheriv } from 'crypto';
import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';

import {
  hospitalAccessError,
  requireHospitalAccess,
  writeAuditLog,
} from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/prisma';

const providerEnum = z
  .enum([
    'RAZORPAY',
    'WHATSAPP_META',
    'WHATSAPP_TWILIO',
    'WHATSAPP_WATI',
    'WHATSAPP_INTERAKT',
    'WHATSAPP_GUPSHUP',
    'SMS_FAST2SMS',
    'SMS_MSG91',
    'SMS_TEXTLOCAL',
    'SMS_2FACTOR',
    'ABHA_ABDM',
    'GOOGLE_CALENDAR',
  ])
  .meta({ description: 'Supported integration providers' });

const integrationSchema = z
  .object({
    provider: providerEnum,
    config: z.record(z.string(), z.unknown()).default({}),
    isActive: z.boolean().default(true),
    isLive: z.boolean().default(false),
    testMode: z.boolean().default(true),
    webhookUrl: z.string().url().optional(),
    webhookSecret: z.string().optional(),
    scope: z.array(z.string()).default([]),
  })
  .strict();

function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) return null;
  return key.slice(0, 32);
}

function encrypt(text: string): string {
  const encryptionKey = getEncryptionKey();
  if (!encryptionKey) throw new Error('ENCRYPTION_KEY must be at least 32 characters');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('integrations', 'read');
  } catch (error) {
    return hospitalAccessError(error);
  }

  const configs = await prisma.integrationConfig.findMany({
    where: { hospitalId: access.hospitalId },
    select: {
      id: true,
      provider: true,
      isActive: true,
      isLive: true,
      testMode: true,
      webhookUrl: true,
      scope: true,
    },
  });

  return NextResponse.json({ configs });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess('integrations', 'update');
  } catch (error) {
    return hospitalAccessError(error);
  }

  if (!getEncryptionKey()) {
    return NextResponse.json(
      { error: 'ENCRYPTION_KEY must be at least 32 characters' },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = integrationSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 },
    );

  const { provider, config, isActive, isLive, testMode, webhookUrl, webhookSecret, scope } =
    parsed.data;

  const encryptedConfig = encrypt(JSON.stringify(config));

  const integration = await prisma.integrationConfig.upsert({
    where: { hospitalId_provider: { hospitalId: access.hospitalId, provider } },
    update: {
      encryptedConfig: encryptedConfig as any,
      isActive,
      isLive,
      testMode,
      webhookUrl,
      webhookSecret,
      scope,
      lastTestedAt: new Date(),
    },
    create: {
      hospitalId: access.hospitalId,
      provider,
      encryptedConfig: encryptedConfig as any,
      isActive,
      isLive,
      testMode,
      webhookUrl,
      webhookSecret,
      scope,
      lastTestedAt: new Date(),
    },
  });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: 'integration.upsert',
    entity: 'IntegrationConfig',
    entityId: integration.id,
    details: { provider, isActive, isLive, testMode },
  });

  return NextResponse.json({ ok: true, id: integration.id });
}
