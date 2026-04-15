"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, Phone, ShieldAlert, Navigation2, Siren, AlertCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EmergencyPage() {
    const [calling, setCalling] = useState(false);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval;
        if (calling) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            setTimeout(() => setSeconds(0), 0);
        }
        return () => clearInterval(interval);
    }, [calling]);

    return (
        <main className="min-h-screen bg-rose-600 flex flex-col relative overflow-hidden animate-fade-in">
            {/* Animated Background Pulse */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500 rounded-full animate-ping opacity-20 duration-[3000ms]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-rose-400 rounded-full animate-ping opacity-10 duration-[5000ms]" />
            </div>

            <div className="relative z-10 flex flex-col h-full flex-grow">
                <header className="container max-w-2xl mx-auto px-6 pt-10 pb-6 flex items-center justify-between">
                    <Button asChild variant="ghost" className="text-white hover:bg-white/10 -ml-4 font-black">
                        <Link href="/" className="flex items-center gap-2 text-lg">
                            <ChevronLeft className="w-6 h-6" /> Back
                        </Link>
                    </Button>
                    <Badge className="bg-white/20 text-white font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full backdrop-blur-md border-white/20">
                        SOS Active
                    </Badge>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 text-white/80 font-black uppercase tracking-[0.3em] mb-4 text-xs">
                            <Siren className="w-4 h-4 animate-bounce" /> Emergency Assistance
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-tight">
                            Help is on the way.
                        </h1>
                    </div>

                    <div className="relative group mb-16">
                        {/* Multiple Pulse Rings */}
                        <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-20 duration-[2000ms]" />
                        <div className="absolute inset-x-[-20px] inset-y-[-20px] rounded-full bg-white opacity-5 group-hover:opacity-10 transition-opacity" />
                        
                        <button
                            onClick={() => setCalling(!calling)}
                            className={`
                                relative z-10 w-64 h-64 rounded-full bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.3)]
                                flex flex-col items-center justify-center transition-all duration-500 active:scale-90 overflow-hidden
                                ${calling ? 'ring-8 ring-rose-300' : 'hover:scale-105'}
                            `}
                        >
                            <div className={`p-6 rounded-full bg-rose-50 mb-4 transition-transform duration-500 ${calling ? 'scale-110' : ''}`}>
                                <ShieldAlert className={`w-16 h-16 text-rose-600 ${calling ? 'animate-pulse' : ''}`} />
                            </div>
                            <div className="text-rose-600 font-black text-2xl tracking-tighter uppercase">
                                {calling ? 'SOS BROADCASTING' : 'TAP TO BROADCAST'}
                            </div>
                            {calling && (
                                <div className="mt-2 text-rose-400 font-mono text-sm font-bold">
                                    00:{seconds < 10 ? `0${seconds}` : seconds}
                                </div>
                            )}
                        </button>
                    </div>

                    <p className="text-white/80 text-center text-lg font-bold max-w-sm mb-12 leading-relaxed h-12">
                        {calling 
                            ? "Identifying your precise location... Ambulance dispatched from closest network."
                            : "Press and hold for 2 seconds to alert nearest emergency services immediately."}
                    </p>

                    <div className="w-full max-w-sm space-y-4">
                        <div className="flex items-center justify-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                            <Navigation2 className="w-3 h-3" /> Quick Access Contacts
                        </div>
                        
                        <Card className="rounded-[2rem] border-none bg-white/10 backdrop-blur-xl group hover:bg-white/20 transition-all cursor-pointer">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <AlertCircle className="w-6 h-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <div className="font-black text-white tracking-wide">National Medical</div>
                                        <div className="text-white/50 text-xs font-bold uppercase">Public Service • 108</div>
                                    </div>
                                </div>
                                <a href="tel:108" className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-rose-600 font-black shadow-lg hover:scale-110 active:scale-95 transition-all">
                                    <Phone className="w-5 h-5" />
                                </a>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2rem] border-none bg-white/10 backdrop-blur-xl group hover:bg-white/20 transition-all cursor-pointer">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <Heart className="w-6 h-6 text-rose-600 flex-shrink-0" />
                                    </div>
                                    <div>
                                        <div className="font-black text-white tracking-wide">Apollo Cardiac Unit</div>
                                        <div className="text-white/50 text-xs font-bold uppercase">Private • 2.4 KM Away</div>
                                    </div>
                                </div>
                                <a href="tel:1066" className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-rose-600 font-black shadow-lg hover:scale-110 active:scale-95 transition-all">
                                    <Phone className="w-5 h-5" />
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
