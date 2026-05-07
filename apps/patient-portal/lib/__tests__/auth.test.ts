import { describe, it, expect, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt, createSession, verifySession } from '../session';
import { requireRole } from '../auth/requireRole';
import { UserRole } from '../../types';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock session module
vi.mock('../session', async (importOriginal) => {
  const original = await importOriginal<typeof import('../session')>();
  return {
    ...original,
    verifySession: vi.fn(),
  };
});

describe('Authentication & Security Logic', () => {
  describe('Bcrypt Password Hashing', () => {
    it('should correctly hash and verify a password (round-trip)', async () => {
      const password = 'SuperSecretPassword123!';
      const hash = await bcrypt.hash(password, 10);
      
      expect(hash).not.toBe(password);
      const isMatch = await bcrypt.compare(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'CorrectPassword';
      const wrongPassword = 'WrongPassword';
      const hash = await bcrypt.hash(password, 10);
      
      const isMatch = await bcrypt.compare(wrongPassword, hash);
      expect(isMatch).toBe(false);
    });
  });

  describe('JWT Session Management (jose)', () => {
    it('should encrypt and decrypt a session payload correctly', async () => {
      const payload = {
        user: { id: 'user-123', name: 'Test User', role: UserRole.PATIENT },
      };
      
      const token = await encrypt(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decrypted = await decrypt(token);
      expect(decrypted).toMatchObject(payload);
    });

    it('should return null for an invalid or tampered token', async () => {
      const invalidToken = 'this.is.not.a.valid.jwt.token';
      const result = await decrypt(invalidToken);
      expect(result).toBeNull();
    });
  });

  describe('RBAC Middleware (requireRole)', () => {
    it('should allow access when roles match', async () => {
      // Mock verifySession to return a valid session
      vi.mocked(verifySession).mockResolvedValueOnce({
        isAuth: true,
        user: { id: 'admin-1', name: 'Admin', role: UserRole.HOSPITAL_ADMIN },
      } as any);

      const user = await requireRole(UserRole.HOSPITAL_ADMIN, 'session_user');
      expect(user.id).toBe('admin-1');
    });

    it('should throw FORBIDDEN when roles do not match', async () => {
      vi.mocked(verifySession).mockResolvedValueOnce({
        isAuth: true,
        user: { id: 'patient-1', name: 'Patient', role: UserRole.PATIENT },
      } as any);

      await expect(requireRole(UserRole.HOSPITAL_ADMIN, 'session_user'))
        .rejects.toThrow('FORBIDDEN');
    });

    it('should throw UNAUTHORIZED when no session exists', async () => {
      vi.mocked(verifySession).mockResolvedValueOnce(null);

      await expect(requireRole(UserRole.PATIENT, 'session_patient'))
        .rejects.toThrow('UNAUTHORIZED');
    });
  });
});
