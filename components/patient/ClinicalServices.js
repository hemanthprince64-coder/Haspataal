import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Hospital, FileText, Pill, Activity, ClipboardList, 
    Syringe, Baby, ShieldCheck, MessageSquareMore, ChevronRight 
} from "lucide-react";

const clinicalSections = [
    { name: "Medical History", href: "/medical-history", icon: <Hospital className="w-6 h-6" />, desc: "Conditions & allergies", color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Prescriptions", href: "/prescriptions", icon: <FileText className="w-6 h-6" />, desc: "Clinical & uploaded", color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Medications", href: "/medications", icon: <Pill className="w-6 h-6" />, desc: "Current medicines", color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Vitals Tracker", href: "/vitals", icon: <Activity className="w-6 h-6" />, desc: "BP, weight, sugar", color: "text-rose-600", bg: "bg-rose-50" },
    { name: "Test Reports", href: "/records", icon: <ClipboardList className="w-6 h-6" />, desc: "Lab results & scans", color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Vaccinations", href: "/vaccinations", icon: <Syringe className="w-6 h-6" />, desc: "Vaccine records", color: "text-sky-600", bg: "bg-sky-50" },
    { name: "Pregnancy Tracker", href: "/tracker", icon: <Baby className="w-6 h-6" />, desc: "Maternal health", color: "text-pink-600", bg: "bg-pink-50" },
    { name: "Insurance", href: "/insurance", icon: <ShieldCheck className="w-6 h-6" />, desc: "Policy details", color: "text-violet-600", bg: "bg-violet-50" },
    { name: "MedChat AI", href: "/medchat", icon: <MessageSquareMore className="w-6 h-6" />, desc: "AI health assistant", color: "text-cyan-600", bg: "bg-cyan-50" },
];

export default function ClinicalServices() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {clinicalSections.map((s, i) => (
                <Link key={s.href} href={s.href} className="group no-underline">
                    <Card className="h-full border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                {s.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                    {s.name}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium truncate">{s.desc}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

