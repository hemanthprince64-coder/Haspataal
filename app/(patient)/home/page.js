"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const DoctorCard = dynamic(() => import("../components/DoctorCard"), {
    loading: () => <div className="h-32 w-full bg-slate-100 animate-pulse rounded-2xl"></div>
});

export default function PatientHome() {
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

    return (
        <div className="flex flex-col gap-6 pt-6 animate-fade-in">
            {/* ── HERO SECTION ── */}
            <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 sm:p-10 lg:p-12 text-white">
                {/* Subtle radial gradient accent */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(11,99,191,0.3)_0%,_transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(13,148,136,0.15)_0%,_transparent_50%)]" />

                <div className="relative z-10 max-w-xl">
                    {/* Trust Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium mb-5 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Trusted by 50+ Top Hospitals
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 tracking-tight leading-[1.15] text-white">
                        Your Health,<br />
                        <span className="text-medical-400">Intelligently Connected.</span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-md leading-relaxed">
                        India&apos;s first AI-driven triage and integrated hospital booking platform. Instant guidance, seamless appointments, zero waiting.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/medchat" className="btn-saas-primary py-3 px-6 text-sm rounded-xl">
                            🤖 Try MedChat AI
                        </Link>
                        <Link href="/search" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/15 transition-all duration-200">
                            📅 Book Appointment
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── QUICK ACTION GRID ── */}
            <section className="grid grid-cols-3 gap-3">
                <Link href="/search" className="saas-card flex flex-col items-center justify-center gap-2.5 p-4 group no-underline">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform duration-200">👨‍⚕️</div>
                    <span className="text-xs font-semibold text-slate-700">Doctors</span>
                </Link>
                <Link href="/hospitals" className="saas-card flex flex-col items-center justify-center gap-2.5 p-4 group no-underline">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform duration-200">🏥</div>
                    <span className="text-xs font-semibold text-slate-700">Hospitals</span>
                </Link>
                <Link href="/lab-tests" className="saas-card flex flex-col items-center justify-center gap-2.5 p-4 group no-underline">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform duration-200">🔬</div>
                    <span className="text-xs font-semibold text-slate-700">Lab Tests</span>
                </Link>
            </section>

            {/* ── TOP DOCTORS ── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 m-0">Top Doctors Near You</h3>
                    <Link href="/search" className="text-xs font-semibold text-medical-600 hover:text-medical-700 no-underline transition-colors duration-200">See All →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {topDoctors.map(doc => (
                        <DoctorCard key={doc.id} doctor={doc} />
                    ))}
                </div>
            </section>

            {/* ── EMERGENCY BANNER (Clinical, Muted) ── */}
            <section className="pb-4">
                <div className="flex items-center justify-between bg-red-50 border border-red-200 p-4 rounded-2xl">
                    <div>
                        <h4 className="text-red-700 font-semibold text-sm mb-0.5">Emergency SOS</h4>
                        <p className="text-red-500 text-xs m-0">Need an ambulance instantly?</p>
                    </div>
                    <Link href="/emergency" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-soft hover:shadow-hover transition-all duration-200 no-underline focus-ring">
                        Call Now
                    </Link>
                </div>
            </section>
        </div>
    );
}
