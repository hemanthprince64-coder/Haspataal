import React from 'react';

interface Observation {
    type: string;
    value: string;
    unit?: string;
    severity: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
}

interface AiSummaryCardProps {
    summary: string;
    observations?: Observation[];
    doctorName?: string;
    date?: string;
}

const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ summary, observations, doctorName, date }) => {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-saas hover:shadow-hover transition-all duration-300 p-6 sm:p-8">
            {/* Aesthetic Gradient Accents */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-medical-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-50 text-medical-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                            ✨ AI Health Analysis
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Post-Visit Care Plan</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Prepared with {doctorName || 'your doctor'} on {date || 'your last visit'}
                        </p>
                    </div>
                    
                    {/* Progress indicator (aesthetic) */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-700">Verified by AI Safety Pass</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Summary Section */}
                    <div className="lg:col-span-8 space-y-8">
                        <section>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">The Big Picture</h3>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                {summary.split('\n').map((line, i) => (
                                    <p key={i} className="mb-4">{line}</p>
                                ))}
                            </div>
                        </section>

                        <section className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                             {/* Decorative mesh */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]" />
                            
                            <h3 className="relative z-10 text-medical-400 text-xs font-bold uppercase tracking-widest mb-4">Your Next Action Plan</h3>
                            <ul className="relative z-10 space-y-3 m-0 p-0 list-none">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-medical-400/20 text-medical-400 flex items-center justify-center text-[10px]">✅</span>
                                    <span className="text-sm text-slate-200">Follow the prescribed medication schedule consistently.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-medical-400/20 text-medical-400 flex items-center justify-center text-[10px]">✅</span>
                                    <span className="text-sm text-slate-200">Monitor your BP twice daily and log it in the Vitals section.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-medical-400/20 text-medical-400 flex items-center justify-center text-[10px]">✅</span>
                                    <span className="text-sm text-slate-200">Follow up with Laboratory for blood work in 3 days.</span>
                                </li>
                            </ul>
                        </section>
                    </div>

                    {/* Vitals & Observations Sidebar */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Clinical Findings</h3>
                        {observations && observations.length > 0 ? (
                            observations.map((obs, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl border transition-colors ${
                                    obs.severity === 'CRITICAL' ? 'bg-red-50 border-red-100 shadow-sm' : 
                                    obs.severity === 'ABNORMAL' ? 'bg-amber-50 border-amber-100 shadow-sm' : 
                                    'bg-white/50 border-slate-100'
                                }`}>
                                    <div className="flex justify-between items-start mb-1 text-[10px] font-bold uppercase tracking-wide">
                                        <span className="text-slate-400">{obs.type}</span>
                                        <span className={
                                            obs.severity === 'CRITICAL' ? 'text-red-500' : 
                                            obs.severity === 'ABNORMAL' ? 'text-amber-500' : 
                                            'text-emerald-500'
                                        }>{obs.severity}</span>
                                    </div>
                                    <div className="text-xl font-black text-slate-900">
                                        {obs.value} <span className="text-xs font-medium text-slate-400 ml-0.5">{obs.unit}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                                <span className="text-2xl mb-2">📊</span>
                                <p className="text-xs text-slate-400 font-medium">No recorded vitals for this visit</p>
                            </div>
                        )}
                        
                        <div className="mt-4 p-4 rounded-2xl bg-medical-600 text-white shadow-soft">
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Next Appointment</p>
                            <p className="text-sm font-semibold mb-3">Re-evaluation in 2 weeks</p>
                            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all no-underline text-white text-center border-none">
                                Set Reminder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiSummaryCard;
