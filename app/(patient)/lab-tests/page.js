"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, FlaskConical, Microscope, Activity, Tag, Star, ArrowRight, ShieldCheck, Info, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LabTestsPage() {
    const [activeTab, setActiveTab] = useState("packages");

    const packages = [
        {
            id: "pkg-1",
            name: "Comprehensive Full Body Checkup",
            includes: "82 parameters (CBC, Lipid, Thyroid, LFT, KFT)",
            price: 1499,
            originalPrice: 2999,
            discount: "50% OFF",
            tag: "Best Seller",
            color: "from-blue-600 to-indigo-600"
        },
        {
            id: "pkg-2",
            name: "Advanced Heart Care Package",
            includes: "ECG, Lipid Profile, Blood Sugar, HbA1c",
            price: 899,
            originalPrice: 1500,
            discount: "40% OFF",
            color: "from-rose-600 to-red-600"
        }
    ];

    return (
        <main className="container max-w-5xl mx-auto px-6 py-10 animate-fade-in" suppressHydrationWarning>
            <Button asChild variant="ghost" className="mb-8 text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                <Link href="/" className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back to Home
                </Link>
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Microscope className="w-3.5 h-3.5 mr-2" /> Diagnostics
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Lab Tests</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Book trusted NABL certified diagnostic services at home or clinic.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-emerald-50 px-6 py-4 rounded-[2rem] border border-emerald-100 shadow-sm shadow-emerald-900/5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest leading-none mb-1">Safety protocol</div>
                        <div className="text-xs font-black text-emerald-900">100% Sterile Collection</div>
                    </div>
                </div>
            </div>

            <div className="relative mb-12">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="w-6 h-6 text-slate-400" />
                </div>
                <Input 
                    placeholder="Search for tests, packages or symptoms..." 
                    className="h-20 pl-16 rounded-[2.5rem] border-slate-200 bg-white shadow-2xl shadow-slate-200/50 text-xl font-bold focus-visible:ring-blue-500/20 focus-visible:ring-4 focus-visible:border-blue-300 transition-all"
                    suppressHydrationWarning
                />
                <Button className="absolute right-3 top-3 bottom-3 rounded-[1.8rem] bg-slate-900 hover:bg-slate-800 text-white px-8 font-black uppercase tracking-widest text-xs" suppressHydrationWarning>
                    Search Tests
                </Button>
            </div>

            <Tabs defaultValue="packages" className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-none">
                    <TabsList className="bg-slate-100/50 p-2 rounded-[2rem] border border-slate-200 h-auto" suppressHydrationWarning>
                        <TabsTrigger value="packages" className="px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all" suppressHydrationWarning>
                             Health Packages
                        </TabsTrigger>
                        <TabsTrigger value="blood" className="px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all" suppressHydrationWarning>
                             Blood Tests
                        </TabsTrigger>
                        <TabsTrigger value="imaging" className="px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all" suppressHydrationWarning>
                             Imaging (X-Ray/MRI)
                        </TabsTrigger>
                    </TabsList>
                    
                    <Button variant="outline" className="rounded-[1.5rem] border-slate-200 font-black text-[10px] uppercase tracking-widest px-6 ml-4 hidden md:flex" suppressHydrationWarning>
                        <Filter className="w-3.5 h-3.5 mr-2" /> More Filters
                    </Button>
                </div>

                <TabsContent value="packages" className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Popular Health Packages
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {packages.map(pkg => (
                            <Card key={pkg.id} className="group rounded-[3rem] border-none shadow-[0_32px_64px_-16px_rgba(37,99,235,0.08)] bg-white overflow-hidden hover:scale-[1.01] transition-all duration-500 relative">
                                {pkg.tag && (
                                    <div className="absolute top-0 right-10 z-10">
                                        <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-black text-[9px] uppercase tracking-[0.2em] px-4 py-3 rounded-b-2xl border-none shadow-xl">
                                            {pkg.tag}
                                        </Badge>
                                    </div>
                                )}
                                
                                <CardHeader className="p-10 pb-6">
                                    <CardTitle className="text-3xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                        {pkg.name}
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 font-medium text-lg flex items-center gap-2 mt-4">
                                        <FlaskConical className="w-5 h-5 text-blue-500" /> Includes {pkg.includes}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="px-10 py-6">
                                    <div className="flex flex-wrap gap-2">
                                        {["Sugar", "Lipid", "Liver", "Kidney", "Blood"].map(m => (
                                            <Badge key={m} variant="secondary" className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-lg">
                                                {m}
                                            </Badge>
                                        ))}
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-black px-3 py-1 rounded-lg border border-blue-100">
                                            +77 more
                                        </Badge>
                                    </div>
                                </CardContent>
                                
                                <CardFooter className="p-10 pt-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">₹{pkg.price}</span>
                                            <span className="text-lg text-slate-300 line-through tabular-nums font-bold">₹{pkg.originalPrice}</span>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-wider px-3 py-1 border-none">
                                            {pkg.discount} EXCLUSIVE
                                        </Badge>
                                    </div>
                                    <Button className="h-16 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-base shadow-2xl shadow-slate-900/20 active:scale-95 transition-all group/btn" suppressHydrationWarning>
                                        Book Now <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="blood" className="py-24 text-center animate-in slide-in-from-bottom-5 duration-500">
                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Activity className="w-12 h-12 text-blue-600 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Individual blood tests coming soon</h3>
                    <p className="text-slate-500 text-lg font-medium">Use Health Packages for comprehensive results at better value.</p>
                </TabsContent>
            </Tabs>
        </main>
    );
}
