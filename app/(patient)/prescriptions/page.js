'use client';

import { useEffect, useState } from "react";
import { getPatientFullProfile, uploadPrescriptionAction } from "@/app/actions";
import Link from "next/link";
import { format } from "date-fns";
import { FileText, Upload, ChevronLeft, ShieldCheck, Info, FileSearch, Sparkles, Loader2, Plus, ArrowUpRight, FolderOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PrescriptionsList from "@/components/patient/PrescriptionsList";

export default function PrescriptionsPage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUploadMsg, setShowUploadMsg] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const loadData = () => {
        setLoading(true);
        getPatientFullProfile().then(data => {
            setPatient(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        let active = true;
        getPatientFullProfile().then(data => {
            if (active) {
                setPatient(data);
                setLoading(false);
            }
        });
        return () => { active = false; };
    }, []);

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
        <main className="container max-w-5xl mx-auto px-6 py-10 animate-fade-in">
            <Button asChild variant="ghost" className="mb-8 text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                <Link href="/profile" className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back to Profile
                </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <FileText className="w-3.5 h-3.5 mr-2" /> Medical Vault
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Prescriptions</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Access your digital scripts and manage secondary pharmacy uploads.</p>
                </div>
                
                <div className="relative group">
                    <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        disabled={isUploading}
                    />
                    <Button 
                        disabled={isUploading}
                        className="bg-blue-600 hover:bg-blue-700 h-16 px-8 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all relative z-10"
                    >
                        {isUploading ? (
                            <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Digitizing...</>
                        ) : (
                            <><Upload className="w-6 h-6 mr-3" /> Upload New Script</>
                        )}
                    </Button>
                    {!isUploading && (
                        <p className="text-[10px] text-center text-slate-400 mt-2 font-black uppercase tracking-[0.2em]">PDF / Images Supported</p>
                    )}
                </div>
            </div>

            <Card className="mb-10 rounded-[2rem] border-none bg-gradient-to-br from-blue-600 to-indigo-700 p-1 flex items-center overflow-hidden shadow-2xl shadow-blue-500/20 group">
                <CardContent className="w-full bg-white/95 backdrop-blur-sm rounded-[1.85rem] p-6 flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-32 h-32 text-blue-900" />
                    </div>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-600 font-bold leading-relaxed">
                            <span className="text-blue-600 font-black uppercase tracking-widest text-[10px] block mb-1">Encrypted Storage</span>
                            All prescriptions are stored in a secure, HIPAA-compliant vault. Only you and authorized doctors can access them.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {showUploadMsg && (
                <div className="mb-8 flex items-center gap-3 p-5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl animate-in slide-in-from-top-2">
                    <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                    <p className="font-bold tracking-tight">{showUploadMsg}</p>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" /> Available Documents
                    </h3>
                    <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold tracking-tight px-3">
                        {prescriptions.length} Records
                    </Badge>
                </div>
                
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Skeleton key={i} className="h-64 rounded-[2rem] bg-slate-100" />
                        ))}
                    </div>
                ) : (
                    <PrescriptionsList prescriptions={prescriptions} />
                )}
            </div>
        </main>
    );
}
