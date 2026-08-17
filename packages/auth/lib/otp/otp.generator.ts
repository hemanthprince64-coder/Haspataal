import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 10;
const OTP_LENGTH = 6;

export class OtpGenerator {
  /**
   * Generates a random numeric OTP of specified length.
   */
  static generatePlaintextOtp(length: number = OTP_LENGTH): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return crypto.randomInt(min, max + 1).toString();
  }

  /**
   * Hashes the plaintext OTP using bcrypt.
   */
  static async hashOtp(plaintextOtp: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(plaintextOtp, salt);
  }

  /**
   * Compares a plaintext OTP against a bcrypt hash.
   */
  static async verifyOtp(plaintextOtp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintextOtp, hash);
  }
}
