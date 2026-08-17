import * as Sentry from '@sentry/nextjs';

import { cookies } from 'next/headers';

import { decrypt } from './session';

type ActionFunc<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

/**
 * Higher-Order Function to wrap Server Actions with Sentry error monitoring.
 * Catches unhandled exceptions, attaches user context, and returns a sanitized errorId.
 */
export function withErrorMonitoring<TArgs extends unknown[], TResult>(
  actionName: string,
  action: ActionFunc<TArgs, TResult>,
): ActionFunc<TArgs, TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await action(...args);
    } catch (e: unknown) {
      let userId = 'anonymous';
      let userRole = 'guest';

      try {
        const sessionToken = (await cookies()).get('session_user')?.value;
        if (sessionToken) {
          const session = await decrypt(sessionToken);
          userId = (session?.user?.id as string) || 'anonymous';
          userRole = (session?.user?.role as string) || 'guest';
        }
      } catch {
        // Session decryption failed or cookies unavailable in this context
      }

      if (e instanceof Error) {
        // Capture exception with context
        const errorId = Sentry.captureException(e, {
          tags: {
            action: actionName,
            userId,
            userRole,
          },
          extra: {
            args: args, // Safely attaching args might expose PII, handle with care or redact in beforeSend
          },
        });

        // Return a standardized error structure instead of leaking internals
        return {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Reference ID: ' + errorId,
          errorId,
        } as unknown as TResult;
      }
      
      // Fallback for non-Error throws
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      } as unknown as TResult;
    }
  };
}
