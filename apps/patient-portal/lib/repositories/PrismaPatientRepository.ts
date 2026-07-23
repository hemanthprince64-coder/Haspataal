// ============================================================
// PrismaPatientRepository — Prisma implementation
// ============================================================
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import prisma from '../prisma';
import type {
  IPatientRepository,
  PatientRecord,
  EnsurePatientInput,
  RegisterPatientInput,
} from './interfaces/IPatientRepository';

export class PrismaPatientRepository implements IPatientRepository {
  async ensureExists(input: EnsurePatientInput): Promise<PatientRecord> {
    const hashedPassword = await bcrypt.hash(randomBytes(32).toString('base64url'), 12);
    return prisma.patient.upsert({
      where: { phone: input.mobile },
      update: { name: input.name },
      create: {
        phone: input.mobile,
        name: input.name,
        password: hashedPassword,
      },
    }) as unknown as PatientRecord;
  }

  async findByPhone(phone: string): Promise<PatientRecord | null> {
    return prisma.patient.findUnique({ where: { phone } }) as unknown as PatientRecord | null;
  }

  async findById(id: string): Promise<PatientRecord | null> {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return null;
    // Strip sensitive fields
    const { password: _password, ...safe } = patient as any;
    return safe as PatientRecord;
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
    }) as unknown as PatientRecord;
  }

  async updateProfile(id: string, updates: Partial<PatientRecord>): Promise<PatientRecord> {
    const { id: _id, phone: _phone, ...data } = updates;
    return prisma.patient.update({
      where: { id },
      data: data as any,
    }) as unknown as PatientRecord;
  }
}
