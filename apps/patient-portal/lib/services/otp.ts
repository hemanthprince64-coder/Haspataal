import { randomInt } from 'crypto';

import prisma from '../util/prisma-singleton';

export type OtpChannel = 'SMS' | 'WHATSAPP' | 'EMAIL';

export interface SendOtpInput {
  phone: string;
  channel?: OtpChannel;
  ttlMinutes?: number;
}

export interface SendOtpResult {
  ok: boolean;
  maskedPhone: string;
  channel: OtpChannel;
  expiresAt: string;
  reason?: string;
}

const ttlMinutesDefault = 5;

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length <= 4) return '****';
  return `${digits.slice(0, 2)}****${digits.slice(-4)}`;
}

export async function sendOtp(input: SendOtpInput): Promise<SendOtpResult> {
  const phone = input.phone.replace(/\D/g, '').slice(-10);
  const channel = input.channel ?? 'SMS';
  const ttlMs = (input.ttlMinutes ?? ttlMinutesDefault) * 60 * 1000;
  const code = String(randomInt(0, 1000000)).padStart(6, '0');
  const expiresAt = new Date(Date.now() + ttlMs);

  try {
    await prisma.otpCode.upsert({
      where: { phone },
      create: { phone, code, expiresAt, channel, attempts: 0 },
      update: { code, expiresAt, channel, attempts: 0, verifiedAt: null },
    });

    return {
      ok: true,
      maskedPhone: maskPhone(phone),
      channel,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error: any) {
    const message = error?.message ?? String(error);

    // Graceful fallback when the SQLite datasource validator rejects a non-file URL,
    // or when the Prisma client cannot reach the datasource.
    const isDatasourceError =
      message.includes('URL must start with the protocol') ||
      message.includes('Invalid datasource') ||
      message.includes("Can't reach database server") ||
      message.includes('Server has closed the connection');

    if (isDatasourceError) {
      return {
        ok: false,
        maskedPhone: maskPhone(phone),
        channel,
        expiresAt: expiresAt.toISOString(),
        reason: `OTP generation skipped: ${message}`,
      };
    }

    throw error;
  }
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  try {
    const record = await prisma.otpCode.findUnique({ where: { phone } });
    if (!record || record.code !== code) return false;
    if (record.expiresAt < new Date()) return false;

    await prisma.otpCode.delete({ where: { phone } });
    return true;
  } catch (error: any) {
    const message = error?.message ?? String(error);
    const isDatasourceError =
      message.includes('URL must start with the protocol') ||
      message.includes('Invalid datasource') ||
      message.includes("Can't reach database server") ||
      message.includes('Server has closed the connection');

    if (isDatasourceError) {
      return false;
    }

    throw error;
  }
}
