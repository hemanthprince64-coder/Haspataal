// ============================================================
// RegisterHospitalUseCase — Hospital onboarding business logic
// ============================================================
import bcrypt from 'bcryptjs';

import { emitEvent } from '@/services/event-emitter';

import logger from '../../logger';
import type {
  IHospitalRepository,
  HospitalRecord,
} from '../../repositories/interfaces/IHospitalRepository';

export interface RegisterHospitalInput {
  hospitalName: string;
  city: string;
  adminName: string;
  mobile: string;
  password: string;
  registrationNumber?: string;
}

export class DuplicateMobileError extends Error {
  constructor() {
    super('MOBILE_ALREADY_REGISTERED');
    this.name = 'DuplicateMobileError';
  }
}

export class RegisterHospitalUseCase {
  constructor(private hospitalRepo: IHospitalRepository) {}

  async execute(input: RegisterHospitalInput): Promise<HospitalRecord> {
    logger.info(
      { action: 'hospital_register', hospitalName: input.hospitalName },
      'Registering new hospital',
    );

    if (!input.password) throw new Error('PASSWORD_REQUIRED');

    // 1. Pre-check: reject duplicate mobile before entering transaction
    const exists = await this.hospitalRepo.adminExistsByMobile(input.mobile);
    if (exists) {
      logger.warn(
        { action: 'hospital_register_duplicate', mobile: input.mobile },
        'Duplicate mobile on hospital registration',
      );
      throw new DuplicateMobileError();
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // 3. Create hospital + admin in transaction
    const hospital = await this.hospitalRepo.registerWithAdmin({
      hospitalName: input.hospitalName,
      city: input.city,
      adminName: input.adminName,
      mobile: input.mobile,
      hashedPassword,
      registrationNumber: input.registrationNumber,
    });

    // 4. Emit event (fire-and-forget, outside tx)
    void emitEvent({
      eventType: 'hospital_registered',
      hospitalId: hospital.id,
      payload: {
        hospitalName: input.hospitalName,
        city: input.city,
        adminName: input.adminName,
      },
    });

    return hospital;
  }
}
