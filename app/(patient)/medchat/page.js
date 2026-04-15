'use client';

import { useActionState, useState, startTransition, useEffect, useMemo } from "react";
import { medchatTriageAction, getTopDoctorsBySpeciality } from "@/app/actions";
import NextLink from "next/link";
import { detectSpecialities } from "@/lib/medchat/triage-engine";
import { TRANSLATIONS } from "@/lib/medchat/translations";
import { 
    Bot, User, Activity, AlertTriangle, ChevronRight, ChevronLeft, 
    RefreshCcw, Calendar, MapPin, Star, ShieldAlert, Sparkles, 
    CheckCircle2, Info, Loader2, Languages, ArrowRight, Ambulance, ShieldCheck, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const STEPS = (t) => [
    { label: t.step1Title, icon: <User className="w-4 h-4" /> },
    { label: t.step2Title, icon: <Activity className="w-4 h-4" /> },
    { label: t.step3Title, icon: <AlertTriangle className="w-4 h-4" /> },
];

const DURATIONS = [
    "less than 1 day",
    "1-3 days",
    "3-7 days",
    "1-2 weeks",
    "2-4 weeks",
    "more than 1 month",
];

const GENDERS = ["Male", "Female", "Other"];

export default function MedChatPage() {
    const [lang, setLang] = useState("en"); // 'en' or 'hi'
    const t = TRANSLATIONS[lang];

    const [step, setStep] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [realtimeSpecs, setRealtimeSpecs] = useState([]);
    const [topDoctors, setTopDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    const [formData, setFormData] = useState({
        age: "",
        gender: "Male",
        city: "",
        duration: "1-3 days",
        symptoms: "",
        fever: "no",
        breathingDifficulty: "no",
        seizure: "no",
        consciousnessNormal: "yes",
    });

    const [state, formAction, isPending] = useActionState(async (prev, fd) => {
        const result = await medchatTriageAction(prev, fd);
        if (result?.success) {
            setShowResult(true);
            loadDoctors(result.result.recommended_speciality, formData.city);
        }
        return result;
    }, null);

    const loadDoctors = async (spec, city) => {
        setLoadingDoctors(true);
        try {
            const docs = await getTopDoctorsBySpeciality(spec, city);
            setTopDoctors(docs);
        } catch (e) {
            console.error("Failed to load doctors", e);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const updateField = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (key === "symptoms") {
            const specs = detectSpecialities(value);
            setRealtimeSpecs(specs);
        }
    };

    const toggleFlag = (key) => {
        setFormData((prev) => ({
            ...prev,
            [key]: prev[key] === "yes" ? "no" : "yes",
        }));
    };

    const canAdvance = () => {
        if (step === 0) return formData.age && formData.city;
        if (step === 1) return formData.symptoms.length >= 3;
        return true;
    };

    const handleSubmit = () => {
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        startTransition(() => {
            formAction(fd);
        });
    };

    const resetForm = () => {
        setShowResult(false);
        setStep(0);
        setFormData({
            age: "", gender: "Male", city: "", duration: "1-3 days", symptoms: "",
            fever: "no", breathingDifficulty: "no", seizure: "no", consciousnessNormal: "yes",
        });
        setRealtimeSpecs([]);
        setTopDoctors([]);
    };

    const progress = ((step + 1) / 3) * 100;

    // ── RESULT VIEW ───────────────────────────────────────
    if (showResult && state?.success && state.result) {
        const r = state.result;
        const isEmergency = r.urgency_level === "EMERGENCY";
        const isUrgent = r.urgency_level === "URGENT";

        return (
            <main className="container max-w-4xl mx-auto px-6 py-12 animate-fade-in text-slate-900">
                <div className="space-y-8">
                    {isEmergency && (
                        <Card className="border-none bg-red-600 text-white shadow-2xl shadow-red-500/30 overflow-hidden relative group">
                            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6 relative z-10">
                                <div className="w-20 h-20 bg-white/20 rounded-[2.5rem] flex items-center justify-center animate-pulse shrink-0">
                                    <Ambulance className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-3xl font-black tracking-tight mb-2 underline decoration-white/30 underline-offset-8 decoration-4">{t.emergencyTitle}</h3>
                                    <p className="text-red-50 text-lg font-bold tracking-tight opacity-90">{t.emergencyDesc}</p>
                                </div>
                            </CardContent>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        </Card>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <Badge className={`${isEmergency ? 'bg-red-500 hover:bg-red-500' : isUrgent ? 'bg-amber-500 hover:bg-amber-500' : 'bg-emerald-500 hover:bg-emerald-500'} text-white font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-xl border-none shadow-lg shadow-black/5`}>
                                {isEmergency ? "🚨 " : isUrgent ? "⚠️ " : "✅ "} {r.urgency_level}
                           </Badge>
                           <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-xl">
                               🏥 {r.recommended_speciality}
                           </Badge>
                        </div>
                        {r.is_ai_powered && (
                            <Badge className="bg-slate-900 text-white hover:bg-slate-900 font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> {t.aiPowered}
                            </Badge>
                        )}
                    </div>

                    {r.red_flag_detected && (
                        <Card className="border-rose-200 bg-rose-50 shadow-xl shadow-rose-500/5">
                            <CardContent className="p-6 flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-rose-200 flex items-center justify-center shrink-0">
                                    <ShieldAlert className="w-6 h-6 text-rose-700" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-rose-900 uppercase tracking-widest text-xs">Clinical Red Flag Identified</h4>
                                    <p className="text-rose-700 font-bold tracking-tight leading-relaxed">
                                        Immediate professional evaluation is required for your safety.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!isEmergency && (
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                               <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                                   <Calendar className="w-5 h-5 text-blue-600" /> Recommended Specialists in {formData.city}
                               </h3>
                            </div>
                            {loadingDoctors ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Skeleton className="h-32 rounded-3xl bg-slate-100" />
                                    <Skeleton className="h-32 rounded-3xl bg-slate-100" />
                                </div>
                            ) : topDoctors.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {topDoctors.map((doc) => (
                                        <NextLink key={doc.id} href={`/doctor/${doc.id}`} className="block group">
                                            <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/5 overflow-hidden group-hover:border-blue-300 transition-all group-hover:-translate-y-1">
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="space-y-1">
                                                            <h4 className="font-black text-lg tracking-tight group-hover:text-blue-600 transition-colors uppercase">{doc.name || doc.fullName}</h4>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.speciality} • {doc.hospital}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <div className="text-amber-500 font-black text-sm flex items-center gap-1">
                                                                <Star className="w-3.5 h-3.5 fill-amber-500" /> {doc.stars || 4.5}
                                                            </div>
                                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">{doc.distance || "Near you"}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-end text-blue-600 font-black text-[10px] uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        Book Appointment <ArrowRight className="w-3 h-3" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </NextLink>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">Scanning for available specialists...</p>
                                </div>
                            )}
                        </section>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="rounded-[2.5rem] bg-slate-50 border-slate-100 shadow-xl shadow-slate-200/5 h-full">
                            <CardContent className="p-8 space-y-4">
                                <div className="flex items-center gap-3 text-blue-600 mb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">{t.summaryTitle}</h4>
                                </div>
                                <p className="text-slate-600 font-bold leading-relaxed">{r.clinical_summary_for_doctor}</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] bg-indigo-50 border-indigo-100 shadow-xl shadow-indigo-500/5 h-full">
                            <CardContent className="p-8 space-y-4">
                                <div className="flex items-center gap-3 text-indigo-600 mb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">{t.aiReasoning}</h4>
                                </div>
                                <p className="text-slate-600 font-bold leading-relaxed italic">&quot;{r.ai_reasoning || r.patient_advice}&quot;</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-[2.5rem] bg-white border-slate-200 shadow-md">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                {isEmergency ? (
                                    <Button asChild size="lg" className="h-16 px-10 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 active:scale-95 transition-all">
                                        <NextLink href="/emergency">
                                            🚑 {t.emergencyTitle}
                                        </NextLink>
                                    </Button>
                                ) : (
                                    <Button asChild size="lg" className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                                        <NextLink href={`/search?speciality=${encodeURIComponent(r.recommended_speciality)}&city=${encodeURIComponent(formData.city)}`}>
                                            <Calendar className="w-6 h-6 mr-3" /> {t.bookBtn}
                                        </NextLink>
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={resetForm}
                                    className="h-16 px-8 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-3" /> {t.startOverBtn}
                                </Button>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3 mb-3 text-slate-400">
                                    <Info className="w-5 h-5" />
                                    <h4 className="font-black uppercase tracking-widest text-[10px]">{t.disclaimerTitle}</h4>
                                </div>
                                <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-tight opacity-70 italic">{r.disclaimer}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        );
    }

    return (
        <main className="container max-w-4xl mx-auto px-6 py-8 animate-fade-in text-slate-900" suppressHydrationWarning transition-all duration-500>
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" asChild className="text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                    <NextLink href="/"><ChevronLeft className="w-5 h-5 mr-1" /> Portal</NextLink>
                </Button>
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                    <Button
                        variant={lang === 'en' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setLang('en')}
                        className={`h-8 rounded-lg font-black text-[10px] uppercase tracking-widest ${lang === 'en' ? 'bg-white shadow-sm' : 'text-slate-400'}`}
                    >
                        English
                    </Button>
                    <Button
                        variant={lang === 'hi' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setLang('hi')}
                        className={`h-8 rounded-lg font-black text-[10px] uppercase tracking-widest ${lang === 'hi' ? 'bg-white shadow-sm' : 'text-slate-400'}`}
                    >
                        हिन्दी
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                   <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Bot className="w-3.5 h-3.5 mr-2" /> AI Hub
                        </Badge>
                        <Badge variant="outline" className="border-indigo-100 text-indigo-500 font-bold text-[9px] uppercase tracking-widest">v2.4 Live</Badge>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-1 uppercase" dangerouslySetInnerHTML={{ __html: t.heroTitle }} />
                    <p className="text-slate-500 text-base font-medium tracking-tight leading-relaxed">{t.heroSubtitle}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4 mb-10 px-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Clinical Triage Progress</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {step + 1} of 3</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/20 transition-all duration-700 ease-out" 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
                <div className="flex items-center gap-6 justify-center">
                    {STEPS(t).map((s, i) => (
                        <div key={i} className={`flex items-center gap-2 transition-all duration-500 ${step === i ? 'opacity-100 scale-100' : 'opacity-30 scale-90'}`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${step >= i ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {step > i ? '✓' : s.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest whitespace-nowrap hidden sm:block">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content Container */}
            <div className="relative min-h-[400px]">
                {/* Step 1 */}
                {step === 0 && (
                    <Card className="rounded-[3rem] border-slate-100 shadow-2xl shadow-slate-200/40 bg-white p-8 md:p-12 animate-in slide-in-from-right-10 duration-500 ease-out">
                        <CardHeader className="p-0 mb-10">
                            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                <User className="w-8 h-8 text-blue-600" /> {t.step1Title}
                            </CardTitle>
                            <CardDescription className="text-slate-500 text-lg font-medium tracking-tight mt-2">{t.step1Desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.ageLabel}</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 28"
                                        value={formData.age}
                                        onChange={(e) => updateField("age", e.target.value)}
                                        className="h-16 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-black text-xl transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.genderLabel}</Label>
                                    <Select value={formData.gender} onValueChange={(val) => updateField("gender", val)}>
                                        <SelectTrigger className="h-16 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-black text-xl transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl overflow-hidden">
                                            {GENDERS.map(g => (
                                                <SelectItem key={g} value={g} className="font-bold py-4 rounded-xl">{g}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.cityLabel}</Label>
                                <Input
                                    placeholder="Your current city"
                                    value={formData.city}
                                    onChange={(e) => updateField("city", e.target.value)}
                                    className="h-16 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-black transition-all"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="p-0 mt-12">
                            <Button
                                size="lg"
                                disabled={!canAdvance()}
                                onClick={() => setStep(1)}
                                className="w-full h-16 rounded-2xl bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-95 group"
                            >
                                {t.continueBtn} <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Step 2 */}
                {step === 1 && (
                    <Card className="rounded-[3rem] border-slate-100 shadow-2xl shadow-slate-200/40 bg-white p-8 md:p-12 animate-in slide-in-from-right-10 duration-500 ease-out">
                         <CardHeader className="p-0 mb-10">
                            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                <Activity className="w-8 h-8 text-indigo-600" /> {t.step2Title}
                            </CardTitle>
                            <CardDescription className="text-slate-500 text-lg font-medium tracking-tight mt-2">{t.step2Desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 space-y-10">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between ml-1">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.symptomsLabel}</Label>
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Min 3 characters</span>
                                </div>
                                <Textarea
                                    placeholder={lang === 'en' ? "Describe your health concerns in detail..." : "अपनी स्वास्थ्य समस्याओं के बारे में विस्तार से बताएं..."}
                                    value={formData.symptoms}
                                    onChange={(e) => updateField("symptoms", e.target.value)}
                                    className="min-h-[160px] rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:ring-4 font-bold text-lg transition-all p-6 shadow-inner"
                                />
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {realtimeSpecs.map((spec) => (
                                        <Badge key={spec} variant="outline" className="animate-in zoom-in-50 bg-indigo-50 border-indigo-100 text-indigo-600 font-black px-4 py-1.5 rounded-xl uppercase tracking-widest text-[9px] flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5" /> High Match: {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.durationLabel}</Label>
                                <Select value={formData.duration} onValueChange={(val) => updateField("duration", val)}>
                                    <SelectTrigger className="h-16 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20 focus-visible:ring-4 font-black transition-all">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl overflow-hidden">
                                        {DURATIONS.map(d => (
                                            <SelectItem key={d} value={d} className="font-bold py-4 rounded-xl">{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter className="p-0 mt-12 gap-4">
                             <Button
                                variant="outline"
                                onClick={() => setStep(0)}
                                className="flex-1 h-16 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5 mr-3" /> {t.backBtn}
                            </Button>
                            <Button
                                disabled={!canAdvance()}
                                onClick={() => setStep(2)}
                                className="flex-[2] h-16 rounded-2xl bg-indigo-600 border-2 border-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-500/20 transition-all active:scale-95 group"
                            >
                                {t.continueBtn} <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Step 3 */}
                {step === 2 && (
                    <Card className="rounded-[3rem] border-slate-100 shadow-2xl shadow-slate-200/40 bg-white p-8 md:p-12 animate-in slide-in-from-right-10 duration-500 ease-out">
                        <CardHeader className="p-0 mb-10">
                            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                <AlertTriangle className="w-8 h-8 text-rose-600" /> {t.step3Title}
                            </CardTitle>
                            <CardDescription className="text-slate-500 text-lg font-medium tracking-tight mt-2">{t.step3Desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Fever */}
                                <div 
                                    onClick={() => toggleFlag("fever")}
                                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${formData.fever === 'yes' ? 'bg-amber-50 border-amber-300 shadow-lg shadow-amber-500/5' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.fever === 'yes' ? 'bg-amber-200 text-amber-700' : 'bg-white text-slate-400'}`}>
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <span className="font-black text-slate-700 tracking-tight">{t.feverLabel}</span>
                                    </div>
                                    <div className={`h-6 w-6 rounded-full border-4 transition-all ${formData.fever === 'yes' ? 'bg-amber-500 border-amber-200 scale-110' : 'bg-white border-slate-200'}`} />
                                </div>

                                {/* Breathing */}
                                <div 
                                    onClick={() => toggleFlag("breathingDifficulty")}
                                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${formData.breathingDifficulty === 'yes' ? 'bg-rose-50 border-rose-300 shadow-lg shadow-rose-500/5 pulse-red' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.breathingDifficulty === 'yes' ? 'bg-rose-200 text-rose-700' : 'bg-white text-slate-400'}`}>
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        <span className="font-black text-slate-700 tracking-tight">{t.breathingLabel}</span>
                                    </div>
                                    <div className={`h-6 w-6 rounded-full border-4 transition-all ${formData.breathingDifficulty === 'yes' ? 'bg-rose-500 border-rose-200 scale-110' : 'bg-white border-slate-200'}`} />
                                </div>

                                {/* Seizure */}
                                <div 
                                    onClick={() => toggleFlag("seizure")}
                                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${formData.seizure === 'yes' ? 'bg-rose-50 border-rose-300 shadow-lg shadow-rose-500/5 pulse-red' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.seizure === 'yes' ? 'bg-rose-200 text-rose-700' : 'bg-white text-slate-400'}`}>
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <span className="font-black text-slate-700 tracking-tight">{t.seizureLabel}</span>
                                    </div>
                                    <div className={`h-6 w-6 rounded-full border-4 transition-all ${formData.seizure === 'yes' ? 'bg-rose-500 border-rose-200 scale-110' : 'bg-white border-slate-200'}`} />
                                </div>

                                 {/* Consciousness */}
                                <div 
                                    onClick={() => toggleFlag("consciousnessNormal")}
                                    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${formData.consciousnessNormal === 'no' ? 'bg-rose-50 border-rose-300 shadow-lg shadow-rose-500/5 pulse-red' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.consciousnessNormal === 'no' ? 'bg-rose-200 text-rose-700' : 'bg-white text-slate-400'}`}>
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        <span className="font-black text-slate-700 tracking-tight">{t.consciousnessLabel}</span>
                                    </div>
                                    <div className={`h-6 w-6 rounded-full border-4 transition-all ${formData.consciousnessNormal === 'no' ? 'bg-rose-500 border-rose-200 scale-110' : 'bg-white border-slate-200'}`} />
                                </div>
                            </div>

                            {state && !state.success && state.message && (
                                <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-sm tracking-tight animate-shake">
                                   ⚠️ {state.message}
                                </div>
                            )}

                        </CardContent>
                        <CardFooter className="p-0 mt-12 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="flex-1 h-16 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5 mr-3" /> {t.backBtn}
                            </Button>
                            <Button
                                disabled={isPending}
                                onClick={handleSubmit}
                                className="flex-[2] h-16 rounded-2xl bg-rose-600 border-2 border-rose-600 hover:bg-rose-700 text-white font-black text-lg shadow-xl shadow-rose-500/20 transition-all active:scale-95 group"
                            >
                                {isPending ? (
                                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> {t.analyzing}</>
                                ) : (
                                    <><CheckCircle2 className="w-6 h-6 mr-3" /> {t.analyzeBtn}</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>

            <style jsx global>{`
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(244, 63, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
                }
                .pulse-red { animation: pulse-red 2s infinite; }
            `}</style>

            <div className="mt-16 text-center space-y-4">
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> AI triage is not a definitive diagnosis
                </p>
                <div className="flex items-center justify-center gap-8 opacity-40">
                    <ShieldCheck className="w-8 h-8 text-slate-400" />
                    <Info className="w-8 h-8 text-slate-400" />
                    <Activity className="w-8 h-8 text-slate-400" />
                </div>
            </div>
        </main>
    );
}
