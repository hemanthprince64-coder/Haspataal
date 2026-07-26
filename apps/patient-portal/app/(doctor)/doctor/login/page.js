'use client';

import { Phone, Lock, Eye, EyeOff, LogIn, Stethoscope } from 'lucide-react';

import { useActionState, useState } from 'react';

import { loginDoctor } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState = { message: '' };

export default function DoctorLogin() {
  const [state, formAction, isPending] = useActionState(loginDoctor, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-teal-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-teal-50/50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <Card className="w-full max-w-[440px] shadow-xl border-slate-200/60 card-clinical z-10 animate-in slide-in-from-bottom-6 fade-in duration-700">
        <CardHeader className="text-center space-y-3 pb-6 pt-8">
          <div className="mx-auto w-16 h-16 bg-teal-100/80 rounded-2xl flex items-center justify-center shadow-sm mb-2 text-teal-600">
            <Stethoscope className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-800">Doctor Login</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Access your clinical dashboard and patient records
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8">
          <form action={formAction} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mobile" className="text-slate-700 font-semibold text-xs">
                  Mobile Number
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-teal-500/20 focus-visible:border-teal-500/50 text-[15px] transition-all"
                    placeholder="Registered mobile number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-700 font-semibold text-xs">
                  Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="pl-11 pr-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-teal-500/20 focus-visible:border-teal-500/50 text-[15px] transition-all"
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

            {state?.message && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="text-lg leading-none">⚠️</span>
                <p className="text-xs font-semibold">{state.message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Login <LogIn className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-100 py-6 px-8 flex justify-center rounded-b-[22px]">
          <p className="text-[15px] text-slate-500 font-medium">
            Not registered yet?{' '}
            <a
              href="/doctor/register"
              className="text-teal-600 hover:text-teal-700 font-semibold hover:underline underline-offset-4 transition-all"
            >
              Register as Doctor
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
