'use client';

import {
  Building2,
  Phone,
  Lock,
  LogIn,
  Sparkles,
  Key,
  Send,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState, useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { loginHospital, loginHospitalWithOtp, sendRegistrationOtp } from '@/app/actions';
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

export default function HospitalLogin() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState('password');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpPending, startOtpTransition] = useTransition();
  const [isOtpLoginPending, startOtpLoginTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    const formData = new FormData(e.currentTarget);

    startPasswordTransition(async () => {
      try {
        const res = await loginHospital(null, formData);
        if (res && res.message) {
          setPasswordError(res.message);
          toast.error(res.message);
        }
      } catch (err) {
        if (err.message && err.message.includes('NEXT_REDIRECT')) {
          return;
        }
        setPasswordError('Invalid credentials or connection issue.');
      }
    });
  };

  const handleSendOtp = () => {
    if (!mobile || mobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    startOtpTransition(async () => {
      const data = new FormData();
      data.append('mobile', mobile);
      const res = await sendRegistrationOtp(null, data);
      if (res.success) {
        setOtpSent(true);
        setOtpError('');
        toast.success('OTP sent successfully! [DEMO OTP] check your terminal console.');
      } else {
        toast.error(res.message || 'Failed to send OTP');
        setOtpError(res.message || 'Failed to send OTP');
      }
    });
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setOtpError('');
    const formData = new FormData(e.currentTarget);

    startOtpLoginTransition(async () => {
      try {
        const res = await loginHospitalWithOtp(null, formData);
        if (res.success) {
          toast.success('Logged in successfully!');
          router.push('/hospital/dashboard');
        } else {
          setOtpError(res.message || 'Login failed.');
          toast.error(res.message || 'Login failed.');
        }
      } catch (err) {
        if (err.message && err.message.includes('NEXT_REDIRECT')) {
          return;
        }
        setOtpError('Failed to login. Please try again.');
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <Card className="w-full max-w-[440px] shadow-xl border-slate-200/60 card-clinical z-10 animate-in slide-in-from-bottom-6 fade-in duration-700">
        <CardHeader className="text-center space-y-3 pb-6 pt-8">
          <div className="mx-auto w-16 h-16 bg-blue-100/80 rounded-2xl flex items-center justify-center shadow-sm mb-2 text-blue-600">
            <Building2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-800">Hospital Login</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Access your hospital administrative dashboard
          </CardDescription>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl mt-4 border border-slate-200/50">
            <button
              type="button"
              onClick={() => setLoginMode('password')}
              className={`py-2 text-xs font-bold rounded-lg transition-all
                ${loginMode === 'password' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('otp')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1
                ${loginMode === 'otp' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Sparkles className="h-3 w-3 text-amber-500" /> Magic OTP Login
            </button>
          </div>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8">
          {loginMode === 'password' ? (
            /* Password Login Form */
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mobile" className="text-slate-700 font-semibold text-xs">
                    Mobile Number
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all"
                      placeholder="Admin mobile number"
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
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <span className="text-lg leading-none">⚠️</span>
                  <p className="text-xs font-semibold">{passwordError}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isPasswordPending}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isPasswordPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    Login with Password <LogIn className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* Magic OTP Login Form */
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otpMobile" className="text-slate-700 font-semibold text-xs">
                    Mobile Number
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <Input
                        id="otpMobile"
                        name="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all"
                        placeholder="Admin mobile number"
                      />
                    </div>
                    <Button
                      type="button"
                      disabled={isOtpPending || !mobile}
                      onClick={handleSendOtp}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold h-12 px-4 rounded-xl shrink-0"
                    >
                      {isOtpPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-3 fade-in duration-300">
                    <Label htmlFor="otp" className="text-slate-700 font-semibold text-xs">
                      Enter 6-Digit OTP Code
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        maxLength={6}
                        required
                        className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all tracking-[0.25em] font-mono font-bold"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                )}
              </div>

              {otpError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <span className="text-lg leading-none">⚠️</span>
                  <p className="text-xs font-semibold">{otpError}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isOtpLoginPending || !otpSent}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isOtpLoginPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    Verify & Login <LogIn className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50 border-t border-slate-100 py-6 px-8 flex justify-center rounded-b-[22px]">
          <p className="text-[15px] text-slate-500 font-medium">
            New hospital?{' '}
            <Link
              href="/hospital/register"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline underline-offset-4 transition-all"
            >
              Register your facility
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
