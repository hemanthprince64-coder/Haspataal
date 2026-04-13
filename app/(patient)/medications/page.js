'use client';

import { useActionState, useEffect, useState } from 'react';
import { addMedicationAction, deleteMedicationAction } from '@/app/actions';
import Link from 'next/link';
import { Pill, Plus, ChevronLeft, Calendar, Clock, AlertCircle, ShieldCheck, Info, FileText, Trash2, Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MedicationsList from "@/components/patient/MedicationsList";

const initialState = { message: '', success: false };

export default function MedicationsPage() {
    const [addState, addAction, isAdding] = useActionState(addMedicationAction, initialState);
    const [showForm, setShowForm] = useState(false);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getPatientFullProfile }) => {
            getPatientFullProfile().then(data => {
                setMedications(data?.medications || []);
                setLoading(false);
            });
        });
    }, [addState]);

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
                        <Badge variant="secondary" className="text-indigo-700 bg-indigo-100/50 hover:bg-indigo-100 border-indigo-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Pill className="w-3.5 h-3.5 mr-2" /> Medical Tracker
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Medications</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Active list of your prescribed and over-the-counter drugs.</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    size="lg" 
                    className={`${showForm ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 text-white'} h-16 px-8 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95`}
                >
                    {showForm ? 'Cancel Entry' : <><Plus className="w-6 h-6 mr-3" /> Add Medication</>}
                </Button>
            </div>

            <Card className="mb-10 rounded-[2rem] border-none bg-gradient-to-br from-violet-600 to-indigo-700 p-1 flex items-center overflow-hidden shadow-2xl shadow-indigo-500/20 group">
                <CardContent className="w-full bg-white/95 backdrop-blur-sm rounded-[1.85rem] p-6 flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-32 h-32 text-indigo-900" />
                    </div>
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-100">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-600 font-bold leading-relaxed">
                            <span className="text-indigo-600 font-black uppercase tracking-widest text-[10px] block mb-1">Safety First</span>
                            Comprehensive tracking prevents harmful drug interactions. Always keep this list updated.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {addState?.success && (
                <div className="mb-8 flex items-center gap-3 p-5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl animate-in slide-in-from-top-2">
                    <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                    <p className="font-bold tracking-tight">{addState.message}</p>
                </div>
            )}

            {showForm && (
                <Card className="mb-12 rounded-[2.5rem] border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-500">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">New Medication Entry</CardTitle>
                        <CardDescription className="text-slate-500 font-medium tracking-tight">Enter exact details as prescribed by your doctor.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form action={addAction} className="space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Drug Name / Molecule</Label>
                                <Input 
                                    name="drugName" 
                                    required 
                                    placeholder="e.g. Metformin 500mg" 
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 focus-visible:border-blue-300 text-lg font-bold transition-all" 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</Label>
                                    <Input 
                                        name="dose" 
                                        placeholder="e.g. 1 Tablet" 
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 focus-visible:border-blue-300 font-bold transition-all" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</Label>
                                    <Select name="frequency">
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold transition-all">
                                            <SelectValue placeholder="Select Frequency" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                                            <SelectItem value="OD" className="font-bold py-3 rounded-xl">Once Daily (OD)</SelectItem>
                                            <SelectItem value="BD" className="font-bold py-3 rounded-xl">Twice Daily (BD)</SelectItem>
                                            <SelectItem value="TDS" className="font-bold py-3 rounded-xl">Thrice Daily (TDS)</SelectItem>
                                            <SelectItem value="QID" className="font-bold py-3 rounded-xl">Four Times (QID)</SelectItem>
                                            <SelectItem value="SOS" className="font-bold py-3 rounded-xl">As Needed (SOS)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</Label>
                                    <Input 
                                        name="startDate" 
                                        type="date" 
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 focus-visible:border-blue-300 font-bold transition-all" 
                                    />
                                </div>
                            </div>

                            {addState?.message && !addState.success && (
                                <div className="flex items-center gap-3 p-5 bg-red-50 text-red-700 border border-red-100 rounded-2xl animate-shake">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                    <p className="font-bold text-sm tracking-tight">{addState.message}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isAdding}
                                className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isAdding ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Loggin Medication...</> : 'Save to My MedList'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Current Medications
                    </h3>
                    <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold tracking-tight px-3">
                        {medications.length} Active
                    </Badge>
                </div>
                
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-48 rounded-[2rem] bg-slate-100" />
                        ))}
                    </div>
                ) : (
                    <MedicationsList medications={medications} />
                )}
            </div>
        </main>
    );
}
