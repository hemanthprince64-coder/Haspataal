/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from './auth/jwt';

function parseJsonHeader<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getBearerToken(req: NextRequest | Request) {
  const authorization = req.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) return authorization.slice('Bearer '.length);
  return (req as NextRequest).cookies?.get?.('auth-token')?.value ?? null;
}

export async function createPlatformQueryContext(req: NextRequest | Request) {
  const token = getBearerToken(req);
  if (!token) throw new Error('Unauthorized: missing platform context');

  const user = await verifyToken(token);
  
  const tenantScope = {
    platformId: 'haspataal-core',
    hospitalId: user.hospital_id,
    branchId: 'default',
    activeScope: 'HOSPITAL' as const,
  };
  
  const actorScope = {
    actorId: user.user_id,
    actorType: 'USER' as const,
    userId: user.user_id,
    roleIds: user.role ? [user.role] : [],
    permissionIds: [],
    authenticationStrength: 'PASSWORD' as const,
    delegatedAccess: false,
  };

  return {
    tenantScope,
    actorScope,
    resourceAuthorization: {
      tenantScope: 'HOSPITAL' as const,
      resourceScope: 'GLOBAL' as const,
      consentGranted: true,
      purposeOfUse: 'CLINICAL' as const,
      emergencyOverride: false,
      breakGlassStatus: false,
    },
    correlationId: req.headers.get('x-correlation-id') || uuidv4(),
  };
}