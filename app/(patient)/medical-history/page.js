'use client';

import { useActionState, useEffect, useState } from 'react';
import { saveMedicalHistoryAction } from '@/app/actions';
import Link from 'next/link';

const initialState = { message: '', success: false };

function TextAreaField({ label, name, defaultValue, placeholder, rows = 3 }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
            <textarea
                name={name}
                defaultValue={defaultValue || ''}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all outline-none resize-none"
            />
        </div>
    );
}

export default function MedicalHistoryPage() {
    const [state, formAction, isPending] = useActionState(saveMedicalHistoryAction, initialState);
    const [medicalHistory, setMedicalHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/app/actions').then(({ getPatientFullProfile }) => {
            getPatientFullProfile().then(data => {
                setMedicalHistory(data?.medicalHistory || {});
                setLoading(false);
            });
        });
    }, []);

    if (loading) {
        return <div className="py-12 text-center text-slate-500 animate-pulse font-medium">Loading medical history...</div>;
    }

    return (
        <div className="py-6 max-w-2xl mx-auto space-y-5 animate-fade-in-up">
            <div className="flex items-center gap-3">
                <Link href="/profile" className="text-medical-600 hover:text-medical-700 font-medium text-sm no-underline">← Back</Link>
                <h1 className="text-xl font-extrabold text-slate-900">Medical History</h1>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 flex items-center gap-3">
                <span className="text-2xl">🏥</span>
                <p className="text-sm text-emerald-700">Keep your medical history updated. This helps doctors provide better care and avoid adverse drug reactions.</p>
            </div>

            {state?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                    ✅ {state.message}
                </div>
            )}

            <form action={formAction} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-sm">
                <TextAreaField
                    label="Chronic Diseases"
                    name="chronicDiseases"
                    defaultValue={medicalHistory.chronicDiseases}
                    placeholder="e.g. Diabetes, Hypertension, Asthma..."
                />
                <TextAreaField
                    label="Past Illnesses"
                    name="pastIllnesses"
                    defaultValue={medicalHistory.pastIllnesses}
                    placeholder="e.g. Dengue (2023), Typhoid (2020)..."
                />
                <TextAreaField
                    label="Surgeries"
                    name="surgeries"
                    defaultValue={medicalHistory.surgeries}
                    placeholder="e.g. Appendectomy (2019), Knee replacement..."
                />
                <TextAreaField
                    label="Allergies"
                    name="allergies"
                    defaultValue={medicalHistory.allergies}
                    placeholder="e.g. Dust, Pollen, Shellfish..."
                />
                <TextAreaField
                    label="Drug Allergies"
                    name="drugAllergies"
                    defaultValue={medicalHistory.drugAllergies}
                    placeholder="e.g. Penicillin, Sulfa drugs..."
                />
                <TextAreaField
                    label="Hospitalizations"
                    name="hospitalizations"
                    defaultValue={medicalHistory.hospitalizations}
                    placeholder="e.g. Apollo Hospital, Jan 2023 — Pneumonia..."
                />

                {state?.message && !state.success && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                        ⚠️ {state.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 shadow-md cursor-pointer"
                >
                    {isPending ? '⏳ Saving...' : '✓ Save Medical History'}
                </button>
            </form>
        </div>
    );
}
