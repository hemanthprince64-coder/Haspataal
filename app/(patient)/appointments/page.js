'use client';

import { useEffect, useState } from "react";
import { getMyAppointmentsAction, cancelAppointmentAction } from "@/app/actions";
import Link from "next/link";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Plus, ChevronLeft, History, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import AppointmentsList from "@/components/patient/AppointmentsList";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('upcoming'); // 'upcoming', 'past'

    const loadData = async () => {
        setLoading(true);
        const res = await getMyAppointmentsAction();
        if (res.success) {
            setAppointments(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        let active = true;
        getMyAppointmentsAction().then(res => {
            if (active) {
                if (res.success) {
                    setAppointments(res.data);
                }
                setLoading(false);
            }
        });
        return () => { active = false; };
    }, []);

    const handleCancel = async (visitId) => {
        if (!window.confirm("Are you sure you want to cancel? (Cannot cancel within 6 hours of appointment)")) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('visitId', visitId);
        
        const res = await cancelAppointmentAction(null, formData);
        if (!res.success) {
            alert(res.message);
        } else {
            alert(res.message);
        }
        await loadData();
    };

    const now = new Date();
    
    const upcoming = appointments.filter(a => new Date(a.date) >= now && a.status !== 'CANCELLED');
    const past = appointments.filter(a => new Date(a.date) < now || a.status === 'CANCELLED');

    const displayList = tab === 'upcoming' ? upcoming : past;
    
    return (
        <div className="container max-w-5xl mx-auto px-4 py-8 animate-fade-in">
            <Button asChild variant="ghost" className="mb-6 text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                <Link href="/profile" className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back to Profile
                </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm">
                            <CalendarDays className="w-3.5 h-3.5 mr-2" /> Appointments
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">My Visits</h1>
                    <p className="text-slate-500 text-lg font-medium tracking-tight">Manage your consultations and check health history.</p>
                </div>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 h-16 px-8 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                    <Link href="/search">
                        <Plus className="w-6 h-6 mr-3" /> Book New Visit
                    </Link>
                </Button>
            </div>

            <div className="bg-slate-100/50 p-1.5 rounded-[1.75rem] flex gap-2 mb-10 max-w-md border border-slate-200/50 backdrop-blur-sm">
                <button 
                  onClick={() => setTab('upcoming')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${tab === 'upcoming' ? 'bg-white text-blue-600 shadow-xl shadow-blue-900/5 ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                >
                    <Clock className={`w-4 h-4 ${tab === 'upcoming' ? 'animate-pulse' : ''}`} /> Upcoming ({upcoming.length})
                </button>
                <button 
                  onClick={() => setTab('past')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${tab === 'past' ? 'bg-white text-blue-600 shadow-xl shadow-blue-900/5 ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                >
                    <History className="w-4 h-4" /> Past ({past.length})
                </button>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-64 rounded-[2rem] bg-slate-100" />
                        ))}
                    </div>
                ) : (
                    <AppointmentsList appointments={displayList} tab={tab} now={now} />
                )}
            </div>
        </div>
    );
}
