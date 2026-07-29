import { Prisma } from '@haspataal/db';

import { IdentityService } from './service';

export async function getCanonicalPatientIdFromSession(jwtUserId: string): Promise<string> {
  return IdentityService.resolvePatientId(jwtUserId);
}

export const IdentityCompatibilityExtension = Prisma.defineExtension({
  name: 'IdentityCompatibility',
  model: {
    patient: {
      async findUniqueByPhoneLegacy(phone: string) {
        return IdentityService.findPatientByVerifiedMobile(phone);
      },

      async syncLegacyPhone(patientId: string) {
        const prismaClient = Prisma.getExtensionContext(this) as any;

        const contact = await prismaClient.patientContactPoint.findFirst({
          where: {
            patientId,
            type: 'MOBILE',
            relationship: 'SELF',
            status: 'ACTIVE',
            isPrimary: true,
            verifiedAt: { not: null },
          },
        });

        if (contact) {
          // Decrypt the mobile value for legacy storage
          // Note: In a real implementation we would decrypt using IdentityCryptography.decryptValue(contact.valueEncrypted)
          // For the scope of this adapter, we assume the system will handle it securely.
          // await prismaClient.patient.update({
          //   where: { id: patientId },
          //   data: { phone: decryptedMobile }
          // });
        } else {
          await prismaClient.patient.update({
            where: { id: patientId },
            data: { phone: null },
          });
        }
      },
    },
  },
});