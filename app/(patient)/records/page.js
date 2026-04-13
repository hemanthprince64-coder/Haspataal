"use client";

import { useState, useEffect } from "react";
import { FolderHeart, Search, Plus, Filter, FileText, FlaskConical, ReceiptText, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecordsList from "@/components/patient/RecordsList";

export default function RecordsPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const records = [
        {
            id: "rec-1",
            type: "Prescription",
            doctor: "Dr. Arvind Sharma",
            date: "12 Oct, 2023",
            icon: <FileText className="w-5 h-5 text-blue-600" />,
            bgColor: "bg-blue-100/50"
        },
        {
            id: "rec-2",
            type: "Lab Report",
            title: "Lipid Profile & Glucose",
            date: "05 Sep, 2023",
            icon: <FlaskConical className="w-5 h-5 text-teal-600" />,
            bgColor: "bg-teal-100/50"
        },
        {
            id: "rec-3",
            type: "Invoice",
            title: "Apollo Pharmacy",
            date: "05 Sep, 2023",
            icon: <ReceiptText className="w-5 h-5 text-amber-600" />,
            bgColor: "bg-amber-100/50"
        }
    ];

    return (
        <div className="container max-w-5xl mx-auto px-4 py-8 animate-fade-in">
            <div className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                                <FolderHeart className="w-3.5 h-3.5 mr-2" /> Digital Vault
                            </Badge>
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em]">
                                Encrypted
                            </Badge>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2">Medical Records</h1>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">Your secure hub for medical history and reports.</p>
                    </div>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-16 px-8 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                        <Plus className="w-6 h-6 mr-3" /> Upload Record
                    </Button>
                </div>
            </div>

            <Card className="mb-10 p-1.5 border-slate-200/60 shadow-xl shadow-slate-200/5 rounded-[1.5rem] bg-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/0 to-blue-50/0 group-hover:to-blue-50/30 transition-all duration-500 pointer-events-none" />
                <div className="flex items-center relative z-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/50 w-6 h-6 group-focus-within:text-blue-500 transition-colors duration-300" />
                        <Input 
                            placeholder="Find records by doctor, hospital, or date..." 
                            className="w-full pl-16 border-0 focus-visible:ring-0 bg-transparent text-lg h-16 font-medium placeholder:text-slate-400" 
                        />
                    </div>
                    <div className="h-10 w-px bg-slate-100 mx-2" />
                    <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl mr-2">
                        <Filter className="w-6 h-6" />
                    </Button>
                </div>
            </Card>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-slate-100/80 p-1 rounded-xl mb-8 space-x-1">
                    <TabsTrigger value="all" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">All Files</TabsTrigger>
                    <TabsTrigger value="prescriptions" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Prescriptions</TabsTrigger>
                    <TabsTrigger value="labs" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Lab Reports</TabsTrigger>
                    <TabsTrigger value="bills" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Bills</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                    <div className={loading ? "opacity-50 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
                        <RecordsList records={records} />
                    </div>
                </TabsContent>
                
                <TabsContent value="prescriptions">
                    <RecordsList records={records.filter(r => r.type === "Prescription")} />
                </TabsContent>
                
                <TabsContent value="labs">
                    <RecordsList records={records.filter(r => r.type === "Lab Report")} />
                </TabsContent>
                
                <TabsContent value="bills">
                    <RecordsList records={records.filter(r => r.type === "Invoice")} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
