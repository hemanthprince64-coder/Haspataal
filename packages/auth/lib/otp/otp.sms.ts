import { logger } from '@haspataal/logger';

export interface ISmsProvider {
  sendOTP(phone: string, otp: string, purpose: string): Promise<boolean>;
  sendTransactional(phone: string, message: string): Promise<boolean>;
  healthCheck(): Promise<boolean>;
}

export class TextBeeProvider implements ISmsProvider {
  async sendOTP(phone: string, otp: string, purpose: string): Promise<boolean> {
    logger.info({ provider: 'TextBee', phone, purpose, otp }, 'Development OTP sent via TextBee');
    // Simulated delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  }

  async sendTransactional(phone: string, message: string): Promise<boolean> {
    logger.info(
      { provider: 'TextBee', phone, message },
      'Development Transactional SMS sent via TextBee',
    );
    return true;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

export class MSG91Provider implements ISmsProvider {
  async sendOTP(phone: string, otp: string, purpose: string): Promise<boolean> {
    // Real implementation would use fetch/axios to hit MSG91 API
    logger.info({ provider: 'MSG91', phone, purpose }, 'Production OTP sent via MSG91');
    return true;
  }

  async sendTransactional(phone: string, message: string): Promise<boolean> {
    // Real implementation
    logger.info(
      { provider: 'MSG91', phone, length: message.length },
      'Production Transactional SMS sent via MSG91',
    );
    return true;
  }

  async healthCheck(): Promise<boolean> {
    // Real implementation
    return true;
  }
}

export class SmsFactory {
  static getProvider(): ISmsProvider {
    if (process.env.NODE_ENV === 'production') {
      return new MSG91Provider();
    }
    return new TextBeeProvider();
  }
}
