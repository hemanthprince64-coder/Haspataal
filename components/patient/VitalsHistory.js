import { format } from "date-fns";
import { Activity, Clock, Weight, Ruler, Heart, Droplets, Wind, Thermometer, ChevronRight, ActivitySquare, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function VitalsHistory({ vitals }) {
    if (!vitals || vitals.length === 0) {
        return (
            <div className="py-24 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/60 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/20">
                    <ActivitySquare className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No historical logs</h3>
                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    Your recorded biometrics over time will appear here to help you monitor clinical trends.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {vitals.slice().reverse().map((vital) => (
                <Card key={vital.id} className="group hover:border-rose-200 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-500 rounded-[2.5rem] bg-white border-slate-200/60 overflow-hidden relative">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between px-8 py-5 bg-slate-50/50 border-b border-slate-100 group-hover:bg-rose-50/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                    <Clock className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Recorded At</div>
                                    <div className="text-sm font-black text-slate-700">
                                        {format(new Date(vital.recordedAt), "eee, MMM d, yyyy • hh:mm a")}
                                    </div>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-slate-200 text-slate-400">
                                Log ID: {vital.id.toString().slice(-6).toUpperCase()}
                            </Badge>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {vital.weight && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Weight className="w-3.5 h-3.5 text-indigo-500" /> Weight
                                        </div>
                                        <div className="text-xl font-black text-slate-900 tracking-tight">{vital.weight}<span className="text-xs font-bold text-slate-300 ml-1">kg</span></div>
                                    </div>
                                )}
                                {vital.bloodPressure && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Heart className="w-3.5 h-3.5 text-rose-500" /> BP
                                        </div>
                                        <div className="text-xl font-black text-slate-900 tracking-tight">{vital.bloodPressure}</div>
                                    </div>
                                )}
                                {vital.bloodSugar && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Droplets className="w-3.5 h-3.5 text-amber-500" /> Sugar
                                        </div>
                                        <div className="text-xl font-black text-slate-900 tracking-tight">{vital.bloodSugar}<span className="text-xs font-bold text-slate-300 ml-1">mg/dL</span></div>
                                    </div>
                                )}
                                {vital.spo2 && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Wind className="w-3.5 h-3.5 text-teal-500" /> SpO₂
                                        </div>
                                        <div className="text-xl font-black text-slate-900 tracking-tight">{vital.spo2}<span className="text-xs font-bold text-slate-300 ml-1">%</span></div>
                                    </div>
                                )}
                            </div>

                            {(vital.height || vital.bmi || vital.pulse || vital.temperature) && (
                                <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {vital.height && (
                                        <div>
                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Height</div>
                                            <div className="text-sm font-bold text-slate-600">{vital.height} cm</div>
                                        </div>
                                    )}
                                    {vital.bmi && (
                                        <div>
                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">BMI</div>
                                            <div className="text-sm font-bold text-slate-600">{vital.bmi}</div>
                                        </div>
                                    )}
                                    {vital.pulse && (
                                        <div>
                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Pulse</div>
                                            <div className="text-sm font-bold text-slate-600">{vital.pulse} bpm</div>
                                        </div>
                                    )}
                                    {vital.temperature && (
                                        <div>
                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Temp</div>
                                            <div className="text-sm font-bold text-slate-600">{vital.temperature} °F</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
