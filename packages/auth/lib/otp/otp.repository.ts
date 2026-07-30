import { prisma } from '@haspataal/db';

export class OtpRepository {
  /**
   * Find the currently active, unverified, unexpired OTP for the given tenant/phone/purpose combo.
   */
  static async findActive(phone: string, purpose: string, tenantId: string | null) {
    return prisma.otpCode.findUnique({
      where: {
        tenantId_phone_purpose: {
          tenantId: tenantId ?? '',
          phone,
          purpose,
        },
      },
    });
  }

  /**
   * Insert a new OTP row (relies on prior invalidation if unique constraint exists,
   * or uses upsert to replace it).
   */
  static async upsert(
    phone: string,
    purpose: string,
    tenantId: string | null,
    otpHash: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return prisma.otpCode.upsert({
      where: {
        tenantId_phone_purpose: {
          tenantId: tenantId ?? '',
          phone,
          purpose,
        },
      },
      update: {
        otpHash,
        expiresAt,
        attemptCount: 0,
        verified: false,
        verifiedAt: null,
        ipAddress,
        userAgent,
        createdAt: new Date(),
      },
      create: {
        phone,
        purpose,
        tenantId: tenantId ?? '',
        otpHash,
        expiresAt,
        attemptCount: 0,
        verified: false,
        ipAddress,
        userAgent,
      },
    });
  }

  static async incrementAttempts(id: string, attemptCount: number) {
    return prisma.otpCode.update({
      where: { id },
      data: { attemptCount },
    });
  }

  static async markVerified(id: string) {
    return prisma.otpCode.update({
      where: { id },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });
  }

  static async invalidate(id: string) {
    return prisma.otpCode.delete({
      where: { id },
    });
  }
}
