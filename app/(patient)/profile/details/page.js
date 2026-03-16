'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPatientFullProfile } from "@/app/actions";

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
            <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-medium animate-pulse">Loading detailed health profile...</p>
            </div>
        );
    }

    const {
        name, phone, email, nickname, profilePhotoUrl,
        bloodGroup, height, weight, dob, gender,
        emergencyContactName, emergencyContactPhone
    } = patient || {};

    const stats = [
        { label: "Blood Group", value: bloodGroup || "A+", icon: "🩸", color: "from-red-500/20 to-orange-500/20", textColor: "text-red-400" },
        { label: "Height", value: height ? `${height} cm` : "175 cm", icon: "📏", color: "from-blue-500/20 to-cyan-500/20", textColor: "text-blue-400" },
        { label: "Weight", value: weight ? `${weight} kg` : "72 kg", icon: "⚖️", color: "from-emerald-500/20 to-teal-500/20", textColor: "text-emerald-400" },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
            {/* Header Section */}
            <div className="card-clinical p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="relative">
                    <div className="w-32 h-32 rounded-3xl border-4 border-blue-50 bg-white overflow-hidden shadow-xl shrink-0">
                        {profilePhotoUrl ? (
                            <img src={profilePhotoUrl} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-blue-600 bg-blue-50">
                                {(name || 'P').charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg shadow-lg border-4 border-white">
                        ✓
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-senior-h1">{name || nickname}</h1>
                    <p className="text-2xl font-bold text-slate-500">
                        Patient ID: <span className="text-[#0D2B55]">HP-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </p>
                    <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="px-5 py-2 rounded-xl bg-emerald-50 border-2 border-emerald-100 text-sm font-black text-emerald-700 uppercase tracking-widest">
                            Verified Member
                        </span>
                        <span className="px-5 py-2 rounded-xl bg-blue-50 border-2 border-blue-100 text-sm font-black text-blue-700 uppercase tracking-widest">
                            Haspataal Gold
                        </span>
                    </div>
                </div>

                <Link href="/profile/edit" className="btn-medical w-full md:w-auto">
                    Edit Profile
                </Link>
            </div>

            {/* Senior-Friendly Vitals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className="card-clinical card-clinical-hover p-8 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-4xl">{stat.icon}</span>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                        </div>
                        <p className="text-4xl font-black text-[#0D2B55]">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Large Information Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="card-clinical p-10 space-y-8">
                    <h3 className="text-senior-h2 flex items-center gap-4">
                        <span className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">👤</span>
                        Personal Details
                    </h3>
                    <div className="space-y-2 text-xl">
                        <DetailItem label="Full Name" value={name} />
                        <DetailItem label="Email Address" value={email || "Not provided"} />
                        <DetailItem label="Phone Number" value={phone} />
                        <DetailItem label="Date of Birth" value={dob instanceof Date ? dob.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (dob || "12 Jan 1992")} />
                        <DetailItem label="Gender" value={gender || "Male"} />
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="card-clinical p-10 space-y-8">
                    <h3 className="text-senior-h2 flex items-center gap-4 text-red-600">
                        <span className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">🚨</span>
                        Emergency Help
                    </h3>
                    <div className="space-y-2 text-xl">
                        <DetailItem label="Contact Person" value={emergencyContactName || "Ramesh Kumar"} />
                        <DetailItem label="Relationship" value="Father" />
                        <DetailItem label="Contact Number" value={emergencyContactPhone || "+91 98765 43210"} />
                        <div className="pt-6">
                            <button className="w-full py-5 rounded-2xl bg-red-600 text-white text-xl font-black shadow-xl hover:bg-red-700 transition-all active:scale-95 uppercase tracking-widest">
                                CALL FOR EMERGENCY
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Extra Large Action Card */}
            <div className="card-clinical p-10 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black tracking-tight">Need Expert Assistance?</h3>
                        <p className="text-xl text-blue-100 font-medium">Our clinical support team is active 24/7 for you.</p>
                    </div>
                    <button className="bg-white text-blue-700 px-10 py-5 rounded-2xl text-xl font-black shadow-lg hover:bg-blue-50 transition-all">
                        Talk to MedChat AI
                    </button>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }) {
    const displayValue = value instanceof Date
        ? value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : (typeof value === 'object' && value !== null ? JSON.stringify(value) : value);

    return (
        <div className="flex flex-col py-4 border-b border-slate-100 gap-1">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-2xl font-bold text-[#0D2B55]">{displayValue}</span>
        </div>
    );
}
