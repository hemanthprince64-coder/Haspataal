"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { getPatientFullProfile } from "@/app/actions";

import { 
    Stethoscope, 
    Building2, 
    Microscope, 
    ClipboardList, 
    HelpingHand, 
    Target, 
    Globe, 
    CheckCircle, 
    HeartPulse, 
    Brain, 
    Baby, 
    Ear, 
    Bone, 
    Syringe, 
    Sparkles, 
    PhoneCall, 
    BotMessageSquare, 
    CalendarCheck,
    Search
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DoctorCard = dynamic(() => import("./components/DoctorCard"), {
    loading: () => <div className="h-32 w-full bg-slate-100 animate-pulse rounded-2xl"></div>
});

import ContinuousCareHub from "@/app/components/ContinuousCareHub";
import { getCareTimelineAction } from "@/app/actions";

export default function PatientHome() {
    const [patient, setPatient] = useState<any>(null);
    const [recentAnalysis, setRecentAnalysis] = useState<any>(null);

    useEffect(() => {
        getPatientFullProfile().then(p => {
            setPatient(p);
            // Fetch continuous care timeline for the most recent visit if available
            const lastVisit = p?.visits?.[0] || p?.appointments?.[0]?.visit;
            if (lastVisit?.id) {
                getCareTimelineAction(lastVisit.id).then(setRecentAnalysis);
            }
        });
    }, []);

    const displayName = patient?.nickname || patient?.name;

    const topDoctors = [
        {
            id: "dr-sharma-123",
            name: "Dr. Arvind Sharma",
            speciality: "Senior Cardiologist",
            hospital: "Apollo Spectra",
            distance: "2.4 km",
            fees: 800,
            matches: 98,
            stars: 4.9,
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
        },
        {
            id: "dr-gupta-456",
            name: "Dr. Meera Gupta",
            speciality: "Pediatrician",
            hospital: "Fortis Escorts",
            distance: "3.1 km",
            fees: 600,
            matches: 95,
            stars: 4.8,
            image: "https://images.unsplash.com/photo-1594824436998-38290fbb6948?q=80&w=2070&auto=format&fit=crop",
        }
    ];

    const infoServices = [
        { title: "OPD Consultation", description: "Get assistance in choosing the correct specialist, comparing hospitals, and scheduling OPD consultations with accuracy and care", icon: <Stethoscope className="w-8 h-8 text-blue-600" />, gradient: "bg-blue-50" },
        { title: "In-Patient Services", description: "Complete hospital support for patients who require admission and continuous medical care with smooth hospital stays", icon: <Building2 className="w-8 h-8 text-teal-600" />, gradient: "bg-teal-50" },
        { title: "Diagnostic Services", description: "Access accurate lab tests and imaging services through trusted diagnostic centers for clarity and timely results", icon: <Microscope className="w-8 h-8 text-purple-600" />, gradient: "bg-purple-50" },
        { title: "Digital Health Records", description: "Securely store and access your past and present medical records, including investigations and imaging reports", icon: <ClipboardList className="w-8 h-8 text-amber-600" />, gradient: "bg-amber-50" }
    ];

    const infoValues = [
        { title: "Assistance", description: "End-to-end guidance to help patients choose the right doctors, hospitals, and services", icon: <HelpingHand className="w-10 h-10 text-blue-600" />, color: "border-blue-200" },
        { title: "Accuracy", description: "Focused on correct information, right referrals and reliable healthcare decisions", icon: <Target className="w-10 h-10 text-teal-600" />, color: "border-teal-200" },
        { title: "Accessibility", description: "Easy access to healthcare services, records, and support anytime, anywhere", icon: <Globe className="w-10 h-10 text-purple-600" />, color: "border-purple-200" },
        { title: "Accountability", description: "Dedicated patient support with transparent processes and dependable coordination", icon: <CheckCircle className="w-10 h-10 text-orange-600" />, color: "border-orange-200" }
    ];

    const infoSpecialities = [
        { name: 'Gynecology', icon: <Syringe className="w-8 h-8 text-pink-500 mb-2" /> },
        { name: 'General Physician', icon: <Stethoscope className="w-8 h-8 text-blue-500 mb-2" /> },
        { name: 'Dermatology', icon: <Sparkles className="w-8 h-8 text-indigo-500 mb-2" /> },
        { name: 'Pediatrics', icon: <Baby className="w-8 h-8 text-green-500 mb-2" /> },
        { name: 'ENT', icon: <Ear className="w-8 h-8 text-amber-500 mb-2" /> },
        { name: 'Cardiology', icon: <HeartPulse className="w-8 h-8 text-red-500 mb-2" /> },
        { name: 'Orthopedics', icon: <Bone className="w-8 h-8 text-slate-500 mb-2" /> },
        { name: 'Neurology', icon: <Brain className="w-8 h-8 text-purple-500 mb-2" /> }
    ];

    return (
        <div className="flex flex-col gap-8 pt-6 pb-24 animate-fade-in container mx-auto px-4 max-w-6xl">
            {/* ── HERO SECTION ── */}
            <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden rounded-[2.5rem] bg-slate-50 border border-slate-200 shadow-sm mt-2">
                {/* Clean, subtle background pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
                    <Badge variant="secondary" className="mb-8 px-4 py-1.5 text-blue-700 bg-blue-100/50 hover:bg-blue-100/80 rounded-full text-sm font-medium border border-blue-200 backdrop-blur-md cursor-default transition-colors">
                        <Sparkles className="w-4 h-4 mr-2" />
                        India&apos;s Premier Healthcare Platform
                    </Badge>

                    {displayName && (
                        <div className="text-teal-600 font-bold mb-4 animate-fade-in text-lg tracking-wide uppercase">
                            Welcome back, {displayName} 👋
                        </div>
                    )}

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                        Find the Right <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Doctor.</span><br />
                        At the Right <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Hospital.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
                        Haspataal is transforming patient care. Search real-time availability, compare verified reviews, and book confirmed appointments across top-rated medical facilities instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto justify-center">
                        <Button asChild size="lg" className="h-14 px-8 text-base font-semibold rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 duration-300">
                            <Link href="/search">
                                <Search className="w-5 h-5 mr-3" /> Find Doctors & Hospitals
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base font-semibold rounded-2xl border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm transition-all hover:-translate-y-1 duration-300">
                            <Link href="/medchat">
                                <BotMessageSquare className="w-5 h-5 mr-3 text-blue-600" /> Consult MedChat AI
                            </Link>
                        </Button>
                    </div>

                    {/* Features row underneath buttons */}
                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 w-full max-w-3xl border-t border-slate-200 pt-10">
                        <div className="flex flex-col items-center justify-center p-2 group cursor-default">
                            <Stethoscope className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors mb-3" />
                            <span className="text-sm font-semibold text-slate-700 leading-tight text-center">Verified<br/>Specialists</span>
                        </div>
                         <div className="flex flex-col items-center justify-center p-2 group cursor-default">
                            <Building2 className="w-6 h-6 text-slate-400 group-hover:text-teal-500 transition-colors mb-3" />
                            <span className="text-sm font-semibold text-slate-700 leading-tight text-center">Top<br/>Hospitals</span>
                        </div>
                         <div className="flex flex-col items-center justify-center p-2 group cursor-default">
                            <CalendarCheck className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors mb-3" />
                            <span className="text-sm font-semibold text-slate-700 leading-tight text-center">Instant<br/>Booking</span>
                        </div>
                         <div className="flex flex-col items-center justify-center p-2 group cursor-default">
                            <CheckCircle className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors mb-3" />
                            <span className="text-sm font-semibold text-slate-700 leading-tight text-center">Zero<br/>Waiting</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── QUICK ACTION GRID ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/search" className="group no-underline">
                    <Card className="h-full border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <Stethoscope className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 text-center">OPD</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/hospitals" className="group no-underline">
                    <Card className="h-full border-teal-100 hover:border-teal-300 hover:shadow-md transition-all duration-200">
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 text-center">In Patient Services</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/lab-tests" className="group no-underline">
                    <Card className="h-full border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200">
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <Microscope className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 text-center">Diagnostic</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/records" className="group no-underline">
                    <Card className="h-full border-amber-100 hover:border-amber-300 hover:shadow-md transition-all duration-200">
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <ClipboardList className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 text-center">Health Records</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* ── CONTINUOUS CARE LIFECYCLE ── */}
            {recentAnalysis && (
                <section className="animate-slide-up">
                    <ContinuousCareHub data={recentAnalysis} />
                </section>
            )}

            {/* ── STATS BAR ── */}
            <Card className="overflow-hidden border-slate-200 shadow-sm mt-12 rounded-[2rem]">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {[
                        { num: "12+", label: "Hospitals", color: "text-blue-600" },
                        { num: "21+", label: "Doctors", color: "text-teal-600" },
                        { num: "8", label: "Cities", color: "text-purple-600" },
                        { num: "24/7", label: "Support", color: "text-orange-600" },
                    ].map((stat) => (
                        <div key={stat.label} className="p-8 text-center">
                            <div className={`text-4xl font-extrabold ${stat.color} mb-2 tracking-tight`}>{stat.num}</div>
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ── TOP DOCTORS ── */}
            <section className="py-12 mt-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm px-6 sm:px-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                    <div>
                        <Badge variant="outline" className="mb-3 text-blue-600 border-blue-200 uppercase tracking-widest px-3 py-1 text-xs bg-blue-50/50">
                            Featured
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                            Top Doctors Near You
                        </h2>
                        <p className="text-slate-500 mt-2 text-lg">Highly-rated specialists available for instant booking.</p>
                    </div>
                    <Button asChild variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold h-11 px-6 rounded-xl hidden sm:inline-flex">
                        <Link href="/search">See All Specialists &rarr;</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {topDoctors.map(doc => (
                        <DoctorCard key={doc.id} doctor={doc} className="" />
                    ))}
                </div>
                <Button asChild variant="outline" className="w-full mt-6 text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold h-12 rounded-xl sm:hidden">
                    <Link href="/search">See All Specialists &rarr;</Link>
                </Button>
            </section>

            {/* ── SERVICES SECTION ── */}
            <section className="py-12 mt-12">
                <div className="text-center mb-10">
                    <Badge variant="secondary" className="mb-3 text-blue-600 border-blue-200 uppercase tracking-widest px-3 py-1 text-xs bg-blue-50/50">
                        What We Offer
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Our Services
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                        Patient-centric healthcare assistance at every step of your medical journey, guided by expertise and empathy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {infoServices.map((service) => (
                        <Card key={service.title} className="group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-slate-200 cursor-pointer h-full">
                            <CardContent className="p-8 flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-2xl ${service.gradient} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                                    {service.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {service.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ── POPULAR SPECIALITIES ── */}
            <section className="py-12 mt-12 bg-slate-50/50 rounded-[2rem] px-6 sm:px-10 border border-slate-100">
                <div className="text-center mb-10">
                    <Badge variant="outline" className="mb-3 text-teal-600 border-teal-200 uppercase tracking-widest px-3 py-1 text-xs bg-teal-50/50">
                        Browse By
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        Popular Specialities
                    </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {infoSpecialities.map(spec => (
                        <Link href={`/search?speciality=${spec.name}`} key={spec.name} className="no-underline">
                            <Card className="hover:border-teal-300 hover:shadow-md transition-all duration-200 h-full">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                    {spec.icon}
                                    <div className="font-semibold text-slate-700 text-sm">
                                        {spec.name}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── WHY CHOOSE US ── */}
            <section className="py-12 mt-12">
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-3 text-purple-600 border-purple-200 uppercase tracking-widest px-3 py-1 text-xs bg-purple-50/50">
                        The 4 A&apos;s
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        Why Choose Haspataal
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {infoValues.map(value => (
                        <div key={value.title} className="text-center flex flex-col items-center">
                            <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border-4 ${value.color}`}>
                                {value.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                {value.title}
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA SECTION ── */}
            <Card className="border-0 bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white shadow-xl overflow-hidden relative mt-12 rounded-[2.5rem]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/2" />
                
                <CardContent className="relative z-10 p-12 text-center flex flex-col items-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
                        Your Guide to Better Healthcare
                    </h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-2xl leading-relaxed">
                        From choosing the right doctor & hospital to managing medical records, Haspataal supports patients at every step.
                    </p>
                    <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-bold px-8 shadow-lg">
                        <Link href="/search">
                            <Sparkles className="w-5 h-5 mr-2" /> Get Assistance Now
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
