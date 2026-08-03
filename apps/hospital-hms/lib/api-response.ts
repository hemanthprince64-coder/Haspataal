import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    currentVersion?: number;
  } | null;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

export function successResponse<T>(data: T, status = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    meta: {
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
  };
  return NextResponse.json(response, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 500,
  currentVersion?: number,
) {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(currentVersion !== undefined && { currentVersion }),
    },
    meta: {
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
  };
  return NextResponse.json(response, { status });
}
