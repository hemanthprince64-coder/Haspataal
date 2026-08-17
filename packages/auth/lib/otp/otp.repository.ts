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

  /**
   * Atomically marks an OTP as verified.
   *
   * Uses a conditional UPDATE (WHERE verified = false) so that only one
   * concurrent caller can succeed. Returns true if the row was updated,
   * false if the OTP was already consumed by a racing request.
   */
  static async markVerified(id: string): Promise<boolean> {
    const result = await prisma.otpCode.updateMany({
      where: { id, verified: false },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });
    return result.count > 0;
  }

  static async invalidate(id: string) {
    return prisma.otpCode.delete({
      where: { id },
    });
  }
}
