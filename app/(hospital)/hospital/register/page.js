'use client';

import { useActionState } from 'react';
import { registerHospital } from '@/app/actions';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, User, Phone, Lock, ChevronRight, UserPlus } from 'lucide-react';

const initialState = { message: '', success: false };

export default function HospitalRegister() {
    const [state, formAction, isPending] = useActionState(registerHospital, initialState);

    if (state?.success) {
        return (
            <div className="flex justify-center items-center py-16 px-4 bg-slate-50 min-h-screen">
                <Card className="w-full max-w-[480px] shadow-lg border-green-100 flex flex-col items-center p-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    <CardHeader className="text-center p-0 mb-4">
                        <CardTitle className="text-2xl font-bold text-green-700">Registration Submitted!</CardTitle>
                        <CardDescription className="text-slate-600 text-base">{state.message}</CardDescription>
                    </CardHeader>
                    <CardContent className="w-full pt-4">
                        <Button asChild className="w-full btn-medical group">
                            <Link href="/hospital/login" className="flex items-center justify-center gap-2">
                                Go to Login <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 bg-slate-50 relative overflow-hidden">
             
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl opacity-50 point-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl opacity-50 point-events-none" />
            
            <Card className="w-full max-w-[550px] shadow-xl border-slate-200/60 card-clinical z-10 animate-in slide-in-from-bottom-6 fade-in duration-700">
                <CardHeader className="text-center space-y-3 pb-6 pt-8">
                    <div className="mx-auto w-14 h-14 bg-blue-100/80 rounded-2xl flex items-center justify-center shadow-sm mb-2 text-blue-600">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-senior-h2">Register Hospital</CardTitle>
                    <CardDescription className="text-senior-base">
                        Join Haspataal&apos;s growing clinical network
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="px-6 sm:px-8 pb-8">
                    <form action={formAction} className="space-y-6">
                        
                        {/* Section 1: Hospital Info */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Facility Details</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="hospitalName" className="text-slate-700 font-medium">Hospital Name <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <Input 
                                        id="hospitalName" 
                                        name="hospitalName" 
                                        type="text" 
                                        required 
                                        className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/30 text-base" 
                                        placeholder="e.g., City General Hospital" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-slate-700 font-medium">City <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <Input 
                                        id="city" 
                                        name="city" 
                                        type="text" 
                                        required 
                                        className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/30 text-base" 
                                        placeholder="e.g., Mumbai" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Admin Info */}
                        <div className="space-y-5 pt-4">
                             <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <User className="w-4 h-4 text-slate-400" />
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Admin Contact</h3>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="adminName" className="text-slate-700 font-medium">Admin Name <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <Input 
                                            id="adminName" 
                                            name="adminName" 
                                            type="text" 
                                            required 
                                            className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/30 text-base" 
                                            placeholder="Full name" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile" className="text-slate-700 font-medium">Mobile Number <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <Input 
                                            id="mobile" 
                                            name="mobile" 
                                            type="tel" 
                                            required 
                                            className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/30 text-base" 
                                            placeholder="10-digit number" 
                                            maxLength="10" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 font-medium">Password <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <Input 
                                        id="password" 
                                        name="password" 
                                        type="password" 
                                        required 
                                        className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/30 text-base" 
                                        placeholder="Set a secure password" 
                                    />
                                </div>
                            </div>
                        </div>

                        {state?.message && !state.success && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <span className="text-lg leading-none">⚠️</span>
                                <p className="text-sm font-medium">{state.message}</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button 
                                type="submit" 
                                disabled={isPending} 
                                className="w-full btn-medical h-14 group shadow-md"
                            >
                                {isPending ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <UserPlus className="w-5 h-5" />
                                        Complete Registration
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-slate-100 py-6 px-8 flex justify-center rounded-b-[22px]">
                    <p className="text-[15px] text-slate-500 font-medium">
                        Already have an account?{' '}
                        <Link href="/hospital/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline underline-offset-4 transition-all">
                            Sign in to dashboard
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
