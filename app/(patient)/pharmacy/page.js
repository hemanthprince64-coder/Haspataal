'use client';

import { Search, ShoppingCart, Camera, Plus, Minus, ArrowRight, ShieldCheck, Zap, Sparkles, ChevronLeft, Info, Filter, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";

export default function PharmacyPage() {
    const [cartCount, setCartCount] = useState(0);

    const medicines = [
        {
            id: "med-1",
            name: "Paracetamol 500mg",
            brand: "Dolo 650",
            price: 32,
            discount: "15% off",
            category: "Pain Relief",
            image: "💊"
        },
        {
            id: "med-2",
            name: "Azithromycin 500mg",
            brand: "Azithral",
            price: 120,
            discount: "10% off",
            category: "Antibiotics",
            image: "💊"
        },
        {
            id: "med-3",
            name: "Cough Syrup",
            brand: "Benadryl",
            price: 115,
            discount: "5% off",
            category: "Cough & Cold",
            image: "🍾"
        },
        {
            id: "med-4",
            name: "Vitamin C 500mg",
            brand: "Limcee",
            price: 45,
            discount: "20% off",
            category: "Supplements",
            image: "🍊"
        }
    ];

    const categories = ["All", "Pain Relief", "Fever", "Antibiotics", "Cough & Cold", "Supplements"];

    return (
        <main className="container max-w-5xl mx-auto px-6 py-10 animate-fade-in text-slate-900">
            <div className="flex items-center justify-between mb-8">
                <Button asChild variant="ghost" className="text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                    <Link href="/profile" className="flex items-center gap-2">
                        <ChevronLeft className="w-5 h-5" /> Portal
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200">
                            <ShoppingCart className="w-6 h-6 text-slate-600" />
                        </Button>
                        <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white font-black h-6 w-6 flex items-center justify-center p-0 rounded-full border-2 border-white">
                            {cartCount}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Zap className="w-3.5 h-3.5 mr-2" /> E-Pharmacy
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-2">MedStore</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Superfast 2-hour delivery to your doorstep.</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div className="text-sm font-black text-slate-700">Delivery in <span className="text-blue-600">45 Mins</span></div>
                    <div className="w-[1px] h-6 bg-slate-200 mx-2" />
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div className="text-xs font-bold text-slate-500">Mumbai - 400001</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-12">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input 
                        placeholder="Search for medicines, vitamins, or generic names..." 
                        className="h-16 pl-14 pr-6 rounded-2xl border-slate-200 bg-white focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold text-lg shadow-xl shadow-slate-200/20 transition-all placeholder:text-slate-300" 
                    />
                </div>
                <Button size="lg" className="h-16 px-8 bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 transition-all active:scale-95">
                    <Camera className="w-6 h-6 mr-3" /> Upload Rx
                </Button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-none mb-4">
                {categories.map((cat, i) => (
                    <Badge key={cat} variant={i === 0 ? "default" : "outline"} className={`h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all ${i === 0 ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50'}`}>
                        {cat}
                    </Badge>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {medicines.map(med => (
                    <Card key={med.id} className="group rounded-[2rem] border-slate-200/60 shadow-xl shadow-slate-200/5 bg-white overflow-hidden hover:border-blue-300 hover:shadow-2xl transition-all duration-500">
                        <CardHeader className="p-0 relative h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                            <div className="absolute top-4 left-4 z-10">
                                <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-lg">
                                    {med.discount}
                                </Badge>
                            </div>
                            <div className="text-7xl group-hover:scale-125 transition-transform duration-500 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100">
                                {med.image}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-100/80 to-transparent h-12" />
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="mb-4">
                                <h4 className="font-black text-lg tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors uppercase">{med.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{med.brand}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{med.category}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-2xl font-black text-slate-900 tracking-tight">₹{med.price}</div>
                                    <div className="text-[10px] font-bold text-slate-400 line-through">MRP ₹{Math.round(med.price * 1.15)}</div>
                                </div>
                                <Button size="icon" onClick={() => setCartCount(c => c+1)} className="h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-all">
                                    <Plus className="w-6 h-6" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 border-none p-1 flex items-center overflow-hidden shadow-2xl shadow-blue-500/20 group">
                <CardContent className="w-full bg-white/95 backdrop-blur-sm rounded-[2.35rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                    <div className="absolute right-[-40px] top-[-40px] opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-64 h-64 text-blue-900" />
                    </div>
                    
                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center flex-shrink-0 border border-blue-100 group-hover:rotate-12 transition-transform duration-500">
                        <ShieldCheck className="w-12 h-12 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <Badge variant="outline" className="mb-4 border-blue-200 text-blue-600 font-black px-4 py-1 text-[10px] uppercase tracking-widest">
                            Prescription Orders
                        </Badge>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Upload Prescription</h3>
                        <p className="text-slate-500 text-lg font-medium tracking-tight mb-0">
                            Don&apos;t have time to search? Simply upload your prescription and our experts will handle everything.
                        </p>
                    </div>
                    
                    <Button size="lg" className="h-16 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 flex-shrink-0 transition-all active:scale-95">
                        Start Upload <ArrowRight className="ml-3 w-6 h-6" />
                    </Button>
                </CardContent>
            </Card>
            
            <div className="mt-16 text-center">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <Info className="w-4 h-4" /> All medicines are verified & source-checked
                </p>
            </div>
        </main>
    );
}
