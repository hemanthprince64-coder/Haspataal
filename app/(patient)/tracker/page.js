'use client';

import { useActionState, useState, useEffect } from 'react';
import { savePregnancyProfileAction, getPatientFullProfile } from '@/app/actions';
import Link from "next/link";
import { Baby, ChevronLeft, Plus, Calendar, Activity, Zap, Info, Sparkles, Loader2, Heart, Scale, ShieldAlert, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const initialState = { message: '', success: false };

export default function TrackerPage() {
    const [state, formAction, isPending] = useActionState(savePregnancyProfileAction, initialState);
    const [showForm, setShowForm] = useState(false);
    const [pregnancyProfile, setPregnancyProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatientFullProfile().then(data => {
            setPregnancyProfile(data?.pregnancyProfile || {});
            setLoading(false);
        });
    }, [state]);

    if (loading) {
        return (
            <main className="container max-w-4xl mx-auto px-6 py-10 space-y-8">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-20 w-3/4 rounded-2xl" />
                <Skeleton className="h-96 w-full rounded-[2.5rem]" />
            </main>
        );
    }

    return (
        <main className="container max-w-4xl mx-auto px-6 py-10 animate-fade-in text-slate-900">
            <Button asChild variant="ghost" className="mb-8 text-slate-500 hover:text-pink-600 -ml-4 font-bold">
                <Link href="/profile" className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Portal
                </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-pink-700 bg-pink-100/50 hover:bg-pink-100 border-pink-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Baby className="w-3.5 h-3.5 mr-2" /> Care Engine
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-2">Maternal Health</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Dedicated tracking for every phase of your journey.</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    size="lg" 
                    className={`${showForm ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-pink-600 hover:bg-pink-700 text-white'} h-16 px-8 rounded-2xl font-black text-lg shadow-xl shadow-pink-500/10 transition-all active:scale-95`}
                >
                    {showForm ? 'Cancel' : <><Pencil className="w-6 h-6 mr-3" /> Edit Profile</>}
                </Button>
            </div>

            <Card className="mb-10 rounded-[2.5rem] bg-gradient-to-br from-pink-600 to-rose-500 p-1 flex items-center overflow-hidden shadow-2xl shadow-pink-500/20 group">
                <CardContent className="w-full bg-white/95 backdrop-blur-sm rounded-[2.35rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                    <div className="absolute right-[-40px] top-[-40px] opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-64 h-64 text-pink-900" />
                    </div>
                    
                    <div className="w-24 h-24 bg-pink-50 rounded-3xl flex items-center justify-center flex-shrink-0 border border-pink-100 group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-pink-900/5">
                        <Baby className="w-12 h-12 text-pink-600" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg border-none mb-4 shadow-lg">
                            {pregnancyProfile?.gestationalAge ? `Week ${pregnancyProfile.gestationalAge}` : 'Setting up'}
                        </Badge>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Pregnancy Journey</h3>
                        <p className="text-slate-500 text-lg font-medium tracking-tight mb-0">
                            {pregnancyProfile?.edd ? `Expected Delivery: ${new Date(pregnancyProfile.edd).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Keep your clinical profile updated for personalized care nudges.'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {state?.success && (
                <div className="mb-8 flex items-center gap-3 p-5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl animate-in slide-in-from-top-2">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                    <p className="font-bold tracking-tight">{state.message}</p>
                </div>
            )}

            {showForm && (
                <Card className="mb-12 rounded-[2.5rem] border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-500">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <CardTitle className="text-2xl font-black tracking-tight">Clinical Profile</CardTitle>
                        <CardDescription className="text-slate-500 font-medium tracking-tight">Updating this syncs with your doctor&apos;s recovery dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form action={formAction} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Period (LMP)</Label>
                                    <Input 
                                        name="lmp" 
                                        type="date" 
                                        defaultValue={pregnancyProfile.lmp ? new Date(pregnancyProfile.lmp).toISOString().split('T')[0] : ''} 
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-pink-500/20 focus-visible:ring-4 font-bold transition-all" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Delivery (EDD)</Label>
                                    <Input 
                                        name="edd" 
                                        type="date" 
                                        defaultValue={pregnancyProfile.edd ? new Date(pregnancyProfile.edd).toISOString().split('T')[0] : ''} 
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-pink-500/20 focus-visible:ring-4 font-bold transition-all" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Week of Pregnancy</Label>
                                    <Input 
                                        name="gestationalAge" 
                                        type="number" 
                                        defaultValue={pregnancyProfile.gestationalAge || ''} 
                                        placeholder="Current week" 
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-pink-500/20 focus-visible:ring-4 font-bold transition-all" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Doctor Visits (ANC)</Label>
                                    <Input 
                                        name="ancVisits" 
                                        type="number" 
                                        defaultValue={pregnancyProfile.ancVisits || ''} 
                                        placeholder="Total visits" 
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-pink-500/20 focus-visible:ring-4 font-bold transition-all" 
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Plan & Preferences</Label>
                                    <Textarea 
                                        name="deliveryPlan" 
                                        defaultValue={pregnancyProfile.deliveryPlan || ''} 
                                        placeholder="Preferred hospital, doctor, or delivery type..." 
                                        className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-pink-500/20 focus-visible:ring-4 font-bold transition-all" 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-red-50 p-6 rounded-2xl border border-red-100 group">
                                <input type="checkbox" name="highRisk" value="true" defaultChecked={pregnancyProfile.highRisk} id="highRisk" className="h-6 w-6 rounded-lg accent-rose-600" />
                                <Label htmlFor="highRisk" className="font-black text-rose-700 cursor-pointer text-base">Mark as High-Risk Pregnancy <ShieldAlert className="inline w-5 h-5 ml-1" /></Label>
                            </div>

                            {state?.message && !state.success && (
                                <div className="flex items-center gap-3 p-5 bg-red-50 text-red-700 border border-red-100 rounded-2xl">
                                    <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                                    <p className="font-bold text-sm tracking-tight">{state.message}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isPending ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Virtualizing Profile...</> : 'Save Maternal Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl shadow-slate-200/5 bg-white overflow-hidden group hover:border-pink-300 transition-all">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center border border-pink-100">
                                <Activity className="w-7 h-7 text-pink-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-xl tracking-tight">Active Phase</h4>
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Clinical Insight</div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                                <div className="text-lg font-black text-slate-800">
                                    {pregnancyProfile?.highRisk ? (
                                        <span className="text-rose-600 flex items-center gap-2 animate-pulse">
                                            <ShieldAlert className="w-5 h-5" /> High Risk Protocol
                                        </span>
                                    ) : (
                                        <span className="text-emerald-600 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" /> Normal Progression
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Danger Signs Observed</div>
                                <p className="text-sm font-bold text-slate-600 italic">
                                    {pregnancyProfile?.dangerSigns || 'None reported. Stay vigilant.'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6">
                    <Card className="rounded-[2rem] border-slate-200/60 shadow-xl shadow-slate-200/5 bg-white overflow-hidden group hover:border-blue-300 transition-all">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-sm tracking-tight text-slate-900">Next Scheduled Scan</h4>
                                <p className="text-xs font-bold text-slate-500 mt-0.5">Manage through appointments</p>
                            </div>
                            <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-blue-50 text-blue-600">
                                <Link href="/appointments"><Plus className="w-5 h-5" /></Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[2rem] border-slate-200/60 shadow-xl shadow-slate-200/5 bg-white overflow-hidden group hover:border-amber-300 transition-all">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                                <Scale className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-sm tracking-tight text-slate-900">Maternal Weight Log</h4>
                                <p className="text-xs font-bold text-slate-500 mt-0.5">Track in Vitals section</p>
                            </div>
                            <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-amber-50 text-amber-600">
                                <Link href="/vitals"><Plus className="w-5 h-5" /></Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[2rem] border-slate-200/60 shadow-xl shadow-slate-200/5 bg-white overflow-hidden group hover:border-indigo-300 transition-all">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                <Zap className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-sm tracking-tight text-slate-900">Continuous Care Engine</h4>
                                <p className="text-xs font-bold text-slate-500 mt-0.5">Active AI monitoring</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="text-center">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <Info className="w-4 h-4" /> Professional medical guidance is paramount
                </p>
            </div>
        </main>
    );
}
