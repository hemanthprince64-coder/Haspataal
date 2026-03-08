'use client';

import { useActionState, useEffect, useState } from 'react';
import { addVaccinationAction } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function VaccinationsPage() {
    const [state, formAction, isPending] = useActionState(addVaccinationAction, initialState);
    const [showForm, setShowForm] = useState(false);
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getPatientFullProfile }) => {
            getPatientFullProfile().then(data => {
                setVaccinations(data?.vaccinations || []);
                setLoading(false);
            });
        });
    }, [state]);

    if (loading) {
        return <div className="py-12 text-center text-slate-500 animate-pulse font-medium">Loading vaccinations...</div>;
    }

    return (
        <div className="py-6 max-w-2xl mx-auto space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/profile" className="text-medical-600 hover:text-medical-700 font-medium text-sm no-underline">← Back</Link>
                    <h1 className="text-xl font-extrabold text-slate-900">Vaccinations</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 py-2 px-3.5 rounded-xl border border-teal-200 transition-all cursor-pointer"
                >
                    {showForm ? '✕ Close' : '+ Add'}
                </button>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-4 border border-teal-200 flex items-center gap-3">
                <span className="text-2xl">💉</span>
                <p className="text-sm text-teal-700">Keep vaccination records updated, especially for children. Track upcoming due dates to never miss a dose.</p>
            </div>

            {state?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                    ✅ {state.message}
                </div>
            )}

            {showForm && (
                <form action={formAction} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vaccine Name *</label>
                        <input name="vaccineName" required placeholder="e.g. BCG, DPT, COVID-19 Booster" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Given</label>
                            <input name="dateGiven" type="date" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Due Date</label>
                            <input name="nextDueDate" type="date" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none" />
                        </div>
                    </div>

                    {state?.message && !state.success && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            ⚠️ {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 rounded-xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-all duration-200 shadow-md cursor-pointer"
                    >
                        {isPending ? '⏳ Adding...' : '+ Add Vaccination'}
                    </button>
                </form>
            )}

            {vaccinations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <div className="text-4xl mb-3">💉</div>
                    <p className="text-slate-500 text-sm">Your vaccination records will appear here.</p>
                    <p className="text-slate-400 text-xs mt-1">Click "+ Add" to record a vaccination.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 px-1">Vaccination History</h3>
                    {vaccinations.map((vaccine) => (
                        <div key={vaccine.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800">{vaccine.vaccineName}</h4>
                                <p className="text-sm text-slate-500">Date Given: {new Date(vaccine.dateGiven).toLocaleDateString()}</p>
                                {vaccine.nextDueDate && (
                                    <p className="text-xs text-teal-600 font-semibold mt-1">Next Due: {new Date(vaccine.nextDueDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
