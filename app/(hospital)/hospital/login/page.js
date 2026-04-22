'use client';

import { useActionState } from 'react';
import { loginHospital } from '@/app/actions';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Phone, Lock, LogIn } from 'lucide-react';

const initialState = { message: '' };

export default function HospitalLogin() {
    const [state, formAction, isPending] = useActionState(loginHospital, initialState);

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 bg-slate-50 relative overflow-hidden">
             
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl opacity-50 point-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl opacity-50 point-events-none" />
            
            <Card className="w-full max-w-[440px] shadow-xl border-slate-200/60 card-clinical z-10 animate-in slide-in-from-bottom-6 fade-in duration-700">
                <CardHeader className="text-center space-y-3 pb-6 pt-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100/80 rounded-2xl flex items-center justify-center shadow-sm mb-2 text-blue-600">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-senior-h2">Hospital Login</CardTitle>
                    <CardDescription className="text-senior-base">
                        Access your hospital administrative dashboard
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="px-6 sm:px-8 pb-8">
                    <form action={formAction} className="space-y-6">
                        
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="mobile" className="text-slate-700 font-medium">Mobile Number</Label>
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
                                        placeholder="Admin mobile number" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
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
                                        placeholder="Enter password" 
                                    />
                                </div>
                            </div>
                        </div>

                        {state?.message && (
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
                                        Authenticating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Login to Dashboard <LogIn className="w-5 h-5 ml-1" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-slate-100 py-6 px-8 flex justify-center rounded-b-[22px]">
                    <p className="text-[15px] text-slate-500 font-medium">
                        New hospital?{' '}
                        <Link href="/hospital/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline underline-offset-4 transition-all">
                            Register your facility
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
