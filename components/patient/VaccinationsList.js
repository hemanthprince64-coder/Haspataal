import { Syringe, Calendar, Clock, CheckCircle2, ChevronRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VaccinationsList({ vaccinations }) {
    if (!vaccinations || vaccinations.length === 0) {
        return (
            <div className="py-24 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/60 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/20">
                    <Syringe className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No vaccination records</h3>
                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    Log your immunizations to keep track of booster shots and travel certificates.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vaccinations.map((vaccine) => (
                <Card key={vaccine.id} className="group hover:border-teal-300 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 rounded-[2rem] bg-white border-slate-200/60 overflow-hidden relative">
                    <div className="absolute top-0 right-[-20px] p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                        <Syringe className="w-32 h-32 text-teal-900" />
                    </div>
                    
                    <CardContent className="p-8 relative z-10">
                        <div className="flex justify-between items-start gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-100 group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-teal-900/5">
                                    <Syringe className="w-7 h-7 text-teal-600" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tight capitalize group-hover:text-teal-600 transition-colors">
                                        {vaccine.vaccineName}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                            Completed
                                        </Badge>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Certified</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/50 group-hover:bg-white transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                                        <Calendar className="w-3.5 h-3.5 text-blue-500" /> Date Administered
                                    </div>
                                    <div className="font-extrabold text-slate-900 tracking-tight">
                                        {new Date(vaccine.dateGiven).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {vaccine.nextDueDate && (
                                <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100/50 group-hover:bg-white transition-all ring-1 ring-teal-100/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] text-teal-600 uppercase tracking-widest font-black">
                                            <Clock className="w-3.5 h-3.5" /> Next Dose Due
                                        </div>
                                        <Badge className="bg-teal-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg">
                                            {new Date(vaccine.nextDueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
