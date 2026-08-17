'use client';

import { Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function PrintButton({
  className = '',
  children = 'Print',
  variant = 'default',
  size = 'default',
}: {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  return (
    <Button
      variant={variant}
      size={size}
      className={`print:hidden ${className}`}
      onClick={() => window.print()}
    >
      <Printer className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );
}
