'use client';

import { useActionState, useEffect, useState } from 'react';
import { saveMedicalHistoryAction, getPatientFullProfile } from '@/app/actions';
import Link from 'next/link';
import { 
    Stethoscope, ChevronLeft, Save, Loader2, Heart, Activity, 
    ShieldAlert, Sparkles, CheckCircle2, AlertCircle, Info, 
    ArrowRight, Pill, Microscope, ClipboardList 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const initialState = { message: '', success: false };

function TextAreaField({ label, name, defaultValue, placeholder, icon: Icon }) {
    return (
        <Card className="rounded-3xl border-slate-200/60 shadow-xl shadow-slate-200/5 bg-white overflow-hidden group hover:border-blue-300 transition-all">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-blue-600 transition-colors">
                    {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</Label>
                </div>
                <Textarea 
                    name={name} 
                    defaultValue={defaultValue || ''} 
                    placeholder={placeholder} 
                    className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold text-lg transition-all p-5 shadow-inner leading-relaxed" 
                />
            </CardContent>
        </Card>
    );
}

export default function MedicalHistoryPage() {
    const [state, formAction, isPending] = useActionState(saveMedicalHistoryAction, initialState);
    const [medicalHistory, setMedicalHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatientFullProfile().then(data => {
            setMedicalHistory(data?.medicalHistory || {});
            setLoading(false);
        });
    }, [state]);

    if (loading) {
        return (
            <main className="container max-w-4xl mx-auto px-6 py-10 space-y-8 animate-pulse text-slate-900">
                <div className="h-10 w-32 bg-slate-100 rounded-xl" />
                <div className="h-20 w-3/4 bg-slate-100 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem]" />)}
                </div>
            </main>
        );
    }

    return (
        <main className="container max-w-5xl mx-auto px-6 py-10 animate-fade-in text-slate-900">
            <div className="flex items-center justify-between mb-8">
                <Button asChild variant="ghost" className="text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                    <Link href="/profile" className="flex items-center gap-2">
                        <ChevronLeft className="w-5 h-5" /> Portal
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Stethoscope className="w-3.5 h-3.5 mr-2" /> Clinical Vault
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-2 text-slate-900">Medical History</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Structured baseline data for personalized care orchestration.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-[2rem] border border-emerald-100/50">
                    <ShieldAlert className="w-6 h-6 text-emerald-600" />
                    <div className="text-sm font-bold text-emerald-800 tracking-tight">Assisting accurate AI Triage</div>
                </div>
            </div>

            <Card className="mb-12 rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 border-none p-1 flex items-center overflow-hidden shadow-2xl shadow-blue-500/20 group">
                <CardContent className="w-full bg-white/95 backdrop-blur-sm rounded-[2.35rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                    <div className="absolute right-[-40px] top-[-40px] opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-64 h-64 text-blue-900" />
                    </div>
                    
                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center flex-shrink-0 border border-blue-100 group-hover:rotate-6 transition-transform duration-500">
                        <ClipboardList className="w-12 h-12 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">Clinical Baseline</h3>
                        <p className="text-slate-500 text-lg font-medium tracking-tight mb-0">
                            Updating your history ensures that all cross-consultations are safe and drug interactions are automatically flagged.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {state?.success && (
                <div className="mb-10 flex items-center gap-4 p-6 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-[2rem] animate-in slide-in-from-top-4 duration-500">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="font-black text-lg tracking-tight">{state.message}</p>
                </div>
            )}

            <form action={formAction} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TextAreaField
                        label="Chronic Diseases"
                        name="chronicDiseases"
                        defaultValue={medicalHistory.chronicDiseases}
                        placeholder="e.g. Type 2 Diabetes, Hypertension (Grade II)..."
                        icon={Activity}
                    />
                    <TextAreaField
                        label="Past Illnesses"
                        name="pastIllnesses"
                        defaultValue={medicalHistory.pastIllnesses}
                        placeholder="e.g. Severe Malaria (2022), COVID-19 (2x)..."
                        icon={AlertCircle}
                    />
                    <TextAreaField
                        label="Major Surgeries"
                        name="surgeries"
                        defaultValue={medicalHistory.surgeries}
                        placeholder="e.g. Heart Valve Repair (2018), LASIK..."
                        icon={Microscope}
                    />
                    <TextAreaField
                        label="Environmental Allergies"
                        name="allergies"
                        defaultValue={medicalHistory.allergies}
                        placeholder="e.g. Latex sensitivity, Pollen, Peanuts..."
                        icon={Info}
                    />
                    <Card className="md:col-span-2 rounded-[3.5rem] border-rose-200 bg-rose-50/30 overflow-hidden shadow-xl shadow-rose-500/5 group hover:border-rose-400 transition-all">
                        <CardContent className="p-10 space-y-6">
                            <div className="flex items-center gap-4 text-rose-600">
                                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center border border-rose-200">
                                    <Pill className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight mb-0">Drug Allergies & Sensitivities</h3>
                                    <Badge variant="outline" className="mt-1 border-rose-200 text-rose-700 font-black text-[10px] uppercase tracking-widest px-3 py-1 bg-white/50">CRITICAL SAFETY DATA</Badge>
                                </div>
                            </div>
                            <Textarea 
                                name="drugAllergies" 
                                defaultValue={medicalHistory.drugAllergies} 
                                placeholder="e.g. Penicillin, Sulfa based drugs, Aspirin..." 
                                className="min-h-[140px] rounded-[2rem] border-rose-100 bg-white focus-visible:ring-rose-500/20 focus-visible:ring-4 font-black text-xl transition-all p-8 shadow-inner placeholder:text-rose-100 text-rose-900 leading-relaxed" 
                            />
                            <div className="flex items-center gap-3 text-rose-400/60 font-bold text-xs uppercase tracking-widest px-2">
                                <ShieldAlert className="w-4 h-4" /> This data is shared with every consultant automatically
                            </div>
                        </CardContent>
                    </Card>
                    <TextAreaField
                        label="Hospitalization History"
                        name="hospitalizations"
                        defaultValue={medicalHistory.hospitalizations}
                        placeholder="e.g. Fortis Hospital (2023), ICU admission for pneumonia..."
                        icon={ClipboardList}
                    />
                </div>

                {state?.message && !state.success && (
                    <div className="p-6 bg-red-50 text-red-700 border border-red-100 rounded-3xl flex items-center gap-4 font-black">
                        <AlertCircle className="w-6 h-6" /> {state.message}
                    </div>
                )}

                <div className="flex justify-center pt-8">
                    <Button
                        type="submit"
                        disabled={isPending}
                        size="lg"
                        className="h-20 px-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-slate-900/30 transition-all active:scale-95 disabled:opacity-50 min-w-[320px]"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-7 h-7 mr-3 animate-spin" /> 
                                Virtualizing History...
                            </>
                        ) : (
                            <>
                                <Save className="w-6 h-6 mr-4" /> 
                                Sync Medical Profile
                            </>
                        )}
                    </Button>
                </div>
            </form>

            <div className="mt-20 text-center">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                    <Info className="w-5 h-5" /> End-to-end encrypted medical data storage
                </p>
            </div>
        </main>
    );
}
