'use client';

import { Shield, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

import { useActionState, useState } from 'react';

import { adminLogin } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState = { message: '' };

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Premium glowing background gradients */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <Card className="w-full max-w-[420px] shadow-2xl border-slate-800/80 bg-slate-900/40 backdrop-blur-md text-slate-100 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <CardHeader className="text-center space-y-3 pb-6 pt-8">
          <div className="mx-auto w-16 h-16 bg-slate-800/85 border border-slate-700/50 rounded-2xl flex items-center justify-center shadow-lg mb-2 text-blue-500">
            <Shield className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-white">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Haspataal Platform Administration
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8">
          <form action={formAction} className="space-y-5" suppressHydrationWarning>
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-slate-300 font-semibold text-xs uppercase tracking-wider"
              >
                Username
              </Label>
              <div className="relative group" suppressHydrationWarning>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Admin username"
                  required
                  suppressHydrationWarning
                  className="pl-11 h-12 bg-slate-950/40 border-slate-800 text-slate-100 placeholder-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-slate-300 font-semibold text-xs uppercase tracking-wider"
              >
                Password
              </Label>
              <div className="relative group" suppressHydrationWarning>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Admin password"
                  required
                  suppressHydrationWarning
                  className="pl-11 pr-10 h-12 bg-slate-950/40 border-slate-800 text-slate-100 placeholder-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  suppressHydrationWarning
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" suppressHydrationWarning />
                  ) : (
                    <Eye className="h-4 w-4" suppressHydrationWarning />
                  )}
                </button>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-400 font-medium">
                  💡 Demo: <strong className="text-white">admin</strong> /{' '}
                  <strong className="text-white">{'<ADMIN_PASSWORD>'}</strong>
                </p>
              </div>
            )}

            {state?.message && (
              <div className="bg-red-950/40 text-red-400 p-4 rounded-xl border border-red-900/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="text-lg leading-none">⚠️</span>
                <p className="text-xs font-semibold">{state.message}</p>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                suppressHydrationWarning
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>Login as Admin</span>
                    <LogIn className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
