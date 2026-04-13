"use client";

import { searchDoctorsAction, getCitiesAction, getAllSpecialitiesAction } from "@/app/actions";
import Link from "next/link";
import { Search, MapPin, Building2, Star, ChevronRight, UserX, Clock, Award, Phone, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, use } from "react";
import DoctorCard from "../components/DoctorCard";

export default function SearchPage({ searchParams }: { searchParams: Promise<any> }) {
    const resolvedParams = use(searchParams);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [specialities, setSpecialities] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const city = resolvedParams.city || "Mumbai";
    const speciality = resolvedParams.speciality || "";
    const query = resolvedParams.q || "";
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const drs = await searchDoctorsAction(city, speciality, query);
                setDoctors(drs);
                const cts = await getCitiesAction();
                setCities(cts);
                const specs = await getAllSpecialitiesAction();
                setSpecialities(specs);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [city, speciality, query]);

    const doctorsWithHospitals = doctors.map((doc: any) => {
        const aff = doc.affiliations?.[0];
        const hospital = aff?.hospital || null;
        return {
            id: doc.id,
            name: doc.fullName,
            speciality: aff?.department || 'General Specialist',
            fees: doc.fee || 800,
            hospitalId: aff?.hospitalId || '',
            image: doc.profilePicture,
            gender: doc.gender || "male",
            hospital: hospital ? (hospital.legalName || hospital.displayName || 'Hospital') : 'Private Clinic',
            stars: "4.9",
            matches: 98,
            distance: "2.4 km" // Mock distance for parity with homepage
        };
    });

    return (
        <main className="container max-w-5xl mx-auto px-4 py-8 animate-fade-in">
            <div className="mb-8">
                <Badge variant="secondary" className="mb-3 text-blue-700 bg-blue-100 hover:bg-blue-100 px-3 py-1 font-bold uppercase tracking-widest text-[9px] border-blue-200">
                    <Search className="w-3 h-3 mr-2" />
                    Doctor Directory
                </Badge>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 leading-tight uppercase">
                    {speciality ? `${speciality} Specialists` : "Specialists"} <span className="text-blue-600">in {city}</span>
                </h1>
                <p className="text-slate-500 text-base font-medium max-w-2xl leading-relaxed">
                    {doctorsWithHospitals.length} verified specialists are currently available for immediate booking.
                </p>
            </div>

            <Card className="mb-8 p-1.5 border-slate-200/60 shadow-xl shadow-slate-200/10 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl sticky top-4 z-50 ring-1 ring-slate-200/50">
                <form action="/search" method="GET" className="flex flex-col sm:flex-row items-center gap-1.5">
                    <input type="hidden" name="city" value={city} suppressHydrationWarning />
                    {speciality && <input type="hidden" name="speciality" value={speciality} suppressHydrationWarning />}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
                        <Input 
                            name="q" 
                            type="text" 
                            placeholder="Find by name, symptom, or treatment..." 
                            defaultValue={query}
                            className="w-full pl-14 border-0 focus-visible:ring-0 bg-transparent text-lg h-14 font-semibold placeholder:text-slate-400" 
                            suppressHydrationWarning
                        />
                    </div>
                    <Button type="submit" size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-14 text-base font-black shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95" suppressHydrationWarning>
                        Search Now
                    </Button>
                </form>
            </Card>

            <div className="mb-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Select City</div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide px-1">
                    {cities.map(c => (
                        <Link key={c.id} href={`/search?city=${c.name}${speciality ? `&speciality=${speciality}` : ''}${query ? `&q=${query}` : ''}`}>
                            <Badge variant={city === c.name ? "default" : "outline"} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${city === c.name ? 'bg-slate-900 border-slate-900 shadow-md shadow-slate-900/10' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>
                                {c.name}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="mb-10 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Filter by Speciality</div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide px-1">
                    <Link href={`/search?city=${city}${query ? `&q=${query}` : ''}`}>
                        <Badge variant={!speciality ? "default" : "outline"} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${!speciality ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-600/10' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>
                            All Specialities
                        </Badge>
                    </Link>
                    {specialities.map(s => (
                        <Link key={s} href={`/search?city=${city}&speciality=${s}${query ? `&q=${query}` : ''}`}>
                            <Badge variant={speciality === s ? "default" : "outline"} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${speciality === s ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-600/10' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>
                                {s}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="h-48 rounded-2xl bg-slate-50 animate-pulse border-slate-100" />
                    ))}
                </div>
            ) : doctorsWithHospitals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-slate-200/5">
                        <UserX className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight uppercase">No Specialists Found</h3>
                    <p className="text-slate-500 text-sm font-medium max-w-md leading-relaxed">Try broadening your search or selecting a different city.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {doctorsWithHospitals.map(doc => (
                        <DoctorCard key={doc.id} doctor={doc} />
                    ))}
                </div>
            )}
        </main>
    );
}
