'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
    Search, Calendar, Siren, UserCircle, MapPin, 
    Wallet, LogOut, FileDown, ChevronRight, UserCog,
    Sparkles, ArrowUpRight
} from "lucide-react";
import { getPatientFullProfile, patientLogout } from "@/app/actions";
import ProfileCard from "@/components/patient/ProfileCard";
import ClinicalServices from "@/components/patient/ClinicalServices";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const actionSections = [
    { name: "Book Appointment", href: "/search", icon: <Search className="w-6 h-6" />, desc: "Find doctors & hospitals", bg: "bg-blue-50", color: "text-blue-600" },
    { name: "My Appointments", href: "/appointments", icon: <Calendar className="w-6 h-6" />, desc: "Upcoming & Past", bg: "bg-indigo-50", color: "text-indigo-600" },
    { name: "Emergency SOS", href: "/emergency", icon: <Siren className="w-6 h-6" />, desc: "Ambulance help", bg: "bg-rose-50", color: "text-rose-600" }
];

export default function ProfilePage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatientFullProfile().then(data => {
            if (data) setPatient(data);
            setLoading(false);
        }).catch(err => {
            console.error("Profile load err:", err);
            setLoading(false);
        });
    }, []);

    const walletBalance = patient?.wallet?.balance || 0;
    const formattedBalance = parseFloat(walletBalance).toFixed(2);

    const personalSections = [
        { name: "Profile Details", href: "/profile/details", icon: <UserCircle className="w-6 h-6" />, desc: "Complete medical bio", bg: "bg-sky-50", color: "text-sky-600" },
        { name: "Saved Addresses", href: "/addresses", icon: <MapPin className="w-6 h-6" />, desc: "Home, Work & More", bg: "bg-emerald-50", color: "text-emerald-600" },
        { name: "Haspataal Wallet", href: "/wallet", icon: <Wallet className="w-6 h-6" />, desc: `Balance: ₹${formattedBalance}`, bg: "bg-amber-50", color: "text-amber-600" }
    ];

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8 animate-fade-in space-y-12">
            {/* Header Section */}
            <div className="space-y-6">
                {loading ? (
                    <Skeleton className="h-48 w-full rounded-[2rem]" />
                ) : (
                    <ProfileCard patient={patient} />
                )}
            </div>

            {/* Quick Actions */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Quick Actions</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {actionSections.map((s) => (
                        <Link key={s.href} href={s.href} className="group no-underline">
                            <Card className="border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 rounded-[1.5rem] bg-white overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                            {s.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                {s.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium truncate">{s.desc}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Personal Data */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <UserCog className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Account & Personal</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-[1.5rem]" />)
                    ) : (
                        personalSections.map((s) => (
                            <Link key={s.href} href={s.href} className="group no-underline">
                                <Card className="border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 rounded-[1.5rem] bg-white overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                                {s.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                                                    {s.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 font-medium truncate">{s.desc}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            {/* Clinical Services */}
            <section className="space-y-6 pb-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinical Services</h2>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => import('@/app/export').then(m => m.downloadPatientReport(patient))}
                        className="h-10 rounded-xl px-4 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold text-[11px] uppercase tracking-widest gap-2"
                    >
                        <FileDown className="w-4 h-4" /> PDF Health Report
                    </Button>
                </div>
                
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                    </div>
                ) : (
                    <ClinicalServices />
                )}
            </section>

            {/* Logout Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-10 md:static md:bg-transparent md:border-0 md:p-0">
                <form action={patientLogout}>
                    <Button 
                        type="submit" 
                        variant="destructive" 
                        size="lg"
                        className="w-full h-14 md:h-12 rounded-[1.25rem] md:rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-rose-500/10 transition-all active:scale-95 group"
                    >
                        <LogOut className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                        Terminate Secured Session
                    </Button>
                </form>
            </div>
        </div>
    );
}

