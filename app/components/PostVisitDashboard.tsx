import React, { useState } from 'react';

interface Medication {
    id: string;
    medName: string;
    dosage: string;
    duration: string;
    instructions?: string;
    morning: boolean;
    afternoon: boolean;
    night: boolean;
    beforeFood: boolean;
}

interface FollowUp {
    recommendedDays: number;
    reason: string;
    bookingStatus: string;
}

interface RedFlag {
    symptom: string;
    action: string;
}

interface CareJourney {
    conditionSimple: string;
    explanation: string;
    seriousness: string;
    timeline?: string;
    medications: Medication[];
    followUp?: FollowUp;
    redFlags: RedFlag[];
    visit: {
        appointment?: {
            doctor: { fullName: string };
        };
        createdAt: string;
    };
}

interface PostVisitDashboardProps {
    journey: CareJourney;
}

const PostVisitDashboard: React.FC<PostVisitDashboardProps> = ({ journey }) => {
    const [medsTaken, setMedsTaken] = useState<Record<string, boolean>>({});

    const toggleMed = (id: string) => {
        setMedsTaken(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const dateStr = new Date(journey.visit.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <div className="w-full space-y-6">
            {/* Header: The Diagnosis & Seriousness */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-indigo-950 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <span className="text-8xl font-black">✨</span>
                </div>
                
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            journey.seriousness === 'Urgent' ? 'bg-red-500 text-white' :
                            journey.seriousness === 'Monitor' ? 'bg-amber-400 text-slate-900' :
                            'bg-emerald-400 text-slate-900'
                        }`}>
                            {journey.seriousness} Condition
                        </span>
                        <span className="text-slate-400 text-xs font-medium">• {dateStr}</span>
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight max-w-2xl">
                        Your recovery plan for <span className="text-indigo-300">{journey.conditionSimple}</span>
                    </h1>
                    
                    <p className="text-slate-300 max-w-xl leading-relaxed text-sm sm:text-base">
                        {journey.explanation}
                    </p>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                        <div className="flex -space-x-2">
                             <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">🩺</div>
                             <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">🤖</div>
                        </div>
                        <p className="text-xs text-slate-400">
                            Planned by <span className="text-white font-bold">{journey.visit.appointment?.doctor.fullName || 'Consultant'}</span> & Haspataal AI
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Medication Scheduler (CORE ADHERENCE) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-soft p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Your Daily Recovery Dose</h3>
                                <p className="text-sm text-slate-500">Stay on track for a faster recovery</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-indigo-600">{journey.timeline || '7 Days'}</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Timeline</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {journey.medications.map((med) => (
                                <div key={med.id} className="group relative overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 p-5 hover:bg-white hover:border-indigo-100 hover:shadow-lg transition-all duration-300">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div onClick={() => toggleMed(med.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl cursor-pointer transition-all duration-300 ${
                                                medsTaken[med.id] ? 'bg-emerald-500 text-white scale-110' : 'bg-white border border-slate-200 text-slate-300 hover:border-indigo-300'
                                            }`}>
                                                {medsTaken[med.id] ? '✓' : '💊'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{med.medName}</h4>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {med.dosage} • {med.duration} • {med.beforeFood ? 'Before' : 'After'} Food
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className={`px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${med.morning ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-400 opacity-40'}`}>
                                                <span>☀️ Morning</span>
                                            </div>
                                            <div className={`px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${med.afternoon ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-400 opacity-40'}`}>
                                                <span>🌤️ P.M.</span>
                                            </div>
                                            <div className={`px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${med.night ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 opacity-40'}`}>
                                                <span>🌙 Night</span>
                                            </div>
                                        </div>
                                    </div>
                                    {med.instructions && (
                                        <div className="mt-4 pt-4 border-t border-slate-200/50">
                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">PRO-TIP</p>
                                            <p className="text-xs text-slate-600 italic">&quot;{med.instructions}&quot;</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Safety & Conversion Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Safety Red Flags */}
                    <div className="rounded-[2.5rem] bg-rose-50 border border-rose-100 p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <h3 className="text-lg font-black text-rose-900 tracking-tight">Watch For These</h3>
                        </div>
                        
                        <div className="space-y-3">
                            {journey.redFlags.map((flag, idx) => (
                                <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-rose-200">
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">DANGER SIGN</p>
                                    <p className="text-sm font-bold text-slate-900 leading-snug">{flag.symptom}</p>
                                    <p className="text-xs text-rose-700 mt-2 font-medium">🚀 ACTION: {flag.action}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CONVERSION CTA (Follow-up) */}
                    {journey.followUp && (
                        <div className="rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-4">
                                📈 Recovery Booster
                            </div>
                            <h3 className="text-xl font-black mb-3 leading-tight">Book your follow-up checkup</h3>
                            <p className="text-sm text-indigo-100 mb-6 opacity-90">
                                {journey.followUp.reason}
                            </p>
                            
                            <div className="p-4 bg-white/10 rounded-2xl mb-8">
                                <p className="text-xs mb-1 opacity-70">Recommended Date</p>
                                <p className="text-lg font-bold">12th April, 2026</p>
                            </div>

                            <button className="w-full py-4 bg-white text-indigo-600 rounded-3xl font-black text-base shadow-lg hover:bg-slate-50 transition-all border-none cursor-pointer">
                                Confirm Appointment
                            </button>
                        </div>
                    )}

                    <div className="text-center px-4">
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
                            AI-generated summary for guidance. <br/> Seek immediate help if symptoms worsen.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostVisitDashboard;
