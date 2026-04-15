'use client';

import { useActionState, useEffect, useState } from 'react';
import { saveInsuranceAction, deleteInsuranceAction, getPatientFullProfile } from '@/app/actions';
import Link from 'next/link';
import { Shield, Plus, ChevronLeft, ShieldCheck, CreditCard, Calendar, ArrowRight, AlertCircle, Loader2, Sparkles, Building2, Wallet, Trash2, History, Landmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const initialState = { message: '', success: false };

export default function InsurancePage() {
    const [state, formAction, isPending] = useActionState(saveInsuranceAction, initialState);
    const [showForm, setShowForm] = useState(false);
    const [insuranceList, setInsuranceList] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        getPatientFullProfile().then(data => {
            setInsuranceList(data?.insurance || []);
            setLoading(false);
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 0);
        return () => clearTimeout(timer);
    }, [state]);

    return (
        <main className="container max-w-4xl mx-auto px-6 py-10 animate-fade-in text-slate-900">
            <Button asChild variant="ghost" className="mb-8 text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                <Link href="/profile" className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back to Profile
                </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-indigo-700 bg-indigo-100/50 hover:bg-indigo-100 border-indigo-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Shield className="w-3.5 h-3.5 mr-2" /> Coverage
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-2">Medical Insurance</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Store policy details for cashless admissions and rapid claims.</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    size="lg" 
                    className={`${showForm ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} h-16 px-8 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/10 transition-all active:scale-95`}
                >
                    {showForm ? 'Cancel' : <><Plus className="w-6 h-6 mr-3" /> Add Policy</>}
                </Button>
            </div>

            <Card className="mb-10 rounded-[2rem] border-none bg-gradient-to-br from-indigo-600 to-blue-700 p-1 flex items-center overflow-hidden shadow-2xl shadow-indigo-500/20 group">
                <CardContent className="w-full bg-white/95 backdrop-blur-sm rounded-[1.85rem] p-6 flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-32 h-32 text-indigo-900" />
                    </div>
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-100">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-600 font-bold leading-relaxed">
                            <span className="text-indigo-600 font-black uppercase tracking-widest text-[10px] block mb-1">Financial Safety</span>
                            Keeping your insurance updated ensures zero-delay processing during hospital admissions and emergency scenarios.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {state?.success && (
                <div className="mb-8 flex items-center gap-3 p-5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl animate-in slide-in-from-top-2">
                    <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                    <p className="font-bold tracking-tight">{state.message}</p>
                </div>
            )}

            {showForm && (
                <Card className="mb-12 rounded-[2.5rem] border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-500">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <CardTitle className="text-2xl font-black tracking-tight">Register New Policy</CardTitle>
                        <CardDescription className="text-slate-500 font-medium tracking-tight">Enter details exactly as printed on your insurance ID card.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form action={formAction} className="space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Insurance Provider</Label>
                                <Input 
                                    name="company" 
                                    required 
                                    placeholder="e.g. Star Health, LIC, ICICI Lombard" 
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-indigo-500/20 focus-visible:ring-4 font-bold transition-all" 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Policy Number</Label>
                                    <Input 
                                        name="policyNumber" 
                                        required
                                        placeholder="e.g. POL-2024-XXXX" 
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-indigo-500/20 focus-visible:ring-4 font-bold font-mono transition-all" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Coverage Amount (₹)</Label>
                                    <Input 
                                        name="coverageAmount" 
                                        type="number"
                                        placeholder="e.g. 5,00,000" 
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-indigo-500/20 focus-visible:ring-4 font-bold transition-all" 
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</Label>
                                    <Input 
                                        name="expiryDate" 
                                        type="date" 
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus-visible:ring-indigo-500/20 focus-visible:ring-4 font-bold transition-all" 
                                    />
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
                                {isPending ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Virtualizing Policy...</> : 'Save Insurance Policy'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <History className="w-4 h-4" /> Your Active Policies
                    </h3>
                    <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold tracking-tight px-3">
                        {insuranceList.length} Units
                    </Badge>
                </div>
                
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2].map(i => <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-slate-100" />)}
                    </div>
                ) : (
                    <>
                        {insuranceList.length === 0 ? (
                            <div className="py-24 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/60 animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/20">
                                    <Shield className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No active policies</h3>
                                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                                    Store your insurance details now to avoid last-minute documentation during emergencies.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {insuranceList.map((policy) => (
                                    <Card key={policy.id} className="group rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/50 border-slate-200/60 shadow-xl shadow-slate-200/5 overflow-hidden hover:border-indigo-300 hover:shadow-2xl transition-all duration-500 relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Shield className="w-32 h-32 text-indigo-900" />
                                        </div>
                                        
                                        <CardContent className="p-8 relative z-10">
                                            <div className="flex justify-between items-start gap-4 mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-indigo-900/5">
                                                        <Building2 className="w-7 h-7 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-2xl tracking-tight leading-tight group-hover:text-indigo-600 transition-colors uppercase">{policy.company}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                                Verified Provider
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <form action={deleteInsuranceAction}>
                                                    <input type="hidden" name="insuranceId" value={policy.id} />
                                                    <Button variant="ghost" size="icon" type="submit" className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </form>
                                            </div>

                                            <div className="space-y-4 mb-8">
                                                <div className="bg-slate-900 p-5 rounded-2xl relative overflow-hidden group/card">
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Policy Number</div>
                                                        <CreditCard className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <div className="text-xl font-black text-white tracking-[0.15em] font-mono group-hover/card:text-indigo-300 transition-colors">
                                                        {policy.policyNumber.replace(/(.{4})/g, '$1 ')}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                                                        <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Coverage</div>
                                                        <div className="text-base font-black text-slate-700 tracking-tight">₹{policy.coverageAmount.toLocaleString('en-IN')}</div>
                                                    </div>
                                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                                        <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Valid Until</div>
                                                        <div className="text-base font-black text-slate-700 tracking-tight">
                                                            {policy.expiryDate ? new Date(policy.expiryDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Lifetime'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <Button variant="outline" className="w-full border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all">
                                                View Digital Card <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
