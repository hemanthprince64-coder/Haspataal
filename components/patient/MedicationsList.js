import { deleteMedicationAction } from '@/app/actions';
import { Pill, Trash2, Calendar, Clock, AlertCircle, Info, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function MedicationsList({ medications }) {
    if (!medications || medications.length === 0) {
        return (
            <div className="py-24 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/60 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/20">
                    <Pill className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No medications logged</h3>
                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    Keep track of your dosages and schedule by adding your active medications.
                </p>
                <Button asChild variant="outline" className="mt-10 border-slate-200 hover:bg-white rounded-2xl h-14 px-8 font-black text-slate-600 transition-all hover:scale-105 active:scale-95">
                    <Link href="/medications">+ Log First Entry</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {medications.map((med) => (
                <Card key={med.id} className="group hover:border-violet-300 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 rounded-[2rem] bg-white border-slate-200/60 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 sm:p-8">
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center border border-violet-100 group-hover:scale-110 transition-transform duration-500">
                                        <Pill className="w-7 h-7 text-violet-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight capitalize group-hover:text-violet-600 transition-colors">
                                            {med.drugName}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                Active
                                            </Badge>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Prescribed</span>
                                        </div>
                                    </div>
                                </div>
                                <form action={deleteMedicationAction}>
                                    <input type="hidden" name="id" value={med.id} />
                                    <Button variant="ghost" size="icon" type="submit" className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </form>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50 group-hover:bg-violet-50/50 transition-colors">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5">
                                        <Activity className="w-3.5 h-3.5 text-blue-500" /> Dose
                                    </div>
                                    <div className="font-extrabold text-slate-900 tracking-tight">{med.dose || '1 Unit'}</div>
                                </div>
                                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50 group-hover:bg-violet-50/50 transition-colors">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5">
                                        <Clock className="w-3.5 h-3.5 text-emerald-500" /> Frequency
                                    </div>
                                    <div className="font-extrabold text-slate-900 tracking-tight">{med.frequency}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-8 py-5 bg-slate-50 border-t border-slate-100 group-hover:bg-violet-50/30 transition-colors duration-300">
                             <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500">Started {new Date(med.startDate).toLocaleDateString()}</span>
                             </div>
                             <div className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                                <Info className="w-3.5 h-3.5" /> Details
                             </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

import Link from 'next/link';
