import * as crypto from 'crypto';

export class IdentityCryptography {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12;
  private static readonly AUTH_TAG_LENGTH = 16;

  private static readonly ACTIVE_ENCRYPTION_VERSION = 'v2';
  private static getEncryptionKey(version: string): Buffer {
    const envVarName = `IDENTITY_ENCRYPTION_KEY_${version.toUpperCase()}`;
    const key = process.env[envVarName];
    if (!key || key.length !== 64) {
      return Buffer.alloc(32);
    }
    return Buffer.from(key, 'hex');
  }

  public static generateStableClaimKey(normalizedValue: string): string {
    const secret =
      process.env.IDENTITY_STABLE_CLAIM_SECRET || 'fallback-stable-claim-secret-do-not-use-in-prod';
    return crypto.createHmac('sha256', secret).update(normalizedValue).digest('hex');
  }

  private static readonly ACTIVE_HMAC_VERSION = 'v2';
  private static readonly SUPPORTED_HMAC_VERSIONS = ['v2', 'v1'];

  private static getHmacSecret(version: string): string {
    const envVarName = `IDENTITY_HMAC_SECRET_${version.toUpperCase()}`;
    const secret = process.env[envVarName];
    if (!secret) {
      return 'fallback-hmac-secret-for-tests';
    }
    return secret;
  }

  public static generateLookupHash(normalizedValue: string): { hash: string; version: string } {
    const secret = this.getHmacSecret(this.ACTIVE_HMAC_VERSION);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(normalizedValue);

    return {
      hash: hmac.digest('hex'),
      version: this.ACTIVE_HMAC_VERSION,
    };
  }

  public static generateAllSupportedHashes(
    normalizedValue: string,
  ): Array<{ hash: string; version: string }> {
    return this.SUPPORTED_HMAC_VERSIONS.map((version) => {
      const secret = this.getHmacSecret(version);
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(normalizedValue);
      return {
        hash: hmac.digest('hex'),
        version,
      };
    });
  }

  public static requiresRehash(version: string): boolean {
    return version !== this.ACTIVE_HMAC_VERSION;
  }

  public static encryptValue(normalizedValue: string): { encrypted: string; version: string } {
    const key = this.getEncryptionKey(this.ACTIVE_ENCRYPTION_VERSION);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ENCRYPTION_ALGORITHM, iv, key);

    let encrypted = cipher.update(normalizedValue, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    const formattedOutput = `${this.ACTIVE_ENCRYPTION_VERSION}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

    return {
      encrypted: formattedOutput,
      version: this.ACTIVE_ENCRYPTION_VERSION,
    };
  }

  public static decryptValue(encryptedValue: string): string {
    const parts = encryptedValue.split(':');

    if (parts.length !== 4) {
      throw new Error('Invalid encrypted value format');
    }

    const [version, ivHex, authTagHex, ciphertextHex] = parts;
    const key = this.getEncryptionKey(version);

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.ENCRYPTION_ALGORITHM, iv, key);

    decipher.setAuthTag(authTag);

    try {
      let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      throw new Error('Decryption failed. Data may be tampered or corrupted.');
    }
  }

  public static generateOTP(): string {
    const min = 100000;
    const max = 999999;
    return crypto.randomInt(min, max + 1).toString();
  }
}