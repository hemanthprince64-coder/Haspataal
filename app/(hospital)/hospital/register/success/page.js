'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, ArrowRight, Building2, ClipboardCheck } from 'lucide-react';

export default function RegistrationSuccess() {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50/50">
            <Card className="w-full max-w-[500px] shadow-2xl border-none ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-500 rounded-[24px] overflow-hidden">
                <div className="h-2 bg-green-500 w-full" />
                
                <CardHeader className="text-center pt-10 pb-6">
                    <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50/50">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">Registration Received!</CardTitle>
                    <CardDescription className="text-slate-500 text-lg mt-2 font-medium px-4">
                        We&apos;ve received your application to join the Haspataal network.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8 space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4" />
                            Next Steps
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-slate-600 text-[15px]">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">1</div>
                                <span><b>Verification:</b> Our team will review your hospital details and credentials (24-48h).</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600 text-[15px]">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">2</div>
                                <span><b>Activation:</b> You&apos;ll receive an email once your dashboard access is activated.</span>
                            </li>
                        </ul>
                    </div>

                    <Button asChild className="w-full btn-medical h-14 text-base shadow-lg shadow-blue-200/50 group">
                        <Link href="/hospital/login" className="flex items-center justify-center gap-2">
                            Go to Login Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </CardContent>

                <CardFooter className="bg-slate-50/80 border-t border-slate-100 py-6 text-center justify-center">
                    <p className="text-sm text-slate-500">
                        Need help? <Link href="/contact" className="text-blue-600 font-semibold hover:underline">Contact Support</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
