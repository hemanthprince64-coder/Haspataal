"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Star, Award, Users, MessageSquare, ShieldCheck, MapPin, Building2, Calendar, Phone, Share2, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DoctorProfile() {
    const params = useParams();

    // Static data matching prototype but enriched for premium UI
    const doctor = {
        name: "Dr. Arvind Sharma",
        speciality: "Senior Cardiologist",
        hospital: "Apollo Spectra Hospital",
        experience: "15+ Years",
        patients: "8k+",
        rating: "4.9",
        reviewsCount: "124",
        about: "Dr. Arvind Sharma is a leading cardiologist with over 15 years of experience in interventional cardiology. He specializes in advanced heart failure management, coronary artery disease, and preventive cardiology. He has performed over 2,000 successful procedures.",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
        availability: "Available Today",
        fee: "₹800"
    };

    return (
        <main className="min-h-screen bg-slate-50/50 pb-24 animate-fade-in">
            {/* Premium Header/Cover */}
            <div className="relative h-32 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                <div className="container max-w-4xl mx-auto px-6 pt-6 relative z-10">
                    <Button asChild variant="ghost" className="text-white hover:bg-white/10 -ml-2 font-bold h-8 text-xs">
                        <Link href="/search" className="flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="container max-w-4xl mx-auto px-6 -mt-16 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Basic Info */}
                    <div className="flex-1">
                        <Card className="rounded-xl border-slate-200 shadow-sm bg-white overflow-hidden mb-5">
                            <CardContent className="p-5">
                                <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
                                    <div className="relative">
                                        <Avatar className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-white shadow-md">
                                            <AvatarImage src={doctor.image} alt={doctor.name} className="object-cover" />
                                            <AvatarFallback className="bg-blue-50 text-blue-600 text-xl font-black">AS</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-1.5">
                                            <Badge className="bg-blue-600 hover:bg-blue-600 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md">
                                                {doctor.speciality}
                                            </Badge>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                ID: {params.id ? params.id.toString().slice(-6).toUpperCase() : 'DOC-001'}
                                            </div>
                                        </div>
                                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-1 uppercase">
                                            {doctor.name}
                                        </h1>
                                        <div className="flex flex-col gap-1.5 text-slate-500 font-medium text-[11px]">
                                            <div className="flex items-center justify-center md:justify-start gap-2">
                                                <Building2 className="w-4 h-4 text-blue-500" />
                                                <span className="font-black text-slate-700 tracking-tight uppercase text-[10px]">{doctor.hospital}</span>
                                            </div>
                                            <div className="flex items-center justify-center md:justify-start gap-2">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                <span className="font-bold">Mumbai • South Avenue Center</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mt-6">
                                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                                        <Award className="w-4 h-4 text-blue-600 mb-0.5" />
                                        <div className="text-sm font-black text-slate-900 tracking-tight">{doctor.experience}</div>
                                        <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Experience</div>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                                        <Users className="w-4 h-4 text-emerald-500 mb-0.5" />
                                        <div className="text-sm font-black text-slate-900 tracking-tight">{doctor.patients}</div>
                                        <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Patients</div>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                                        <Star className="w-4 h-4 text-amber-500 mb-0.5 fill-amber-500" />
                                        <div className="text-sm font-black text-slate-900 tracking-tight">{doctor.rating}</div>
                                        <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Reviews</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="px-2">
                            <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight uppercase">Biography</h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6">
                                {doctor.about}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified</div>
                                        <div className="text-xs font-black text-slate-900">MCI-29384-932</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Languages</div>
                                        <div className="text-xs font-black text-slate-900">English, Hindi, Marathi</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="lg:w-72">
                        <Card className="rounded-xl border-slate-200 shadow-lg bg-white overflow-hidden sticky top-8">
                            <CardContent className="p-5">
                                <div className="text-center mb-5">
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Fee</div>
                                    <div className="text-2xl font-black text-slate-900 tracking-tight">{doctor.fee}</div>
                                    <div className="mt-2 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-1 px-2 rounded-lg text-[9px] font-black uppercase tracking-wide">
                                        <Calendar className="w-2.5 h-2.5" /> Available Today
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <Button asChild className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-xs uppercase tracking-widest">
                                        <Link href={`/book?doctorId=${params.id || 'dr-sharma-123'}`}>
                                            Book Now
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full h-10 bg-white border-slate-200 text-slate-600 rounded-lg font-black text-xs uppercase tracking-widest">
                                        <Phone className="w-3.5 h-3.5 mr-2" /> Contact
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="flex-1 h-10 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-200 transition-all">
                                        <Heart className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="flex-1 h-10 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 transition-all">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
