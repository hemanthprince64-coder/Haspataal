'use client';

import { useActionState, useEffect, useState } from 'react';
import { addVaccinationAction } from '@/app/actions';
import Link from 'next/link';
import { Syringe, Plus, ChevronLeft, ShieldCheck, Calendar, Clock, AlertCircle, Loader2, Sparkles, CheckCircle2, Milestone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import VaccinationsList from "@/components/patient/VaccinationsList";

const initialState = { message: '', success: false };

export default function VaccinationsPage() {
    const [state, formAction, isPending] = useActionState(addVaccinationAction, initialState);
    const [showForm, setShowForm] = useState(false);
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getPatientFullProfile }) => {
            getPatientFullProfile().then(data => {
                setVaccinations(data?.vaccinations || []);
                setLoading(false);
            });
        });
    }, [state]);

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
                        <Badge variant="secondary" className="text-teal-700 bg-teal-100/50 hover:bg-teal-100 border-teal-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Syringe className="w-3.5 h-3.5 mr-2" /> Immunization
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Vaccinations</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Digital immunization records for you and your family.</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    size="lg" 
                    className={`${showForm ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-teal-600 hover:bg-teal-700 text-white'} h-16 px-8 rounded-2xl font-black text-lg shadow-xl shadow-teal-500/10 transition-all active:scale-95`}
                >
                    {showForm ? 'Cancel Entry' : <><Plus className="w-6 h-6 mr-3" /> Add Certificate</>}
                </Button>
            </div>

            <Card className="mb-10 rounded-[2rem] border-none bg-gradient-to-br from-teal-500 to-emerald-600 p-1 flex items-center overflow-hidden shadow-2xl shadow-teal-500/20 group">
                <CardContent className="w-full bg-white/95 backdrop-blur-sm rounded-[1.85rem] p-6 flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-32 h-32 text-teal-900" />
                    </div>
                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-teal-100">
                        <CheckCircle2 className="w-8 h-8 text-teal-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-600 font-bold leading-relaxed">
                            <span className="text-teal-600 font-black uppercase tracking-widest text-[10px] block mb-1">Immunization Shield</span>
                            Maintaining accurate vaccination records is critical for school, travel, and long-term immunity tracking.
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
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">New Immunization Entry</CardTitle>
                        <CardDescription className="text-slate-500 font-medium tracking-tight">Record details from your vaccination certificate.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form action={formAction} className="space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vaccine Name</Label>
                                <Input 
                                    name="vaccineName" 
                                    required 
                                    placeholder="e.g. BCG, DPT-1, COVID-19 Booster" 
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-teal-500/20 focus-visible:ring-4 focus-visible:border-teal-300 text-lg font-bold transition-all" 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Given</Label>
                                    <Input 
                                        name="dateGiven" 
                                        type="date" 
                                        required
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-teal-500/20 focus-visible:ring-4 focus-visible:border-teal-300 font-bold transition-all" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Next Due Date (Optional)</Label>
                                    <Input 
                                        name="nextDueDate" 
                                        type="date" 
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-teal-500/20 focus-visible:ring-4 focus-visible:border-teal-300 font-bold transition-all" 
                                    />
                                </div>
                            </div>

                            {state?.message && !state.success && (
                                <div className="flex items-center gap-3 p-5 bg-red-50 text-red-700 border border-red-100 rounded-2xl animate-shake">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                    <p className="font-bold text-sm tracking-tight">{state.message}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-16 bg-teal-900 hover:bg-teal-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-900/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isPending ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Digitizing Certificate...</> : 'Save Immunization'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Milestone className="w-4 h-4" /> Vaccination History
                    </h3>
                    <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold tracking-tight px-3">
                        {vaccinations.length} Records
                    </Badge>
                </div>
                
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-48 rounded-[2rem] bg-slate-100" />
                        ))}
                    </div>
                ) : (
                    <VaccinationsList vaccinations={vaccinations} />
                )}
            </div>
        </main>
    );
}
