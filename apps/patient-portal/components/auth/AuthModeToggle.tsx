import { Sparkles } from 'lucide-react';

import React from 'react';

export type AuthMode = 'password' | 'otp';

export interface AuthModeToggleProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthModeToggle({ mode, onModeChange }: AuthModeToggleProps) {
  return (
    <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200/50">
      <button
        type="button"
        onClick={() => onModeChange('password')}
        className={`py-2 text-xs font-bold rounded-lg transition-all ${
          mode === 'password'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        Password Login
      </button>
      <button
        type="button"
        onClick={() => onModeChange('otp')}
        className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
          mode === 'otp'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Sparkles className="h-3 w-3 text-amber-500" /> Magic OTP Login
      </button>
    </div>
  );
}
