'use client';

import { useActionState, useEffect, useState } from 'react';
import { addVitalAction } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function VitalsPage() {
    const [state, formAction, isPending] = useActionState(addVitalAction, initialState);
    const [showForm, setShowForm] = useState(false);
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getPatientFullProfile }) => {
            getPatientFullProfile().then(data => {
                setVitals(data?.vitals || []);
                setLoading(false);
            });
        });
    }, [state]);

    if (loading) {
        return <div className="py-12 text-center text-slate-500 animate-pulse font-medium">Loading vitals...</div>;
    }

    const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : {};

    return (
        <div className="py-6 max-w-2xl mx-auto space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/profile" className="text-medical-600 hover:text-medical-700 font-medium text-sm no-underline">← Back</Link>
                    <h1 className="text-xl font-extrabold text-slate-900">Vitals Tracker</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-2 px-3.5 rounded-xl border border-red-200 transition-all cursor-pointer"
                >
                    {showForm ? '✕ Close' : '+ Record'}
                </button>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-4 border border-red-200 flex items-center gap-3">
                <span className="text-2xl">❤️</span>
                <p className="text-sm text-red-700">Record your vitals regularly. Each entry is timestamped so you can track trends over time.</p>
            </div>

            {state?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                    ✅ {state.message}
                </div>
            )}

            {showForm && (
                <form action={formAction} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight (kg)</label>
                            <input name="weight" type="number" step="0.1" placeholder="72.5" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Height (cm)</label>
                            <input name="height" type="number" step="0.1" placeholder="170" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blood Pressure</label>
                            <input name="bloodPressure" placeholder="e.g. 120/80" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pulse (bpm)</label>
                            <input name="pulse" type="number" placeholder="72" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blood Sugar (mg/dL)</label>
                            <input name="bloodSugar" type="number" step="0.1" placeholder="110" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SpO₂ (%)</label>
                            <input name="spo2" type="number" step="0.1" placeholder="98" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Temp (°F)</label>
                            <input name="temperature" type="number" step="0.1" placeholder="98.6" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none" />
                        </div>
                    </div>

                    <p className="text-xs text-slate-400">BMI will be auto-calculated from weight and height.</p>

                    {state?.message && !state.success && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            ⚠️ {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all duration-200 shadow-md cursor-pointer"
                    >
                        {isPending ? '⏳ Recording...' : '❤️ Record Vitals'}
                    </button>
                </form>
            )}

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Weight', value: latestVital.weight || '—', unit: 'kg', icon: '⚖️', color: 'bg-blue-50 border-blue-200 text-blue-600' },
                    { label: 'BP', value: latestVital.bloodPressure || '—', unit: '', icon: '🫀', color: 'bg-red-50 border-red-200 text-red-600' },
                    { label: 'Sugar', value: latestVital.bloodSugar || '—', unit: 'mg/dL', icon: '🩸', color: 'bg-amber-50 border-amber-200 text-amber-600' },
                    { label: 'SpO₂', value: latestVital.spo2 || '—', unit: '%', icon: '🫁', color: 'bg-teal-50 border-teal-200 text-teal-600' },
                ].map(card => (
                    <div key={card.label} className={`rounded-xl p-3 border text-center ${card.color}`}>
                        <div className="text-xl mb-1">{card.icon}</div>
                        <div className="text-lg font-bold">{card.value}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{card.label} {card.unit && `(${card.unit})`}</div>
                    </div>
                ))}
            </div>

            {vitals.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <div className="text-4xl mb-3">📊</div>
                    <p className="text-slate-500 text-sm">Your vitals history will appear here after you record entries.</p>
                    <p className="text-slate-400 text-xs mt-1">Click "+ Record" to log your first vitals reading.</p>
                </div>
            ) : (
                <div className="space-y-3 mt-6">
                    <h3 className="text-sm font-bold text-slate-800 px-1">Vitals History</h3>
                    <div className="space-y-3">
                        {vitals.slice().reverse().map((vital) => (
                            <div key={vital.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-2">
                                <span className="text-xs font-semibold text-slate-400 border-b pb-2 mb-1">{new Date(vital.recordedAt).toLocaleString()}</span>
                                <div className="grid grid-cols-3 gap-2 text-sm text-slate-700">
                                    {vital.weight && <div><b>Wt:</b> {vital.weight} kg</div>}
                                    {vital.height && <div><b>Ht:</b> {vital.height} cm</div>}
                                    {vital.bmi && <div><b>BMI:</b> {vital.bmi}</div>}
                                    {vital.bloodPressure && <div><b>BP:</b> {vital.bloodPressure}</div>}
                                    {vital.pulse && <div><b>Pulse:</b> {vital.pulse}</div>}
                                    {vital.bloodSugar && <div><b>Sugar:</b> {vital.bloodSugar}</div>}
                                    {vital.spo2 && <div><b>SpO₂:</b> {vital.spo2}%</div>}
                                    {vital.temperature && <div><b>Temp:</b> {vital.temperature}°F</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
