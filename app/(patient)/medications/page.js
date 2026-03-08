'use client';

import { useActionState, useEffect, useState } from 'react';
import { addMedicationAction, deleteMedicationAction } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '', success: false };

export default function MedicationsPage() {
    const [addState, addAction, isAdding] = useActionState(addMedicationAction, initialState);
    const [showForm, setShowForm] = useState(false);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getPatientFullProfile }) => {
            getPatientFullProfile().then(data => {
                setMedications(data?.medications || []);
                setLoading(false);
            });
        });
    }, [addState]);

    if (loading) {
        return <div className="py-12 text-center text-slate-500 animate-pulse font-medium">Loading medications...</div>;
    }

    return (
        <div className="py-6 max-w-2xl mx-auto space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/profile" className="text-medical-600 hover:text-medical-700 font-medium text-sm no-underline">← Back</Link>
                    <h1 className="text-xl font-extrabold text-slate-900">Medications</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-medical-600 bg-medical-50 hover:bg-medical-100 py-2 px-3.5 rounded-xl border border-medical-200 transition-all cursor-pointer"
                >
                    {showForm ? '✕ Close' : '+ Add'}
                </button>
            </div>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-200 flex items-center gap-3">
                <span className="text-2xl">💊</span>
                <p className="text-sm text-violet-700">Track your current medications. This helps doctors avoid drug interactions and ensures safe prescriptions.</p>
            </div>

            {addState?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                    ✅ {addState.message}
                </div>
            )}

            {showForm && (
                <form action={addAction} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Drug Name *</label>
                        <input name="drugName" required placeholder="e.g. Metformin" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all outline-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dose</label>
                            <input name="dose" placeholder="e.g. 500 mg" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Frequency</label>
                            <select name="frequency" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all outline-none">
                                <option value="">Select</option>
                                <option value="OD">Once daily (OD)</option>
                                <option value="BD">Twice daily (BD)</option>
                                <option value="TDS">Three times (TDS)</option>
                                <option value="QID">Four times (QID)</option>
                                <option value="SOS">As needed (SOS)</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
                            <input name="startDate" type="date" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all outline-none" />
                        </div>
                    </div>

                    {addState?.message && !addState.success && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            ⚠️ {addState.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full py-3 rounded-xl text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-all duration-200 shadow-md cursor-pointer"
                    >
                        {isAdding ? '⏳ Adding...' : '+ Add Medication'}
                    </button>
                </form>
            )}

            {medications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <div className="text-4xl mb-3">💊</div>
                    <p className="text-slate-500 text-sm">Your medications will appear here after you add them.</p>
                    <p className="text-slate-400 text-xs mt-1">Click "+ Add" to record your first medication.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 px-1">Current Medications</h3>
                    {medications.map((med) => (
                        <div key={med.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800">{med.drugName}</h4>
                                <p className="text-sm text-slate-500">{med.dose} • {med.frequency}</p>
                                <p className="text-xs text-slate-400 mt-1">Start: {new Date(med.startDate).toLocaleDateString()}</p>
                            </div>
                            <form action={deleteMedicationAction}>
                                <input type="hidden" name="id" value={med.id} />
                                <button type="submit" className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors tooltip" aria-label="Delete">
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
