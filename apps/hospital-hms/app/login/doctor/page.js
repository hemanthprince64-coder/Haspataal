'use client';

import {
  Stethoscope,
  Phone,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Lock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useState, useActionState, useTransition, useEffect } from 'react';
import Link from 'next/link';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Label,
} from '@haspataal/ui';

import { requestDoctorOtp, loginDoctorWithOtp } from '@/app/actions';

export default function DoctorLoginPage() {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [requestError, setRequestError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isRequesting, startRequestTransition] = useTransition();

  const [verifyState, verifyAction, isVerifying] = useActionState(loginDoctorWithOtp, {
    message: '',
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setRequestError('');

    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setRequestError('Please enter a valid 10-digit mobile number.');
      return;
    }

    startRequestTransition(async () => {
      const formData = new FormData();
      formData.append('mobile', cleaned);
      const res = await requestDoctorOtp(null, formData);
      if (res?.success) {
        setStep(2);
        setCountdown(30);
        setCanResend(false);
      } else {
        setRequestError(res?.message || 'Failed to send OTP.');
      }
    });
  };

  const handleResendOtp = () => {
    if (!canResend || isRequesting) return;
    handleSendOtp();
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-50/50 text-slate-900 font-sans">
      <Card className="max-w-[460px] w-full rounded-[3rem] border-slate-200/60 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
        <CardHeader className="p-10 pb-0 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter">
            Doctor Login
          </CardTitle>
          <CardDescription className="text-slate-500 text-base font-medium tracking-tight mt-2">
            {step === 1
              ? 'Access your clinical dashboard and patient records via secure OTP'
              : `Enter the 6-digit verification code sent to +91 ${mobile}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-10 pt-8">
          {/* STEP 1: MOBILE NUMBER */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="mobile"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1"
                >
                  <Phone className="w-3.5 h-3.5" /> Mobile Number
                </Label>
                <div className="relative group">
                  <Smartphone
                    className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                      requestError
                        ? 'text-red-400'
                        : 'text-slate-400 group-focus-within:text-blue-600'
                    }`}
                  />
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className={`h-16 pl-14 rounded-2xl bg-slate-50/60 font-black text-xl text-slate-900 transition-all shadow-inner placeholder:text-slate-300 ${
                      requestError
                        ? 'border-red-300 focus-visible:ring-red-500/20 text-red-900'
                        : 'border-slate-200/80 focus-visible:ring-blue-500/20 focus-visible:ring-4'
                    }`}
                    autoFocus
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {requestError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{requestError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isRequesting || mobile.length < 10}
                className="w-full h-16 rounded-2xl bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-95 group disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                suppressHydrationWarning
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Secure OTP</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <form action={verifyAction} className="space-y-6">
              <input type="hidden" name="mobile" value={mobile} />

              {/* Verified Phone Pill */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Sending to
                  </div>
                  <div className="text-sm font-black text-slate-800">+91 {mobile}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  suppressHydrationWarning
                >
                  Change
                </button>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="otp"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> 6-Digit Verification Code
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  type="tel"
                  placeholder="••••••"
                  required
                  maxLength={6}
                  value={otp}
                   onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-16 rounded-2xl bg-slate-50/60 font-black text-2xl text-center text-slate-900 tracking-[0.4em] border-slate-200/80 focus-visible:ring-blue-500/20 focus-visible:ring-4 shadow-inner placeholder:text-slate-300"
                  autoFocus
                  suppressHydrationWarning
                />
              </div>

              {/* Resend & Timer Row */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                <span>
                  {countdown > 0 ? (
                    <>
                      Resend available in <b className="text-slate-700">{countdown}s</b>
                    </>
                  ) : (
                    "Didn't receive code?"
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isRequesting}
                  className="font-bold text-blue-600 hover:underline disabled:text-slate-300 disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  suppressHydrationWarning
                >
                  <RefreshCw className={`w-3 h-3 ${isRequesting ? 'animate-spin' : ''}`} />
                  Resend OTP
                </button>
              </div>

              {verifyState?.message && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{verifyState.message}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isVerifying || otp.length < 6}
                className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95 group disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                suppressHydrationWarning
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Enter Console</span>
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Switch Portal Navigation Cards */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <Link
              href="/login"
              className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-blue-600 transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Hospital Staff
                  </div>
                  <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Hospital Admin Login
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </Link>

            <a
              href="http://localhost:3000"
              className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-blue-600 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Patient Portal
                  </div>
                  <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Go to Patient Web App
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </a>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50/50 p-6 flex justify-center border-t border-slate-100">
          <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <Lock className="w-3.5 h-3.5 text-blue-600" /> End-to-end Encrypted • ABDM Ready
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
