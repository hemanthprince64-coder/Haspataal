/* eslint-disable */
'use client';

import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Sparkles, PhoneCall, LogIn } from 'lucide-react';

import React from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50/40 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <Card className="w-full max-w-[550px] shadow-xl border-slate-200/60 card-clinical z-10 text-center animate-in fade-in duration-500">
        <CardHeader className="space-y-3 pb-6 pt-8">
          <div className="mx-auto w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner relative">
            <Shield className="w-9 h-9" />
            <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-amber-500/5 animate-ping" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-800">Verification Pending</CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Your application is being reviewed by the Haspataal credentialing board
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left text-xs leading-relaxed text-slate-600 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" /> What happens next?
            </h4>
            <p>
              1. Our platform administrators will verify your medical license credentials, clinic
              address registration, and legal details.
            </p>
            <p>
              2. Once verified, you will receive an automatic{' '}
              <strong>WhatsApp & SMS notification</strong> confirming your approval status.
            </p>
            <p>
              3. After receiving the notification, you can use the Magic OTP login or password login
              to access your onboarding wizard and begin clinic setup.
            </p>
          </div>

          {/* Assisted Onboarding box */}
          <div className="border border-slate-100 rounded-2xl p-4 bg-blue-50/20 text-xs flex items-center gap-3 text-left">
            <PhoneCall className="h-8 w-8 text-blue-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Need immediate activation?</span>
              <p className="text-slate-500 mt-0.5">
                Call our support helpline at 1800-Haspataal for express verification.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-100 py-6 px-8 flex flex-col sm:flex-row gap-2.5 rounded-b-[22px]">
          <Link href="/hospital/login" className="w-full">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 h-12">
              <LogIn className="h-4 w-4" /> Go to Login Screen
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
