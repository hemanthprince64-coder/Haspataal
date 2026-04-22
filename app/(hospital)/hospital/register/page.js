'use client';

import { useActionState, useEffect } from 'react';
import { registerHospital } from '@/app/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, User, Phone, Lock, ChevronRight, UserPlus, ArrowRight } from 'lucide-react';

const initialState = { message: '', success: false };

export default function HospitalRegister() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(registerHospital, initialState);

    useEffect(() => {
        if (state?.success) {
            router.push('/hospital/register/success');
        }
    }, [state, router]);

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
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">Facility Details</h3>
                            </div>
                            
                            <div className="space-y-2.5">
                                <Label htmlFor="hospitalName" className="text-slate-700 font-semibold text-sm">
                                    Hospital Name <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative group">
                                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Building2 className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <Input 
                                        id="hospitalName" 
                                        name="hospitalName" 
                                        type="text" 
                                        required 
                                        className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all" 
                                        placeholder="e.g., City General Hospital" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="city" className="text-slate-700 font-semibold text-sm">
                                    City <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative group">
                                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <MapPin className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <Input 
                                        id="city" 
                                        name="city" 
                                        type="text" 
                                        required 
                                        className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all" 
                                        placeholder="e.g., Mumbai" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Admin Info */}
                        <div className="space-y-6 pt-4">
                             <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                    <User className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">Admin Contact</h3>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2.5">
                                    <Label htmlFor="adminName" className="text-slate-700 font-semibold text-sm">
                                        Admin Name <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative group">
                                         <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <Input 
                                            id="adminName" 
                                            name="adminName" 
                                            type="text" 
                                            required 
                                            className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all" 
                                            placeholder="Full name" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="mobile" className="text-slate-700 font-semibold text-sm">
                                        Mobile Number <span className="text-red-500">*</span>
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
                                            placeholder="10-digit number" 
                                            maxLength="10" 
                                        />
                                    </div>
                                </div>
                            </div>


                            <div className="space-y-2.5">
                                <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
                                    Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative group">
                                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <Input 
                                        id="password" 
                                        name="password" 
                                        type="password" 
                                        required 
                                        className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500/50 text-[15px] transition-all" 
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
