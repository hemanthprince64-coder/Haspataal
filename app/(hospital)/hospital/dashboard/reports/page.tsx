import { services } from "@/lib/services";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types";
import ReportActions from "./ReportActions";
import { FileText, Calendar, User, UserCheck, Phone, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default async function ReportsPage() {
    const user = await requireRole([UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR], "session_user");

    const rawVisits = await services.hospital.getVisits(user.hospitalId);
    const visits = rawVisits.map((v: any) => {
        const doctor = v.appointment?.doctor || null;
        const patient = v.appointment?.patient || null;
        const status = v.appointment?.status || 'COMPLETED';
        return { 
            ...v, 
            status,
            displayPatientName: patient?.name || v.patientName || 'Unknown',
            displayPatientMobile: patient?.phone || v.patientPhone || '—',
            displayDoctorName: doctor?.fullName || 'Walk-in / No Doctor',
            displayDoctorSpeciality: v.appointment?.doctor?.affiliations?.[0]?.department || 'General'
        };
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-6 w-6 text-slate-400" />
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Visit Reports</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Audit clinical encounters and care journeys</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="px-3 py-1 text-xs bg-white shadow-sm font-bold border-slate-200">
                    {visits.length} TOTAL RECORDS
                  </Badge>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search by patient name, mobile, or doctor..." className="pl-10 h-11 bg-slate-50/50 border-slate-200" />
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  <Calendar className="h-3.5 w-3.5" /> THIS MONTH
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  <Filter className="h-3.5 w-3.5" /> FILTERS
                </button>
              </div>
            </div>

            {visits.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-10 w-10 text-slate-200" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <p className="text-lg font-bold text-slate-900">No visits recorded</p>
                      <p className="text-sm text-slate-400">Clinical records will appear here once patient visits are completed through the billing portal.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Encounter ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attending Physician</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {visits.map(v => (
                                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <code className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded font-mono group-hover:bg-slate-200 transition-colors">
                                            {v.id.substring(0, 8)}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                          <div className="text-sm font-bold text-slate-700">
                                              {new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                          </div>
                                        </div>
                                        <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-tighter">
                                            {new Date(v.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 font-bold text-xs">
                                            {v.displayPatientName[0]}
                                          </div>
                                          <div>
                                            <div className="text-sm font-bold text-slate-900 leading-none mb-1">{v.displayPatientName}</div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                                <Phone className="h-2.5 w-2.5" /> {v.displayPatientMobile}
                                            </div>
                                          </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                          <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                          <div>
                                            <div className="text-sm font-bold text-slate-700">{v.displayDoctorName}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{v.displayDoctorSpeciality}</div>
                                          </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[9px] font-black tracking-widest inline-block border
                                          ${v.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                            v.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' : 
                                            'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ReportActions visitId={v.id} status={v.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
