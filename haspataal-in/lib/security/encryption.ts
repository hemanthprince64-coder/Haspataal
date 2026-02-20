
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Ensure ENCRYPTION_KEY is 32 bytes (64 hex characters)
const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex'); // Dev fallback

if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
    console.warn('WARNING: ENCRYPTION_KEY not set in production!');
}

export function encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(text: string): string {
    const parts = text.split(':');
    if (parts.length !== 3) return text; // Not encrypted or invalid format

    const [ivHex, authTagHex, encryptedHex] = parts;
    const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
