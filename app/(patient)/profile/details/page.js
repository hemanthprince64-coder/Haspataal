'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    User, Phone, Mail, Calendar, Droplets, Ruler, 
    Weight, ShieldAlert, HeartPulse, Sparkles, ChevronLeft,
    Edit2, PhoneCall
} from "lucide-react";
import { getPatientFullProfile } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientDetailsPage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatientFullProfile().then(data => {
            setPatient(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="container max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <p className="text-slate-400 font-medium animate-pulse">Safely retrieving your clinical profile...</p>
            </div>
        );
    }

    const {
        name, phone, email, nickname, profilePhotoUrl,
        bloodGroup, height, weight, dob, gender,
        emergencyContactName, emergencyContactPhone
    } = patient || {};

    const stats = [
        { label: "Blood Group", value: bloodGroup || "A+", icon: <Droplets className="w-6 h-6" />, color: "text-rose-600", bg: "bg-rose-50" },
        { label: "Height", value: height ? `${height} cm` : "175 cm", icon: <Ruler className="w-6 h-6" />, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Weight", value: weight ? `${weight} kg` : "72 kg", icon: <Weight className="w-6 h-6" />, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    const displayDob = dob ? new Date(dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "12 Jan 1992";

    return (
        <div className="container max-w-5xl mx-auto px-4 py-8 animate-fade-in space-y-10">
            {/* Navigation & Header */}
            <div className="flex items-center justify-between">
                <Button asChild variant="ghost" className="text-slate-500 hover:text-blue-600 gap-2 font-bold px-0">
                    <Link href="/profile">
                        <ChevronLeft className="w-5 h-5" /> Back to Profile
                    </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl border-slate-200 font-bold gap-2">
                    <Link href="/profile/edit">
                        <Edit2 className="w-4 h-4" /> Edit Profile
                    </Link>
                </Button>
            </div>

            {/* Profile Hero Card */}
            <Card className="overflow-hidden border-slate-200 shadow-xl shadow-blue-900/5 rounded-[2rem] bg-white group hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500">
                <CardContent className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="relative">
                            <Avatar className="w-40 h-40 rounded-[2.5rem] border-8 border-slate-50 shadow-2xl overflow-hidden ring-1 ring-blue-100">
                                <AvatarImage src={profilePhotoUrl} className="object-cover" />
                                <AvatarFallback className="text-5xl font-black text-blue-600 bg-blue-50">
                                    {(name || 'P').charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl border-4 border-white transition-transform group-hover:scale-110">
                                <Sparkles className="w-6 h-6 fill-white" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                                    Member since 2023
                                </Badge>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                                    {name || nickname}
                                </h1>
                                <p className="text-2xl font-bold text-slate-400">
                                    Patient ID: <span className="text-blue-600 font-black">HP-{patient?.id ? patient.id.slice(-6).toUpperCase() : '------'}</span>
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-2 border-emerald-100 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest h-auto">
                                    Verified Member
                                </Badge>
                                <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-2 border-amber-100 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest h-auto">
                                    Haspataal Gold
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vitals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group hover:border-blue-200 transition-all">
                        <CardContent className="p-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                    {stat.icon}
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Details Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="flex items-center gap-4 text-xl font-extrabold text-slate-900">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            Personal Bio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-6 space-y-0">
                        <DetailItem icon={<User className="w-4 h-4" />} label="Full Name" value={name} />
                        <DetailItem icon={<Mail className="w-4 h-4" />} label="Email Address" value={email || "Not provided"} />
                        <DetailItem icon={<Phone className="w-4 h-4" />} label="Phone Number" value={phone} />
                        <DetailItem icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={displayDob} />
                        <DetailItem icon={<HeartPulse className="w-4 h-4" />} label="Gender" value={gender || "Male"} />
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="border-rose-100 shadow-sm rounded-[2rem] overflow-hidden bg-rose-50/20">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="flex items-center gap-4 text-xl font-extrabold text-rose-600">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            Emergency Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-6 space-y-6">
                        <div className="space-y-0 text-rose-900">
                            <DetailItem icon={<User className="w-4 h-4" />} label="Contact Person" value={emergencyContactName || "Guardian"} />
                            <DetailItem icon={<ShieldAlert className="w-4 h-4" />} label="Relationship" value="Emergency Partner" />
                            <DetailItem icon={<Phone className="w-4 h-4" />} label="Contact Number" value={emergencyContactPhone || displayPhone} />
                        </div>
                        
                        <Button className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xl shadow-rose-900/10 uppercase tracking-widest gap-3 active:scale-95 transition-all">
                            <PhoneCall className="w-5 h-5" /> Initiate Emergency Call
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DetailItem({ icon, label, value }) {
    return (
        <div className="flex flex-col py-5 border-b border-slate-50 last:border-0 gap-1 group">
            <div className="flex items-center gap-2">
                <span className="text-slate-300 group-hover:text-blue-400 transition-colors">{icon}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{value}</span>
        </div>
    );
}

