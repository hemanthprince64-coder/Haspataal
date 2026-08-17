/* eslint-disable @typescript-eslint/no-unused-vars */
import { randomInt } from 'crypto';

import prisma from '@/lib/prisma';

const ttlMinutesDefault = 5;

export async function sendOtp(phone: string) {
  const code = String(randomInt(0, 1000000)).padStart(6, '0');
  const expiresAt = new Date(Date.now() + ttlMinutesDefault * 60 * 1000);

  if (process.env.NODE_ENV === 'development' && process.env.LOG_OTP === '1') {
    process.stdout.write(`[OTP_DEV] code=${code} expiresAt=${expiresAt.toISOString()}\n`);
  }

  try {
    await prisma.otpCode.upsert({
      where: { phone: phone.replace(/\D/g, '').slice(-10) },
      create: { phone: phone.replace(/\D/g, '').slice(-10), code, expiresAt } as any,
      update: { code, expiresAt } as any,
    });
    return { ok: true };
  } catch (error: any) {
    const message = error?.message ?? String(error);
    const isDatasourceError =
      message.includes('URL must start with the protocol') ||
      message.includes('Invalid datasource') ||
      message.includes("Can't reach database server");
    if (isDatasourceError) {
      return { ok: false, reason: message };
    }
    throw error;
  }
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  try {
    const record = await prisma.otpCode.findUnique({
      where: { phone: phone.replace(/\D/g, '').slice(-10) },
    });
    if (!record || record.code !== code) return false;
    if (record.expiresAt < new Date()) return false;
    await prisma.otpCode.delete({ where: { phone: phone.replace(/\D/g, '').slice(-10) } });
    return true;
  } catch (error: any) {
    return false;
  }
}
