'use client';

import {
  Smartphone,
  Phone,
  ShieldCheck,
  ArrowRight,
  Key,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';

import React from 'react';
import OtpInput from 'react-otp-input';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useOtpVerification, ActionResult } from './useOtpVerification';

export interface OtpFlowProps {
  requestAction: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  verifyAction: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  initialPhone?: string;
  onPhoneChange?: (phone: string) => void;
}

export function OtpFlow({
  requestAction,
  verifyAction,
  initialPhone,
  onPhoneChange,
}: OtpFlowProps) {
  const {
    step,
    phone,
    setPhone,
    otp,
    handleOtpChange,
    countdown,
    isRequesting,
    requestError,
    handleRequestOtp,
    verifyState,
    verifyFormAction,
    isVerifying,
    changePhone,
  } = useOtpVerification({ requestAction, verifyAction, initialPhone, onPhoneChange });

  if (step === 1) {
    return (
      <form onSubmit={handleRequestOtp} className="space-y-8 animate-fade-in">
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
                requestError ? 'text-red-400' : 'text-slate-300 group-focus-within:text-blue-600'
              }`}
            />
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="10-digit mobile number"
              required
              maxLength={10}
              className={`h-16 pl-14 rounded-2xl bg-slate-50/50 font-black text-xl transition-all shadow-inner placeholder:text-slate-200 ${
                requestError
                  ? 'border-red-300 focus-visible:ring-red-500/20 text-red-900'
                  : 'border-slate-100 focus-visible:ring-blue-500/20 focus-visible:ring-4'
              }`}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
          </div>
        </div>

        {requestError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" /> {requestError}
          </div>
        )}

        <Button
          type="submit"
          disabled={isRequesting || phone.length < 10}
          className="w-full h-16 rounded-2xl bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-95 group disabled:opacity-50"
        >
          {isRequesting ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Sending OTP...
            </>
          ) : (
            <>
              Get Secure OTP{' '}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <form action={verifyFormAction} className="space-y-8 animate-fade-in">
      <input type="hidden" name="mobile" value={phone} />
      <input type="hidden" name="otp" value={otp} />

      <div className="space-y-3">
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
          <Phone className="w-3.5 h-3.5" /> Mobile Number
        </Label>
        <div className="flex items-center justify-between bg-slate-100/50 rounded-2xl px-5 h-14 border border-slate-100">
          <span className="font-bold text-slate-600 tracking-wide">{phone}</span>
          <button
            type="button"
            onClick={changePhone}
            className="text-blue-600 text-xs font-bold uppercase tracking-wider hover:underline"
          >
            Change
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="otp"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1"
        >
          <Key className="w-3.5 h-3.5" /> Verification Code
        </Label>

        <div className="flex justify-center">
          <OtpInput
            value={otp}
            onChange={handleOtpChange}
            numInputs={6}
            renderSeparator={<span className="w-2" />}
            renderInput={(props: React.InputHTMLAttributes<HTMLInputElement>) => (
              <input
                {...props}
                type="tel"
                className={`w-12 h-16 text-center text-2xl font-black rounded-xl transition-all shadow-inner border-2 ${
                  verifyState?.message
                    ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-500/20'
                    : 'border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-900'
                }`}
              />
            )}
            shouldAutoFocus
          />
        </div>

        <div className="flex justify-between items-center px-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1">
              Demo Mode <Info className="w-3 h-3 cursor-help" />
            </p>
          </div>

          {countdown > 0 ? (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={isRequesting}
              className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline disabled:opacity-50"
            >
              {isRequesting ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>
      </div>

      {verifyState?.message && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" /> {verifyState.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isVerifying || otp.length !== 6}
        className="w-full h-16 rounded-2xl bg-blue-600 border-2 border-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95 group disabled:opacity-50"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Verifying...
          </>
        ) : (
          <>
            Secure Login{' '}
            <ShieldCheck className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
          </>
        )}
      </Button>
    </form>
  );
}
