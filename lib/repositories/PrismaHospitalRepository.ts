// ============================================================
// PrismaHospitalRepository — Prisma implementation
// ============================================================

import prisma from '../prisma';
import { HospitalType } from '@prisma/client';
import type {
  IHospitalRepository,
  HospitalRecord,
  RegisterHospitalInput,
} from './interfaces/IHospitalRepository';

export class PrismaHospitalRepository implements IHospitalRepository {
  async findById(id: string): Promise<HospitalRecord | null> {
    return prisma.hospitalsMaster.findUnique({
      where: { id },
      include: {
        facilities: true,
        services: true,
        departments: true,
      },
    }) as any;
  }

  async findByContactNumber(mobile: string): Promise<HospitalRecord | null> {
    return prisma.hospitalsMaster.findFirst({
      where: { contactNumber: mobile },
    }) as any;
  }

  async findAll(filters?: {
    city?: string;
    accountStatus?: string;
  }): Promise<HospitalRecord[]> {
    const where: any = {};
    if (filters?.accountStatus) where.accountStatus = filters.accountStatus;
    if (filters?.city) {
      where.city = { equals: filters.city, mode: 'insensitive' };
    }
    return prisma.hospitalsMaster.findMany({ where }) as any;
  }

  async findPending(): Promise<HospitalRecord[]> {
    return prisma.hospitalsMaster.findMany({
      where: { verificationStatus: 'pending' },
    }) as any;
  }

  async registerWithAdmin(
    input: RegisterHospitalInput
  ): Promise<HospitalRecord> {
    const regNumber = input.registrationNumber || `REG-${Date.now()}`;

    return prisma.$transaction(async (tx) => {
      const hospital = await tx.hospitalsMaster.create({
        data: {
          legalName: input.hospitalName,
          registrationNumber: regNumber,
          city: input.city,
          contactNumber: input.mobile,
          verificationStatus: 'pending',
          accountStatus: 'inactive',
          ...(input.type ? { type: input.type as HospitalType } : {}),
        },
      });

      // `password` is @ignore in the Prisma schema — must be set via raw SQL.
      if (input.hashedPassword) {
        await tx.$executeRaw`
          UPDATE hospitals_master SET password = ${input.hashedPassword} WHERE id = ${hospital.id}
        `;
      }

      await tx.hospitalAdmin.create({
        data: {
          hospitalId: hospital.id,
          fullName: input.adminName,
          mobile: input.mobile,
          email: `${input.mobile}@haspataal.in`,
          isPrimary: true,
          verificationStatus: 'pending',
        },
      });

      return hospital as any;
    });

  }

  async updateStatus(
    id: string,
    data: { verificationStatus?: string; accountStatus?: string }
  ): Promise<HospitalRecord> {
    return prisma.hospitalsMaster.update({
      where: { id },
      data,
    }) as any;
  }

  async adminExistsByMobile(mobile: string): Promise<boolean> {
    const admin = await prisma.hospitalAdmin.findUnique({
      where: { mobile },
    });
    return !!admin;
  }
}
