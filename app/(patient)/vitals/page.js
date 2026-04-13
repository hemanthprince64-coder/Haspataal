'use client';

import { useActionState, useEffect, useState } from 'react';
import { addVitalAction } from '@/app/actions';
import Link from 'next/link';
import { Heart, Plus, ChevronLeft, ShieldCheck, Activity, Thermometer, Droplets, Ruler, Weight, Clock, AlertCircle, Loader2, Sparkles, ActivitySquare, Monitor } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import VitalsQuickStats from "@/components/patient/VitalsQuickStats";
import VitalsHistory from "@/components/patient/VitalsHistory";

const initialState = { message: '', success: false };

export default function VitalsPage() {
    const [state, formAction, isPending] = useActionState(addVitalAction, initialState);
    const [showForm, setShowForm] = useState(false);
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getPatientFullProfile }) => {
            getPatientFullProfile().then(data => {
                setVitals(data?.vitals || []);
                setLoading(false);
            });
        });
    }, [state]);

    const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : {};

    return (
        <main className="container max-w-4xl mx-auto px-6 py-10 animate-fade-in">
            <Button asChild variant="ghost" className="mb-8 text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                <Link href="/profile" className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back to Profile
                </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-rose-700 bg-rose-100/50 hover:bg-rose-100 border-rose-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Monitor className="w-3.5 h-3.5 mr-2" /> Vitals Monitor
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Health Stats</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Track your core metrics and monitor recovery trends.</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    size="lg" 
                    className={`${showForm ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-rose-600 hover:bg-rose-700 text-white'} h-16 px-8 rounded-2xl font-black text-lg shadow-xl shadow-rose-500/10 transition-all active:scale-95`}
                >
                    {showForm ? 'Cancel Entry' : <><Plus className="w-6 h-6 mr-3" /> Record Vitals</>}
                </Button>
            </div>

            <div className="grid gap-8">
                {/* Dashboard Quick View */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ActivitySquare className="w-4 h-4" /> Latest Biometrics
                        </h3>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-slate-100" />)}
                        </div>
                    ) : (
                        <VitalsQuickStats latestVital={latestVital} />
                    )}
                </div>

                {showForm && (
                    <Card className="rounded-[2.5rem] border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-500">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">New Health Log</CardTitle>
                            <CardDescription className="text-slate-500 font-medium tracking-tight">Capture your current vitals for Clinical history.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form action={formAction} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Weight className="w-3.5 h-3.5" /> Body Composition
                                        </Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Input name="weight" type="number" step="0.1" placeholder="Weight (kg)" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-rose-500/20 focus-visible:ring-4 font-bold" />
                                                <span className="absolute right-4 top-4 text-[10px] font-black text-slate-300">KG</span>
                                            </div>
                                            <div className="relative">
                                                <Input name="height" type="number" step="0.1" placeholder="Height (cm)" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-rose-500/20 focus-visible:ring-4 font-bold" />
                                                <span className="absolute right-4 top-4 text-[10px] font-black text-slate-300">CM</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Heart className="w-3.5 h-3.5" /> Cardiovascular
                                        </Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Input name="bloodPressure" placeholder="BP (e.g. 120/80)" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-rose-500/20 focus-visible:ring-4 font-bold" />
                                            </div>
                                            <div className="relative">
                                                <Input name="pulse" type="number" placeholder="Pulse (bpm)" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-rose-500/20 focus-visible:ring-4 font-bold" />
                                                <span className="absolute right-4 top-4 text-[10px] font-black text-slate-300">BPM</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Activity className="w-3.5 h-3.5" /> Vital Biomarkers
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="relative">
                                            <Input name="bloodSugar" type="number" step="0.1" placeholder="Glucose" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-rose-500/20 focus-visible:ring-4 font-bold" />
                                            <span className="absolute right-4 top-4 text-[10px] font-black text-slate-300">MG/DL</span>
                                        </div>
                                        <div className="relative">
                                            <Input name="spo2" type="number" step="0.1" placeholder="SpO₂" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-rose-500/20 focus-visible:ring-4 font-bold" />
                                            <span className="absolute right-4 top-4 text-[10px] font-black text-slate-300">%</span>
                                        </div>
                                        <div className="relative">
                                            <Input name="temperature" type="number" step="0.1" placeholder="Temp" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-rose-500/20 focus-visible:ring-4 font-bold" />
                                            <span className="absolute right-4 top-4 text-[10px] font-black text-slate-300">°F</span>
                                        </div>
                                    </div>
                                </div>

                                {state?.message && !state.success && (
                                    <div className="flex items-center gap-3 p-5 bg-red-50 text-red-700 border border-red-100 rounded-2xl">
                                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                        <p className="font-bold text-sm tracking-tight">{state.message}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isPending ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Syncing Metrics...</> : 'Save Health Data'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Timeline History
                        </h3>
                        <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold tracking-tight px-3">
                            {vitals.length} Logs
                        </Badge>
                    </div>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-[2rem] bg-slate-100" />)}
                        </div>
                    ) : (
                        <VitalsHistory vitals={vitals} />
                    )}
                </div>
            </div>
        </main>
    );
}
