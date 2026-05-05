// ============================================================
// PrismaPatientRepository — Prisma implementation
// ============================================================

import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import type {
  IPatientRepository,
  PatientRecord,
  EnsurePatientInput,
  RegisterPatientInput,
} from './interfaces/IPatientRepository';

export class PrismaPatientRepository implements IPatientRepository {
  async ensureExists(input: EnsurePatientInput): Promise<PatientRecord> {
    const hashedPassword = await bcrypt.hash(Math.random().toString(36), 12);
    return prisma.patient.upsert({
      where: { phone: input.mobile },
      update: { name: input.name },
      create: {
        phone: input.mobile,
        name: input.name,
        password: hashedPassword,
      },
    });
  }

  async findByPhone(phone: string): Promise<PatientRecord | null> {
    return prisma.patient.findUnique({ where: { phone } });
  }

  async findById(id: string): Promise<PatientRecord | null> {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return null;
    // Strip sensitive fields
    const { password, ...safe } = patient as any;
    return safe;
  }

  async register(input: RegisterPatientInput): Promise<PatientRecord> {
    const hashedPassword = await bcrypt.hash(input.password, 12);
    return prisma.patient.upsert({
      where: { phone: input.mobile },
      update: {
        name: input.name,
        gender: input.gender,
        bloodGroup: input.bloodGroup,
        city: input.city,
        email: input.email,
        password: hashedPassword,
      },
      create: {
        phone: input.mobile,
        name: input.name,
        password: hashedPassword,
      },
    });
  }

  async updateProfile(id: string, updates: Partial<PatientRecord>): Promise<PatientRecord> {
    return prisma.patient.update({
      where: { id },
      data: updates,
    });
  }
}
