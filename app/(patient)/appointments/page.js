'use client';

import { useEffect, useState } from "react";
import { getMyAppointmentsAction, cancelAppointmentAction } from "@/app/actions";
import Link from "next/link";
import { format } from "date-fns";

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

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-bold">Loading appointments...</div>;

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
                {displayList.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                        <div className="text-5xl mb-4 opacity-50">🏥</div>
                        <h3 className="text-xl font-black text-[#0D2B55] mb-2">No {tab} appointments found</h3>
                        <p className="text-slate-500 font-medium">When you book a consultation, it will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayList.map(visit => {
                            const dateObj = new Date(visit.date);
                            const isUpcoming = dateObj >= now;
                            let statusColor = "bg-slate-100 text-slate-700";
                            if (visit.status === 'CONFIRMED' || visit.status === 'COMPLETED') statusColor = "bg-emerald-100 text-emerald-700";
                            else if (visit.status === 'CANCELLED' || visit.status === 'NO_SHOW') statusColor = "bg-red-100 text-red-700";
                            else if (visit.status === 'AWAITING_PAYMENT') statusColor = "bg-amber-100 text-amber-700";

                            return (
                                <div key={visit.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-4 gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 bg-blue-50 inline-block px-2 py-0.5 rounded-full">{visit.specialization}</div>
                                            <div className="font-black text-xl text-[#0D2B55] leading-tight truncate">Dr. {visit.doctorName}</div>
                                            <div className="text-xs font-bold text-slate-500 mt-0.5">Patient: {visit.patientName}</div>
                                            
                                            <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                Booked: {visit.createdAt ? format(new Date(visit.createdAt), "dd MMM yyyy, hh:mm a") : 'N/A'}
                                            </div>
                                            
                                            <div className="mt-1">
                                                {visit.amountPaid > 0 ? (
                                                    <span className="text-xs font-black text-emerald-600">✓ Paid ₹{visit.amountPaid}</span>
                                                ) : (
                                                    <span className="text-xs font-black text-amber-500">Pending ₹500</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase ${statusColor}`}>
                                            {visit.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50 p-4 rounded-[1.25rem] border border-slate-100">
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Date</div>
                                            <div className="font-bold text-[#0D2B55]">{format(dateObj, "MMM d, yyyy")}</div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-[1.25rem] border border-slate-100">
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Time</div>
                                            <div className="font-bold text-[#0D2B55]">
                                                {visit.slot ? (() => {
                                                    if (!visit.slot.includes(':')) return visit.slot;
                                                    const [hourStr, minStr] = visit.slot.split(':');
                                                    const hour = parseInt(hourStr);
                                                    if (isNaN(hour)) return visit.slot;
                                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                                    const hour12 = hour % 12 || 12;
                                                    return `${hour12}:${minStr} ${ampm}`;
                                                })() : 'TBD'}
                                            </div>
                                        </div>
                                    </div>

                                    {tab === 'upcoming' && (
                                        <div className="flex gap-3">
                                            <button onClick={() => handleCancel(visit.id)} className="flex-1 text-red-600 bg-red-50 hover:bg-red-100 py-3 rounded-xl font-bold transition text-sm">Cancel</button>
                                            <Link href="/search" className="flex-1 text-slate-700 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl font-bold transition text-sm text-center">Reschedule</Link>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
