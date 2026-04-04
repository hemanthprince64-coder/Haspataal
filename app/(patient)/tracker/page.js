"use client";

import { useActionState } from 'react';
import { savePregnancyProfileAction } from '@/app/actions';
import { useState, useEffect } from 'react';
import Link from "next/link";

const initialState = { message: '', success: false };

import { Skeleton } from 'boneyard-js/react';
import MaternalHealthHero from "@/components/patient/MaternalHealthHero";

export default function TrackerPage() {
    const [state, formAction, isPending] = useActionState(savePregnancyProfileAction, initialState);
    const [showForm, setShowForm] = useState(false);
    const [pregnancyProfile, setPregnancyProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getPatientFullProfile }) => {
            getPatientFullProfile().then(data => {
                setPregnancyProfile(data?.pregnancyProfile || {});
                setLoading(false);
            });
        });
    }, []);

    return (
        <div className="py-6 max-w-2xl mx-auto space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/profile" className="text-medical-600 hover:text-medical-700 font-medium text-sm no-underline">← Back</Link>
                    <h1 className="text-xl font-extrabold text-slate-900">Pregnancy Tracker</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100 py-2 px-3.5 rounded-xl border border-pink-200 transition-all cursor-pointer"
                >
                    {showForm ? '✕ Close' : '✏️ Edit'}
                </button>
            </div>

            <Skeleton name="maternal-health-hero" loading={loading}>
                <MaternalHealthHero />
            </Skeleton>

            {state?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                    ✅ {state.message}
                </div>
            )}

            {showForm && (
                <form action={formAction} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">LMP (Last Menstrual Period)</label>
                            <input name="lmp" type="date" defaultValue={pregnancyProfile.lmp ? new Date(pregnancyProfile.lmp).toISOString().split('T')[0] : ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">EDD (Expected Delivery)</label>
                            <input name="edd" type="date" defaultValue={pregnancyProfile.edd ? new Date(pregnancyProfile.edd).toISOString().split('T')[0] : ''} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gestational Age (weeks)</label>
                            <input name="gestationalAge" type="number" defaultValue={pregnancyProfile.gestationalAge || ''} placeholder="e.g. 24" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ANC Visits</label>
                            <input name="ancVisits" type="number" defaultValue={pregnancyProfile.ancVisits || ''} placeholder="Number of visits" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            High Risk Pregnancy
                            <input name="highRisk" type="checkbox" value="true" defaultChecked={pregnancyProfile.highRisk} className="rounded" />
                        </label>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Danger Signs</label>
                        <textarea name="dangerSigns" defaultValue={pregnancyProfile.dangerSigns || ''} placeholder="e.g. Bleeding, severe headache, reduced fetal movement..." rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none resize-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery Plan</label>
                        <textarea name="deliveryPlan" defaultValue={pregnancyProfile.deliveryPlan || ''} placeholder="e.g. Hospital name, preferred doctor, delivery type..." rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none resize-none" />
                    </div>

                    {state?.message && !state.success && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            ⚠️ {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 rounded-xl text-sm font-bold bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 transition-all duration-200 shadow-md cursor-pointer"
                    >
                        {isPending ? '⏳ Saving...' : '🤰 Save Profile'}
                    </button>
                </form>
            )}

            {/* Quick info cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4 bg-blue-50 border border-blue-200 text-center">
                    <div className="text-xl mb-1">📅</div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Next Scan</div>
                    <div className="text-sm text-slate-600 mt-1">Schedule via appointments</div>
                </div>
                <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 text-center">
                    <div className="text-xl mb-1">⚖️</div>
                    <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Weight Log</div>
                    <div className="text-sm text-slate-600 mt-1">Track in Vitals section</div>
                </div>
            </div>
        </div>
    );
}
