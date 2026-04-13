"use client";

import { useState, useEffect, startTransition } from "react";
import { getPatientFullProfile, getCareTimelineAction } from "@/app/actions";
import ContinuousCareHub from "@/app/components/ContinuousCareHub";
import Link from "next/link";
import { 
    Activity, ChevronLeft, HeartPulse, Sparkles, 
    Calendar, Bot, ArrowRight, Info, ShieldCheck, 
    Zap, Loader2, Hospital 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecoveryPage() {
    const [recoveryData, setRecoveryData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatientFullProfile().then(p => {
            const lastVisit = p?.visits?.[0] || p?.appointments?.[0]?.visit;
            if (lastVisit?.id) {
                getCareTimelineAction(lastVisit.id).then(data => {
                    setRecoveryData(data);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });
    }, []);

    if (loading) {
        return (
            <main className="container max-w-5xl mx-auto px-6 py-10 space-y-12">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-12 w-2/3 rounded-2xl" />
                </div>
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                    <p className="text-slate-400 font-bold text-sm tracking-[0.2em] uppercase transition-all animate-pulse">
                        Synchronizing Continuous Care Engine...
                    </p>
                </div>
            </main>
        );
    }

    if (!recoveryData) {
        return (
            <main className="container max-w-5xl mx-auto px-6 py-12 animate-fade-in text-slate-900">
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-7xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-in zoom-in-50 duration-500">
                            🏥
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-100 text-blue-600">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    
                    <div className="max-w-md space-y-4">
                        <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50/50 uppercase tracking-widest px-4 py-1.5 rounded-xl font-black text-[9px]">
                            Engine Standby
                        </Badge>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">No Active Recovery Plan</h1>
                        <p className="text-slate-500 text-lg font-medium tracking-tight">
                            Your personalized care journey initiates automatically after your first clinical consultation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl px-4">
                        <Card className="rounded-[2rem] border-slate-200 shadow-xl shadow-slate-200/5 hover:border-blue-300 transition-all group cursor-pointer overflow-hidden p-1">
                            <Link href="/search" className="block p-6 text-left">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-black text-lg tracking-tight mb-2">Book Visit</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect with verified specialists</p>
                            </Link>
                        </Card>
                        <Card className="rounded-[2rem] border-slate-200 shadow-xl shadow-slate-200/5 hover:border-indigo-300 transition-all group cursor-pointer overflow-hidden p-1">
                            <Link href="/medchat" className="block p-6 text-left">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Bot className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="font-black text-lg tracking-tight mb-2">AI Triage</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instant medical assessment</p>
                            </Link>
                        </Card>
                    </div>

                    <div className="pt-8 text-center bg-transparent border-none">
                         <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                            <Info className="w-4 h-4" /> Continuous monitoring ensures faster recuperation
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="container max-w-6xl mx-auto px-6 py-10 animate-fade-in text-slate-900 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                   <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Zap className="w-3.5 h-3.5 mr-2" /> Care Lifecycle
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-2">Recovery Journey</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Proactive monitoring for your post-consultation health cycle.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/10">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encryption Enabled</div>
                </div>
            </div>

            <ContinuousCareHub data={recoveryData} />
            
            <div className="mt-20 text-center">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                    <HeartPulse className="w-5 h-5 text-red-400" /> Powered by Haspataal Autonomous Care Engine
                </p>
            </div>
        </main>
    );
}
