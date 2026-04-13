import Link from "next/link";
import { format } from "date-fns";
import ProfileActions from "@/app/(patient)/profile/ProfileActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User, ChevronRight, AlertCircle, CheckCircle2, XCircle, MoreVertical, CreditCard, Building2, Stethoscope, Briefcase } from "lucide-react";

export default function AppointmentsList({ appointments, tab, now }) {
    if (!appointments || appointments.length === 0) {
        return (
            <div className="py-24 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/60 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/20">
                    <Calendar className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No {tab} appointments</h3>
                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    When you schedule a medical consultation, it will appear here in your dashboard.
                </p>
                <Button asChild variant="outline" className="mt-10 border-slate-200 hover:bg-white rounded-2xl h-14 px-8 font-black text-slate-600 transition-all hover:scale-105 active:scale-95">
                    <Link href="/search">Find a Specialist</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {appointments.map(visit => {
                const dateObj = new Date(visit.date);
                let StatusIcon = Clock;
                let statusColor = "bg-slate-100 text-slate-700 border-slate-200";
                
                if (visit.status === 'CONFIRMED' || visit.status === 'COMPLETED') {
                    statusColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                    StatusIcon = CheckCircle2;
                } else if (visit.status === 'CANCELLED' || visit.status === 'NO_SHOW') {
                    statusColor = "bg-red-50 text-red-700 border-red-100";
                    StatusIcon = XCircle;
                } else if (visit.status === 'AWAITING_PAYMENT') {
                    statusColor = "bg-amber-50 text-amber-700 border-amber-100";
                    StatusIcon = AlertCircle;
                }

                return (
                    <Card key={visit.id} className="group hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 rounded-[2rem] bg-white border-slate-200/60 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-6 sm:p-8">
                                <div className="flex justify-between items-start gap-4 mb-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge className="bg-blue-600 hover:bg-blue-600 text-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md shadow-lg shadow-blue-200/50">
                                                {visit.specialization}
                                            </Badge>
                                            <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                                ID: {visit.id.slice(-8).toUpperCase()}
                                            </div>
                                        </div>
                                        <h4 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight truncate group-hover:text-blue-600 transition-colors tracking-tight">
                                            Dr. {visit.doctorName}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-bold mt-1.5 uppercase tracking-wide">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="w-3 h-3 text-slate-500" />
                                            </div>
                                            {visit.patientName}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-colors ${statusColor}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {visit.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50 group-hover:bg-blue-50/50 transition-colors">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500" /> Date
                                        </div>
                                        <div className="font-extrabold text-slate-900 tracking-tight">{format(dateObj, "MMM d, yyyy")}</div>
                                    </div>
                                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50 group-hover:bg-blue-50/50 transition-colors">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5">
                                            <Clock className="w-3.5 h-3.5 text-emerald-500" /> Time
                                        </div>
                                        <div className="font-extrabold text-slate-900 tracking-tight">
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

                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                            <CreditCard className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Payment</div>
                                            <div className="text-sm font-black text-slate-900">
                                                {visit.amountPaid > 0 ? `Paid ₹${visit.amountPaid}` : 'Pending ₹500'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Booked On</div>
                                        <div className="text-[10px] font-bold text-slate-600 italic">
                                            {visit.createdAt ? format(new Date(visit.createdAt), "dd MMM, hh:mma") : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {tab === 'upcoming' && (
                                <div className="flex gap-1.5 p-3 bg-slate-50 border-t border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                                    <div className="flex-1">
                                        <ProfileActions visitId={visit.id} />
                                    </div>
                                    <Button asChild variant="outline" className="flex-1 h-12 bg-white border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm">
                                        <Link href="/search">Reschedule</Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300 hover:text-slate-600">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
