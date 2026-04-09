"use client";

import { useState, useEffect } from "react";
import { getPatientFullProfile, getCareTimelineAction } from "@/app/actions";
import ContinuousCareHub from "@/app/components/ContinuousCareHub";
import Link from "next/link";

export default function RecoveryPage() {
    const [recoveryData, setRecoveryData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatientFullProfile().then(p => {
            const lastVisit = p?.visits?.[0] || p?.appointments?.[0]?.visit;
            if (lastVisit?.id) {
                getCareTimelineAction(lastVisit.id).then(data => {
                    setRecoveryData(data);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-medical-500 animate-spin" />
                <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching Care Journey...</p>
            </div>
        );
    }

    if (!recoveryData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center animate-fade-in p-8">
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-4xl shadow-soft">🏥</div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">No Active Recovery Plan</h1>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Your recovery journey starts after a hospital consultation. Book a visit or consult MedChat AI to get started.
                    </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Link href="/search" className="btn-saas-primary py-3 rounded-xl">📅 Book Appointment</Link>
                    <Link href="/medchat" className="btn-saas-secondary py-3 rounded-xl border-slate-100">🤖 MedChat AI Triage</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24 pt-6">
            <ContinuousCareHub data={recoveryData} />
        </div>
    );
}
