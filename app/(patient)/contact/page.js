'use client';

import { 
    Mail, Phone, MapPin, Send, MessageCircle, Clock, 
    ChevronLeft, Globe, Zap, Heart, ShieldCheck, Sparkles, 
    ArrowRight, Headphones, HelpCircle, Activity, Hospital
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
    const [status, setStatus] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('success');
    };

    return (
        <main className="container max-w-6xl mx-auto px-6 py-12 animate-fade-in text-slate-900">
            <div className="flex items-center justify-between mb-8">
                <Button asChild variant="ghost" className="text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                    <Link href="/" className="flex items-center gap-2">
                        <ChevronLeft className="w-5 h-5" /> Home
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <Headphones className="w-3.5 h-3.5 mr-2" /> Support Hub
                        </Badge>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900 leading-none">Get in touch.</h1>
                    <p className="text-slate-500 text-xl font-medium tracking-tight max-w-xl">We’re here to assist you with everything from clinical triage to appointment coordination.</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <Card className="rounded-2xl border-slate-100 bg-slate-50 p-4 flex items-center gap-4 group hover:bg-white hover:border-blue-200 transition-all cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Helpline</div>
                            <div className="text-sm font-black text-slate-800">1800-HAS-PATAL</div>
                        </div>
                    </Card>
                    <Card className="rounded-2xl border-slate-100 bg-slate-50 p-4 flex items-center gap-4 group hover:bg-white hover:border-emerald-200 transition-all cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</div>
                            <div className="text-sm font-black text-slate-800">+91 90000 00001</div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Contact Form */}
                <Card className="lg:col-span-3 rounded-[3rem] border-slate-200 shadow-2xl shadow-slate-200/40 bg-white overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Drop us a message</CardTitle>
                        <CardDescription className="text-slate-500 text-lg font-medium tracking-tight mt-2">Expect a clinical response within 15 minutes during business hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-8">
                        {status === 'success' ? (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-12 text-center animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                                    <Send className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-black text-emerald-900 mb-2">Message Sent!</h3>
                                <p className="text-emerald-700 text-lg font-medium opacity-80">Our care team has received your inquiry and will reach out shortly.</p>
                                <Button variant="ghost" className="mt-8 font-black text-sm uppercase tracking-widest text-emerald-600 hover:bg-emerald-100" onClick={() => setStatus(null)}>
                                    Send another message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
                                        <Input 
                                            placeholder="e.g. Rahul Sharma" 
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold text-lg transition-all shadow-inner" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
                                        <Input 
                                            type="email" 
                                            placeholder="rahul@example.com" 
                                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold text-lg transition-all shadow-inner" 
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</Label>
                                    <Input 
                                        placeholder="How can we help you today?" 
                                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold transition-all shadow-inner" 
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Detail</Label>
                                    <Textarea 
                                        placeholder="Tell us more about your clinical or technical requirement..." 
                                        className="min-h-[160px] rounded-[2rem] border-slate-100 bg-slate-50/50 focus-visible:ring-blue-500/20 focus-visible:ring-4 font-bold text-lg transition-all p-8 shadow-inner" 
                                        required
                                    />
                                </div>
                                <Button 
                                    className="w-full h-18 rounded-[2rem] bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 text-white font-black text-xl shadow-2xl shadow-slate-900/20 transition-all active:scale-95 group"
                                >
                                    Send Message <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Info Cards */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] bg-slate-900 text-white border-none p-10 shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Hospital className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <Badge className="bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg border-none">Global HQ</Badge>
                                <h3 className="text-3xl font-black tracking-tight">Mumbai Hub</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-blue-400 shrink-0" />
                                    <p className="font-bold text-slate-300 leading-relaxed">
                                        Haspataal Healthcare Labs,<br />
                                        BKC Towers, Block G,<br />
                                        Bandra East, Mumbai 400051
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Mail className="w-6 h-6 text-blue-400 shrink-0" />
                                    <p className="font-bold text-slate-300">care@haspataal.com</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Clock className="w-6 h-6 text-blue-400 shrink-0" />
                                    <p className="font-bold text-slate-300">Open 24/7 (Emergency Service)</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full h-14 border-white/20 text-white hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest">
                                Get Directions <MapPin className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-slate-200 bg-white p-10 group hover:border-blue-300 transition-all">
                        <div className="space-y-6 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto border border-blue-100 group-hover:rotate-12 transition-transform">
                                <HelpCircle className="w-10 h-10 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Knowledge Base</h3>
                                <p className="text-slate-500 font-medium">Browse our most frequently asked clinical and technical questions.</p>
                            </div>
                            <Button variant="ghost" className="font-black text-blue-600 uppercase tracking-widest text-[10px] hover:bg-blue-50">
                                Open FAQ <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] bg-rose-50 border-rose-100 p-8 flex items-center gap-6 relative overflow-hidden group">
                        <div className="absolute top-[-10px] right-[-10px] opacity-10 scale-150 rotate-12">
                            <Activity className="w-24 h-24 text-rose-500" />
                        </div>
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-rose-200 shrink-0 shadow-lg shadow-rose-900/5 group-hover:animate-pulse">
                            <Zap className="w-7 h-7 text-rose-600" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-rose-900 tracking-tight leading-none mb-1">Emergency SOS</h4>
                            <p className="text-xs font-bold text-rose-700 opacity-70 mb-0">Direct 24x7 bypass to crisis management</p>
                            <Link href="/emergency" className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-2 inline-block hover:underline">Launch Protocol →</Link>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="mt-20 text-center space-y-8">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Secured Global Assistance Network
                </p>
                <div className="flex items-center justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
                    <Hospital className="w-10 h-10" />
                    <Activity className="w-10 h-10" />
                    <ShieldCheck className="w-10 h-10" />
                    <Sparkles className="w-10 h-10" />
                </div>
            </div>
        </main>
    );
}
