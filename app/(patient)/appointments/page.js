'use client';

import { useEffect, useState } from "react";
import { getMyAppointmentsAction, cancelAppointmentAction } from "@/app/actions";
import Link from "next/link";
import { Skeleton } from 'boneyard-js/react';
import { format } from "date-fns";

import AppointmentsList from "@/components/patient/AppointmentsList";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('upcoming'); // 'upcoming', 'past'

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await getMyAppointmentsAction();
        if (res.success) {
            setAppointments(res.data);
        }
        setLoading(false);
    }

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
        <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">
            <Link href="/profile" className="text-blue-600 font-bold mb-4 inline-block hover:underline">← Back to Profile</Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[#0D2B55] tracking-tight">My Appointments</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your consultations and check past visits.</p>
                </div>
                <Link href="/search" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black shadow-sm hover:shadow-md hover:bg-blue-700 transition lg:shrink-0 text-center">
                    + Book New Visit
                </Link>
            </div>

            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-2 mb-6 max-w-md">
                <button 
                  onClick={() => setTab('upcoming')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition ${tab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Upcoming ({upcoming.length})
                </button>
                <button 
                  onClick={() => setTab('past')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition ${tab === 'past' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Past ({past.length})
                </button>
            </div>

            <div className="space-y-4">
                <Skeleton name="appointments-list" loading={loading}>
                    <AppointmentsList appointments={displayList} tab={tab} now={now} />
                </Skeleton>
            </div>
        </div>
    );
}
