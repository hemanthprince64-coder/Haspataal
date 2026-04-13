"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Building2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DoctorCard({ doctor, className }) {
    const { id, name, speciality, hospital, distance, fees, matches, stars, image, gender } = doctor;

    // Fallback images based on gender
    const fallbackImage = gender === "female" 
        ? "https://images.unsplash.com/photo-1594824436998-38290fbb6948?q=80&w=250&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=250&auto=format&fit=crop";

    return (
        <div className={cn(
            "group bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300",
            className
        )}>
            {/* Top Row: Info & Avatar */}
            <div className="flex gap-3 mb-2.5">
                {/* Avatar with Match Badge */}
                <div className="relative flex-shrink-0">
                    <Avatar className="w-14 h-14 rounded-xl border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-500">
                        <AvatarImage src={image || fallbackImage} alt={name} className="object-cover" />
                        <AvatarFallback className="bg-blue-50 text-blue-600">
                            <User className="w-6 h-6 opacity-20" />
                        </AvatarFallback>
                    </Avatar>
                    {matches && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-white whitespace-nowrap shadow-sm">
                            {matches}%
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <h3 className="text-[13px] font-black text-slate-900 truncate leading-tight tracking-tight uppercase">
                            {name}
                        </h3>
                        <div className="flex items-center gap-0.5 bg-amber-50 px-1 py-0.5 rounded border border-amber-100">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span className="text-[9px] font-black text-amber-700">{stars || "4.5"}</span>
                        </div>
                    </div>
                    
                    <div className="text-[9px] font-black text-blue-600 uppercase tracking-[0.15em] mb-1.5 truncate">
                        {speciality}
                    </div>

                    <div className="space-y-0.5 mb-1.5">
                        <div className="flex items-center gap-1 text-slate-500">
                            <Building2 className="w-2.5 h-2.5 text-slate-400" />
                            <span className="text-[9px] font-black truncate tracking-wide text-slate-600 uppercase">{hospital}</span>
                        </div>
                        {distance && (
                            <div className="flex items-center gap-1 text-slate-500">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                <span className="text-[9px] font-bold text-slate-400">{distance}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-[11px] font-black text-slate-900 tabular-nums">
                        Fee: ₹{fees || "500"}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Actions */}
            <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2.5 border-t border-slate-50">
                <Button asChild variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200">
                    <Link href={`/doctor/${id}`}>Profile</Link>
                </Button>
                <Button asChild className="h-8 text-[9px] font-black uppercase tracking-widest rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-95">
                    <Link href={`/book?doctorId=${id}${doctor.hospitalId ? `&hospitalId=${doctor.hospitalId}` : ''}`}>
                        Book now
                    </Link>
                </Button>
            </div>
        </div>
    );
}
