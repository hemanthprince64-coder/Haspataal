'use client';

import { useActionState, useEffect, useState } from 'react';
import { addVitalAction } from '@/app/actions';
import Link from 'next/link';

import { Skeleton } from 'boneyard-js/react';
import VitalsQuickStats from "@/components/patient/VitalsQuickStats";
import VitalsHistory from "@/components/patient/VitalsHistory";

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

            <Skeleton name="vitals-quick-stats" loading={loading}>
                <VitalsQuickStats latestVital={latestVital} />
            </Skeleton>

            <div className="space-y-3 mt-6">
                <h3 className="text-sm font-bold text-slate-800 px-1">Vitals History</h3>
                <Skeleton name="vitals-history" loading={loading}>
                    <VitalsHistory vitals={vitals} />
                </Skeleton>
            </div>
        </div>
    );
}
