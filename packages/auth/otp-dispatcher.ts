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

    // Simulate a failure 10% of the time to test failovers in staging/dev
    if (process.env.NODE_ENV !== 'production' && Math.random() < 0.1) {
      throw new Error('MSG91 Network Timeout Simulated');
    }

    return true;
  }

  async sendTransactional(phone: string, message: string): Promise<boolean> {
    logger.info(
      { provider: 'MSG91', phone, length: message.length },
      'Production Transactional SMS sent via MSG91',
    );
    return true;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

export class FailoverSmsProvider implements ISmsProvider {
  private primary: ISmsProvider;
  private fallback: ISmsProvider;

  constructor(primary: ISmsProvider, fallback: ISmsProvider) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async sendOTP(phone: string, otp: string, purpose: string): Promise<boolean> {
    try {
      return await this.primary.sendOTP(phone, otp, purpose);
    } catch (e: any) {
      logger.warn(
        { error: e.message, phone, purpose, provider: 'primary' },
        'Primary SMS provider failed, falling back to secondary',
      );
      return await this.fallback.sendOTP(phone, otp, purpose);
    }
  }

  async sendTransactional(phone: string, message: string): Promise<boolean> {
    try {
      return await this.primary.sendTransactional(phone, message);
    } catch (e: any) {
      logger.warn(
        { error: e.message, phone, provider: 'primary' },
        'Primary SMS provider failed, falling back to secondary',
      );
      return await this.fallback.sendTransactional(phone, message);
    }
  }

  async healthCheck(): Promise<boolean> {
    const primaryHealth = await this.primary.healthCheck().catch(() => false);
    if (primaryHealth) return true;

    logger.warn('Primary SMS provider health check failed. Checking fallback.');
    return await this.fallback.healthCheck().catch(() => false);
  }
}

export class SmsFactory {
  private static instance: ISmsProvider;

  static getProvider(): ISmsProvider {
    if (!this.instance) {
      if (process.env.NODE_ENV === 'production') {
        // In production, use MSG91 as primary, TextBee as fallback
        this.instance = new FailoverSmsProvider(new MSG91Provider(), new TextBeeProvider());
      } else {
        // In development, TextBee is fine, but we can also use Failover to test it
        this.instance = new FailoverSmsProvider(new MSG91Provider(), new TextBeeProvider());
      }
    }
    return this.instance;
  }
}
