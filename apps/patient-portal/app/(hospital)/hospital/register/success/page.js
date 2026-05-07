'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterSuccessRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/hospital/dashboard/setup');
  }, [router]);
  return null;
}
