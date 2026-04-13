import { Weight, Heart, Droplets, Activity, Thermometer, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function VitalsQuickStats({ latestVital }) {
    const stats = [
        { 
            label: 'Weight', 
            value: latestVital.weight || '—', 
            unit: 'kg', 
            Icon: Weight, 
            color: 'text-indigo-600', 
            bgColor: 'bg-indigo-50 border-indigo-100' 
        },
        { 
            label: 'BP', 
            value: latestVital.bloodPressure || '—', 
            unit: '', 
            Icon: Heart, 
            color: 'text-rose-600', 
            bgColor: 'bg-rose-50 border-rose-100' 
        },
        { 
            label: 'Sugar', 
            value: latestVital.bloodSugar || '—', 
            unit: 'mg/dL', 
            Icon: Droplets, 
            color: 'text-amber-600', 
            bgColor: 'bg-amber-50 border-amber-100' 
        },
        { 
            label: 'SpO₂', 
            value: latestVital.spo2 || '—', 
            unit: '%', 
            Icon: Wind, 
            color: 'text-teal-600', 
            bgColor: 'bg-teal-50 border-teal-100' 
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ label, value, unit, Icon, color, bgColor }) => (
                <Card key={label} className={`rounded-[2rem] border-none shadow-xl shadow-slate-200/20 group hover:scale-[1.05] transition-all duration-500 overflow-hidden`}>
                    <CardContent className={`p-6 flex flex-col items-center justify-center text-center h-full relative ${bgColor}`}>
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Icon className="w-12 h-12" />
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-all group-hover:rotate-6 ${color}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 tabular-nums">
                            {value}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">
                            {label} {unit && <span className="text-[8px] font-bold opacity-50 ml-0.5">({unit})</span>}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
