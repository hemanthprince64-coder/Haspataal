'use client';

import { Phone, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

import React, { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ActionResult } from '../OtpFlow/useOtpVerification';

export interface PasswordFlowProps {
  loginAction: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  identifierName?: string;
  identifierLabel?: string;
  identifierType?: 'tel' | 'text';
  identifierPlaceholder?: string;
  identifierIcon?: React.ElementType;
  initialIdentifier?: string;
  onIdentifierChange?: (val: string) => void;
}

export function PasswordFlow({
  loginAction,
  identifierName = 'mobile',
  identifierLabel = 'Mobile Number',
  identifierType = 'tel',
  identifierPlaceholder = 'Registered mobile number',
  identifierIcon: IdentifierIcon = Phone,
  initialIdentifier = '',
  onIdentifierChange,
}: PasswordFlowProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const [identifier, setIdentifier] = useState(initialIdentifier);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value;
    if (identifierType === 'tel') {
      newVal = newVal.replace(/\D/g, '');
    }
    setIdentifier(newVal);
    if (onIdentifierChange) onIdentifierChange(newVal);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await loginAction(null, formData);
        if (res && res.message) {
          setError(res.message);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
          return;
        }
        setError('Invalid credentials or connection issue.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={identifierName} className="text-slate-700 font-semibold text-xs">
            {identifierLabel}
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <IdentifierIcon className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Input
              id={identifierName}
              name={identifierName}
              type={identifierType}
              required
              className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all"
              placeholder={identifierPlaceholder}
              value={identifier}
              onChange={handleIdentifierChange}
              maxLength={identifierType === 'tel' ? 10 : undefined}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-700 font-semibold text-xs">
            Password
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="pl-11 pr-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            Login with Password <LogIn className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
