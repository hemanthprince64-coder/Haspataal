'use client';

import { useActionState, useEffect, useState } from 'react';
import { saveInsuranceAction, deleteInsuranceAction } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function InsurancePage() {
    const [state, formAction, isPending] = useActionState(saveInsuranceAction, initialState);
    const [showForm, setShowForm] = useState(false);
    const [insuranceList, setInsuranceList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getPatientFullProfile }) => {
            getPatientFullProfile().then(data => {
                setInsuranceList(data?.insurance || []);
                setLoading(false);
            });
        });
    }, [state]);

    if (loading) {
        return <div className="py-12 text-center text-slate-500 animate-pulse font-medium">Loading insurance details...</div>;
    }

    return (
        <div className="py-6 max-w-2xl mx-auto space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/profile" className="text-medical-600 hover:text-medical-700 font-medium text-sm no-underline">← Back</Link>
                    <h1 className="text-xl font-extrabold text-slate-900">Insurance</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2 px-3.5 rounded-xl border border-indigo-200 transition-all cursor-pointer"
                >
                    {showForm ? '✕ Close' : '+ Add'}
                </button>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-200 flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <p className="text-sm text-indigo-700">Store your insurance details for quick access during hospital admissions and emergencies.</p>
            </div>

            {state?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                    ✅ {state.message}
                </div>
            )}

            {showForm && (
                <form action={formAction} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Insurance Company *</label>
                        <input name="company" required placeholder="e.g. Star Health, LIC, ICICI Lombard" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Number</label>
                            <input name="policyNumber" placeholder="e.g. POL-202401-XXXX" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Coverage Amount (₹)</label>
                            <input name="coverageAmount" type="number" placeholder="e.g. 500000" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                        <input name="expiryDate" type="date" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none" />
                    </div>

                    {state?.message && !state.success && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            ⚠️ {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-md cursor-pointer"
                    >
                        {isPending ? '⏳ Saving...' : '🛡️ Save Insurance'}
                    </button>
                </form>
            )}

            {insuranceList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <div className="text-4xl mb-3">🛡️</div>
                    <p className="text-slate-500 text-sm">Your insurance policies will appear here.</p>
                    <p className="text-slate-400 text-xs mt-1">Click "+ Add" to add an insurance policy.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 px-1">Active Policies</h3>
                    {insuranceList.map((policy) => (
                        <div key={policy.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800">{policy.company}</h4>
                                <p className="text-sm text-slate-500 mt-1">Policy No: <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{policy.policyNumber}</span></p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Coverage: ₹{policy.coverageAmount.toLocaleString('en-IN')}</span>
                                    {policy.expiryDate && (
                                        <span className="text-xs text-slate-500">Exp: {new Date(policy.expiryDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                            <form action={deleteInsuranceAction}>
                                <input type="hidden" name="id" value={policy.id} />
                                <button type="submit" className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors tooltip" aria-label="Remove Policy">
                                    ✕
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
