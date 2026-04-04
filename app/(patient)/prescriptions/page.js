'use client';

import { useEffect, useState } from "react";
import { getPatientFullProfile, uploadPrescriptionAction } from "@/app/actions";
import Link from "next/link";
import { format } from "date-fns";

import { Skeleton } from 'boneyard-js/react';
import PrescriptionsList from "@/components/patient/PrescriptionsList";

export default function PrescriptionsPage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUploadMsg, setShowUploadMsg] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        getPatientFullProfile().then(data => {
            setPatient(data);
            setLoading(false);
        });
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setTimeout(async () => {
             const fakeUrl = `https://example.com/mock-prescription-${Date.now()}.pdf`;
             const formData = new FormData();
             formData.append('fileUrl', fakeUrl);
             formData.append('notes', 'Patient uploaded prescription report');
             const res = await uploadPrescriptionAction(null, formData);
             setShowUploadMsg(res.message);
             setIsUploading(false);
             if (res.success) loadData();
        }, 1500);
    };

    const prescriptions = patient?.prescriptions || [];

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <Link href="/profile" className="text-blue-600 font-bold mb-2 inline-block hover:underline">← Back to Profile</Link>
                    <h1 className="text-3xl font-black text-[#0D2B55] tracking-tight">Prescriptions</h1>
                    <p className="text-slate-500 font-medium mt-1">Doctor structured meds and your uploaded scripts.</p>
                </div>
                <div className="relative shrink-0">
                    <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                    />
                    <button className="bg-blue-600 w-full text-white px-6 py-3 rounded-xl font-black shadow-sm hover:bg-blue-700 transition pointer-events-none">
                        {isUploading ? 'Uploading...' : '📤 Upload Prescription'}
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-2 font-bold uppercase tracking-widest">PDF or Images</p>
                </div>
            </div>

            {showUploadMsg && (
                <div className="p-4 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200">
                    {showUploadMsg}
                </div>
            )}

            <Skeleton name="prescriptions-list" loading={loading}>
                <PrescriptionsList prescriptions={prescriptions} />
            </Skeleton>
        </div>
    );
}
