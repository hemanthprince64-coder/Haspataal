'use client'

import { useState, useActionState, useEffect } from 'react';
import { patientLogin, requestOtpAction } from '@/app/actions';
import Link from 'next/link';
import { 
    Smartphone, Phone, ShieldCheck, ArrowRight, Lock, 
    ChevronLeft, Key, Zap, CheckCircle2, AlertCircle, Loader2, Hospital 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

const initialState = {
    message: '',
};

export default function PatientLogin() {
    const [state, formAction, isPending] = useActionState(patientLogin, initialState);
    const [step, setStep] = useState(1);
    const [mobile, setMobile] = useState('');
    const [otpMessage, setOtpMessage] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setOtpMessage('');
        setIsRequesting(true);

        const fd = new FormData();
        fd.append('mobile', mobile);

        const res = await requestOtpAction(null, fd);
        setIsRequesting(false);

        if (res.success) {
            setStep(2);
        } else {
            setOtpMessage(res.message);
        }
    };

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in text-slate-900">
            <Card className="max-w-[460px] w-full rounded-[3rem] border-slate-200/50 shadow-2xl shadow-slate-200/40 bg-white overflow-hidden">
                <CardHeader className="p-10 pb-0 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
                            <Hospital className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter">Patient Login</CardTitle>
                    <CardDescription className="text-slate-500 text-lg font-medium tracking-tight mt-2">
                        Access your clinical records and book verified appointments.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-10 pt-8">
                    {step === 1 ? (
                        <form onSubmit={handleRequestOtp} className="space-y-8">
                            <div className="space-y-3">
                                <Label htmlFor="mobile" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">📱 Mobile Number</Label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <Input
                                        id="mobile"
                                        name="mobile"
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        required
                                        maxLength="10"
                                        className="h-16 pl-14 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-black text-xl transition-all shadow-inner placeholder:text-slate-200"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                    />
                                </div>
                            </div>

                            {otpMessage && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {otpMessage}
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                disabled={isRequesting} 
                                className="w-full h-16 rounded-2xl bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-95 group"
                            >
                                {isRequesting ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Sending OTP...</> : <>Get Secure OTP <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                            </Button>
                        </form>
                    ) : (
                        <form action={formAction} className="space-y-8">
                            <input type="hidden" name="mobile" value={mobile} />
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">📱 Mobile Number</Label>
                                <Input 
                                    readOnly 
                                    value={mobile} 
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-100/50 text-slate-400 font-bold" 
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="otp" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">🔑 Verification Code</Label>
                                <div className="relative group">
                                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <Input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        placeholder="Enter 4-digit code"
                                        required
                                        maxLength="4"
                                        autoFocus
                                        className="h-16 pl-14 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-black text-2xl tracking-[0.5em] transition-all shadow-inner placeholder:text-slate-200 placeholder:tracking-normal"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        Check console for demo OTP code
                                    </p>
                                </div>
                            </div>

                            {state?.message && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {state.message}
                                </div>
                            )}

                            <div className="space-y-4">
                                <Button 
                                    type="submit" 
                                    disabled={isPending} 
                                    className="w-full h-16 rounded-2xl bg-blue-600 border-2 border-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95 group"
                                >
                                    {isPending ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Verifying...</> : <>Secure Login <ShieldCheck className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" /></>}
                                </Button>
                                
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)} 
                                    className="w-full text-center py-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors"
                                >
                                    Change Mobile Number
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-blue-600 transition-colors">
                                    <Hospital className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Medical Partner?</div>
                                    <div className="text-xs font-black text-slate-700 group-hover:text-blue-600 transition-colors">Hospital HMS Access</div>
                                </div>
                             </div>
                             <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180" />
                        </div>
                    </div>
                </CardContent>
                
                <CardFooter className="bg-slate-50/50 p-6 flex justify-center border-t border-slate-100">
                    <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <Lock className="w-3.5 h-3.5" /> End-to-end Encrypted
                    </p>
                </CardFooter>
            </Card>
        </main>
    );
}
