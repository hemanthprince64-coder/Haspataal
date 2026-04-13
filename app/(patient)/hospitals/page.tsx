import { services } from "../../../lib/services";
import Link from "next/link";
import { Building2, MapPin, Search, Star, ArrowRight, Activity, Zap, Hospital, ShieldCheck, ChevronRight, Globe, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HospitalsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const city = (params.city as string) || "Mumbai";

    const hospitals = await services.platform.getHospitalsByCity(city);
    const cities = services.platform.getCities();

    // Data is now pre-fetched in the service layer to avoid connection pool exhaustion
    const hospitalsWithData = hospitals;

    return (
        <main className="container max-w-6xl mx-auto px-6 py-10 animate-fade-in text-slate-900">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Building2 className="w-3.5 h-3.5 mr-2" /> Hospital Net
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">Facility Explorer</h1>
                    <p className="text-slate-500 text-sm font-medium tracking-tight">Verified healthcare centers in <span className="text-blue-600 font-black">{city}</span></p>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none max-w-md">
                    {cities.map(c => (
                        <Link
                            key={c.id}
                            href={`/hospitals?city=${c.name}`}
                            className={`whitespace-nowrap h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all ${city === c.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'}`}
                        >
                            {c.name}
                        </Link>
                    ))}
                </div>
            </div>

            {hospitalsWithData.length === 0 ? (
                <div className="py-32 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200/60 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/20">
                        <Building2 className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No facilities found</h3>
                    <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                        We are currently expanding our network in <span className="font-black text-slate-700">{city}</span>. Please check again soon.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hospitalsWithData.map(hospital => (
                        <Card key={hospital.id} className="group rounded-2xl border-slate-200/60 shadow-lg shadow-slate-200/5 bg-white overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all duration-500 relative">
                            <CardHeader className="p-0 h-40 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-700">
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                <Hospital className="w-24 h-24 text-white/90" />
                                
                                <div className="absolute top-6 right-6 z-20">
                                    <Badge className="bg-white/95 backdrop-blur-md text-slate-900 hover:bg-white font-black text-[11px] px-3 py-1.5 rounded-xl border-none shadow-xl flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        {hospital.avgRating}
                                    </Badge>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-6">
                                <Link href={`/hospitals/${hospital.id}`} className="block mb-3">
                                    <h3 className="font-black text-xl tracking-tight leading-tight group-hover:text-blue-600 transition-colors uppercase line-clamp-1">{hospital.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="w-3 h-3 text-slate-300" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{hospital.addressLine1 || city}</span>
                                    </div>
                                </Link>
                                
                                <div className="flex items-center gap-5 py-4 border-y border-slate-50 mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-slate-800 tracking-tight">{hospital.doctorCount}</span>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Specialists</span>
                                    </div>
                                    <div className="w-[1px] h-6 bg-slate-100" />
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-emerald-500 tracking-tight">24x7</span>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Emergency</span>
                                    </div>
                                    <div className="w-[1px] h-6 bg-slate-100" />
                                    <div className="flex flex-col">
                                        <ShieldCheck className="w-5 h-5 text-blue-500 mb-0.5" />
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Verified</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <Button asChild variant="outline" className="h-12 rounded-xl border-slate-200 font-bold text-xs hover:bg-slate-50 transition-all">
                                        <Link href={`/hospitals/${hospital.id}`}>Details</Link>
                                    </Button>
                                    <Button asChild className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10 transition-all active:scale-95">
                                        <Link href={`/search?city=${hospital.city}`}>Book Now</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            <section className="mt-20">
                <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl shadow-slate-200/5 bg-slate-50/50 p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-dashed">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/20 border border-slate-100">
                            <Activity className="w-10 h-10 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight text-slate-900">Cant find a hospital?</h3>
                            <p className="text-slate-500 font-medium max-w-sm">Contact our 24/7 assistance hub for personal coordination.</p>
                        </div>
                    </div>
                    <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border-slate-200 font-black text-sm uppercase tracking-widest hover:bg-white transition-all">
                        <Phone className="w-5 h-5 mr-3" /> Call Assistance
                    </Button>
                </Card>
            </section>
        </main>
    );
}
