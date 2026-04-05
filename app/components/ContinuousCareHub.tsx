import React, { useState } from 'react';
import { logMedicationAction, submitCheckInAction } from '@/app/actions';

interface RecoveryStep {
    dayNumber: number;
    expectedSymptoms: string;
    markers: string;
    guidance: string;
}

interface Medication {
    id: string;
    medName: string;
    schedule: string;
    morning: boolean;
    afternoon: boolean;
    night: boolean;
}

interface ContinuousCareHubProps {
    data: {
        journeyId: string;
        currentDay: number;
        condition: string;
        explanation: string;
        todayPlan: RecoveryStep;
        fullHistory: RecoveryStep[];
        medications: Medication[];
        engagements: any[];
        checkIns: any[];
    };
}

const ContinuousCareHub: React.FC<ContinuousCareHubProps> = ({ data }) => {
    const [activeDay, setActiveDay] = useState(data.currentDay);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedStep = data.fullHistory.find(s => s.dayNumber === activeDay) || data.todayPlan;

    const handleLogMed = async (medName: string, schedule: string) => {
        setIsSubmitting(true);
        try {
            await logMedicationAction(data.journeyId, medName, schedule);
            // In a real app, we'd trigger a revalidation or state update
            alert(`Logged ${medName} for ${schedule}!`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckIn = async (status: 'BETTER' | 'SAME' | 'WORSE') => {
        setIsSubmitting(true);
        try {
            await submitCheckInAction(data.journeyId, data.currentDay, status);
            alert(`Thanks for checking in! We've updated your recovery log.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full space-y-8 animate-fade-in pb-20">
            {/* ── RECOVERY PROGRESS HEADER ── */}
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 sm:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <span className="text-9xl font-black">🏥</span>
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-medical-500/20 text-medical-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-md border border-medical-500/20">
                            <span className="w-2 h-2 rounded-full bg-medical-400 animate-pulse" />
                            Live Recovery Journey
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
                            Day <span className="text-medical-400">{data.currentDay}</span> <span className="text-slate-500 text-3xl font-medium">of 14</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed">
                            Treating <span className="text-white">{data.condition}</span>. You are halfway to full recovery.
                        </p>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                    strokeDasharray={364.4} 
                                    strokeDashoffset={364.4 - (364.4 * data.currentDay / 14)}
                                    className="text-medical-400 transition-all duration-1000 ease-out" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black">{Math.round((data.currentDay / 14) * 100)}%</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Done</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 14-DAY ROADMAP (Horizontal Scroll) ── */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Your 14-Day Roadmap</h3>
                    <span className="text-[10px] font-bold text-indigo-500">Tap a day to view details</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-2">
                    {data.fullHistory.map((step) => (
                        <button
                            key={step.dayNumber}
                            onClick={() => setActiveDay(step.dayNumber)}
                            className={`flex-shrink-0 w-16 h-20 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border ${
                                activeDay === step.dayNumber 
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-110' 
                                : step.dayNumber < data.currentDay 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'
                            }`}
                        >
                            <span className="text-[10px] font-black uppercase">{step.dayNumber === data.currentDay ? 'Today' : `D-${step.dayNumber}`}</span>
                            <span className="text-xl">{step.dayNumber < data.currentDay ? '✓' : '🗓️'}</span>
                        </button>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── LEFT COL: TODAY'S FOCUS ── */}
                <div className="lg:col-span-12 space-y-8">
                    {/* Expectations Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft">
                        <div className="flex flex-col sm:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Day {activeDay} Guidance</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{selectedStep?.guidance}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expected Symptoms</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedStep?.expectedSymptoms}</p>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-indigo-50 border border-indigo-100">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Recovery Markers</p>
                                        <p className="text-sm font-bold text-indigo-700">{selectedStep?.markers}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Today's Tasks */}
                            {activeDay === data.currentDay && (
                                <div className="w-full sm:w-80 space-y-4">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Daily Actions</h4>
                                    
                                    {/* Med Checklist */}
                                    <div className="space-y-3">
                                        {data.medications.map(med => (
                                            <div key={med.id} className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold">{med.medName}</span>
                                                    <span className="text-[10px] text-slate-400">{med.schedule}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {med.morning && <button onClick={() => handleLogMed(med.medName, 'Morning')} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-bold transition-colors">☀️ AM</button>}
                                                    {med.afternoon && <button onClick={() => handleLogMed(med.medName, 'Afternoon')} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-bold transition-colors">🌦️ PM</button>}
                                                    {med.night && <button onClick={() => handleLogMed(med.medName, 'Night')} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-bold transition-colors">🌙 NT</button>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Symptom Check-in */}
                                    <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex flex-col items-center text-center">
                                        <p className="text-xs font-bold text-slate-900 mb-4">How are you feeling?</p>
                                        <div className="flex gap-3 justify-center w-full">
                                            <button onClick={() => handleCheckIn('BETTER')} className="w-12 h-12 rounded-2xl bg-white shadow-soft text-xl hover:scale-110 active:scale-95 transition-all">🚀</button>
                                            <button onClick={() => handleCheckIn('SAME')} className="w-12 h-12 rounded-2xl bg-white shadow-soft text-xl hover:scale-110 active:scale-95 transition-all">😐</button>
                                            <button onClick={() => handleCheckIn('WORSE')} className="w-12 h-12 rounded-2xl bg-rose-500 text-white shadow-lg text-xl hover:scale-110 active:scale-95 transition-all">🤒</button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-3 font-medium">Response updates your urgency score</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContinuousCareHub;
