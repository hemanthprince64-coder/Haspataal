import { services } from "@/lib/services";
import Link from "next/link";
import { ChevronLeft, Stethoscope, Building2, MapPin, Star, CreditCard, ShieldCheck, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BookingForm from "./BookingForm";

export default async function BookingPage({ searchParams }) {
    const params = await searchParams;
    const doctorId = params.doctorId;
    const hospitalId = params.hospitalId;

    const [doctor, hospital] = await Promise.all([
        doctorId ? services.platform.getDoctorById(doctorId) : Promise.resolve(null),
        hospitalId ? services.platform.getHospitalById(hospitalId) : Promise.resolve(null)
    ]);

    if (!doctor || !hospital) {
        return (
            <div className="container max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">No Specialist Selected</h2>
                    <p className="text-slate-500 mb-8">Please choose a doctor from the directory to proceed with booking.</p>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-bold">
                        <Link href="/search">
                            <ChevronLeft className="w-5 h-5 mr-2" /> Find Doctors
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const doctorSpeciality = doctor.affiliations?.find(a => a.hospitalId === hospitalId)?.department || 'General Specialist';
    const consultationFee = doctor.fee || hospital.consultationFee || 500;

    return (
        <div className="container max-w-2xl mx-auto px-4 py-8 animate-fade-in">
            <Button asChild variant="ghost" className="mb-4 text-slate-500 hover:text-blue-600 -ml-2 font-bold h-9">
                <Link href="/search" className="flex items-center gap-2">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                </Link>
            </Button>

            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-blue-700 bg-blue-100 hover:bg-blue-100 px-2 py-0.5 font-bold text-[9px] uppercase tracking-[0.15em] border-blue-200">
                        <ShieldCheck className="w-3 h-3 mr-1.5" /> Secure Booking
                    </Badge>
                    <div className="h-px flex-1 bg-slate-100" />
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Step 2</div>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1 leading-tight uppercase">Confirm Details</h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Select a convenient time slot below.</p>
            </div>

            {/* Doctor Info Card */}
            <Card className="mb-8 overflow-hidden rounded-2xl border-slate-200 shadow-sm bg-white group hover:border-blue-300 transition-all">
                <CardContent className="p-0">
                    <div className="p-5">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500">
                                    <AvatarImage src={doctor.profilePicture} alt={doctor.fullName} className="object-cover" />
                                    <AvatarFallback className="bg-blue-50 text-blue-600 text-xl font-black">
                                        {doctor.fullName ? doctor.fullName.split(' ').map((n) => n[0]).join('') : 'D'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <Badge className="bg-blue-600 hover:bg-blue-600 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md">
                                        {doctorSpeciality}
                                    </Badge>
                                    <div className="flex items-center text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                        <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" /> 4.5
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 truncate mb-1 uppercase tracking-tight">
                                    Dr. {doctor.fullName || doctor.name || 'Specialist'}
                                </h3>
                                <div className="space-y-1 text-slate-500 text-[11px] font-medium">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="font-black text-slate-700 truncate tracking-tight uppercase text-[10px]">
                                            {hospital.legalName || hospital.displayName || 'Hospital'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="truncate text-[10px] font-bold">{hospital.city} • {hospital.addressLine1 || hospital.area}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-6 py-3 bg-slate-50/50 border-t border-slate-100 group-hover:bg-blue-50/20 transition-colors">
                        <div className="flex items-center gap-6">
                            <div>
                                <div className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] mb-0.5">Consultation Fee</div>
                                <div className="text-lg font-black text-slate-900 tracking-tight leading-none">₹{consultationFee}</div>
                            </div>
                            <div className="h-6 w-px bg-slate-200" />
                            <div>
                                <div className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] mb-0.5">Insurance</div>
                                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Accepted</div>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-black text-[8px] uppercase tracking-[0.15em] px-2 py-0.5 gap-1.5 h-6">
                            <Info className="w-2.5 h-2.5 text-blue-500" /> View Policy
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Booking Form */}
            <BookingForm doctorId={doctorId} hospitalId={hospitalId} />
        </div>
    );
}
