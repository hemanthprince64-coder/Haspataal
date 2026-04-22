import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, UserCog, BarChart3, LogIn, UserPlus, ChevronRight } from "lucide-react";

export default function HospitalLanding() {
    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-16 px-4 bg-slate-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-3xl opacity-60" />

            <div className="max-w-4xl w-full text-center z-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="space-y-6">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-[28px] flex items-center justify-center shadow-md ring-8 ring-white/50 mb-8">
                        <Image src="/logo.svg" alt="Haspataal" width={56} height={56} className="object-contain" />
                    </div>
                    <h1 className="text-senior-h1 tracking-tight text-slate-900 drop-shadow-sm">Hospital Partner Portal</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Empower your medical facility with Haspataal. Digitize your OPD, manage staff efficiently, and grow your clinical presence.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Button asChild size="lg" className="btn-medical min-w-[200px] h-14 text-base shadow-lg shadow-blue-200/50 group">
                        <Link href="/hospital/login" className="flex items-center gap-2">
                            <LogIn className="w-5 h-5" /> Login to Dashboard
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="min-w-[200px] h-14 text-base border-slate-200 hover:bg-slate-100 hover:text-blue-600 transition-all group bg-white/80">
                        <Link href="/hospital/register" className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5" /> Register Hospital
                        </Link>
                    </Button>
                </div>

                <div className="pt-16">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { 
                                icon: <ClipboardList className="w-7 h-7 text-blue-600" />, 
                                title: "OPD Management", 
                                desc: "Standardize walk-in workflows and appointment-based clinical visits." 
                            },
                            { 
                                icon: <UserCog className="w-7 h-7 text-indigo-600" />, 
                                title: "Staff Directory", 
                                desc: "Centrally manage doctors schedules, specializations, and availability." 
                            },
                            { 
                                icon: <BarChart3 className="w-7 h-7 text-emerald-600" />, 
                                title: "Health Analytics", 
                                desc: "Access real-time metrics on patient trends and facility performance." 
                            },
                        ].map((f, i) => (
                            <Card key={f.title} className={`card-clinical border-none shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-${(i + 1) * 100}`}>
                                <CardContent className="p-8 text-center space-y-4">
                                    <div className="mx-auto w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">{f.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-20 text-slate-400 text-sm font-medium animate-in fade-in duration-1000 delay-500">
                Trusted by 500+ Healthcare Providers in India
            </div>
        </div>
    );
}

