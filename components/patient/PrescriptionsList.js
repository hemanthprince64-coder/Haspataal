import { format } from "date-fns";
import { FileText, Pill, FileDown, Eye, User, Calendar, ExternalLink, ShieldCheck, FileSearch, NotebookTabs, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PrescriptionsList({ prescriptions }) {
    if (!prescriptions || prescriptions.length === 0) {
        return (
            <div className="py-24 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/60 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/20">
                    <FileSearch className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No digital scripts found</h3>
                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    Your prescriptions from hospital visits and manual uploads will appear here securely.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {prescriptions.map((pres) => {
                const isFileUpload = pres.type === 'FILE';
                
                return (
                    <Card key={pres.id} className="group hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 rounded-[2.5rem] bg-white border-slate-200/60 overflow-hidden relative">
                        <div className={`absolute top-0 left-0 w-2 h-full ${isFileUpload ? 'bg-amber-400' : 'bg-blue-500'}`} />
                        
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-sm ${isFileUpload ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                        {isFileUpload ? <FileText className="w-7 h-7" /> : <Pill className="w-7 h-7" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                            {isFileUpload ? 'Patient Uploaded Copy' : 'Certified E-Prescription'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0 border-none ${isFileUpload ? 'bg-amber-100/50 text-amber-700' : 'bg-blue-100/50 text-blue-700'}`}>
                                                {pres.type}
                                            </Badge>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" />
                                                {pres.createdAt ? format(new Date(pres.createdAt), "dd MMM yyyy") : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </div>
                            </div>

                            {pres.doctor && (
                                <div className="flex items-center gap-3 mb-6 bg-slate-50 hover:bg-white p-3 rounded-2xl border border-slate-100 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Prescribed By</div>
                                        <div className="text-sm font-black text-slate-700">{pres.doctor.fullName}</div>
                                    </div>
                                </div>
                            )}

                            {pres.notes && (
                                <div className="mb-6 relative">
                                    <div className="absolute top-2 left-[-8px] bottom-2 w-1 bg-amber-200 rounded-full" />
                                    <p className="text-sm text-slate-600 italic font-medium leading-relaxed pl-4 bg-amber-50/30 p-4 rounded-xl border border-amber-100/50">
                                        "{pres.notes}"
                                    </p>
                                </div>
                            )}

                            {pres.type === 'STRUCTURED' && pres.items && pres.items.length > 0 && (
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                                        <NotebookTabs className="w-3.5 h-3.5" /> Medication List
                                    </div>
                                    {pres.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-50/50 border border-slate-100 rounded-2xl group/med hover:bg-white hover:border-blue-100 transition-all">
                                            <div>
                                                <div className="font-black text-slate-800 tracking-tight group-hover/med:text-blue-600 transition-colors">{item.medicineName}</div>
                                                <div className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">{item.instructions || 'Follow Standard Protocol'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-slate-900">{item.dosage}</div>
                                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-none text-[8px] font-black uppercase tracking-widest px-1.5 py-0 mt-1">
                                                    {item.duration}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isFileUpload && pres.fileUrl ? (
                                <Button asChild className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-[1.25rem] font-black text-base shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1 active:scale-95">
                                    <a href={pres.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                                        <Eye className="w-5 h-5" /> View Scanned Document <ArrowUpRight className="w-5 h-5" />
                                    </a>
                                </Button>
                            ) : (
                                <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] font-black text-base shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95">
                                    <Download className="w-5 h-5 mr-3" /> Download E-Prescription
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
