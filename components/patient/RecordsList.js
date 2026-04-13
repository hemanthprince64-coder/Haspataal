import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Download, Eye, Calendar, User } from "lucide-react";

export default function RecordsList({ records }) {
    if (records.length === 0) {
        return (
            <div className="py-24 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200/60 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/20">
                    <FileText className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No records found</h3>
                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    There are no medical documents in this category yet. Upload a new record to get started.
                </p>
                <Button variant="outline" className="mt-8 border-slate-200 hover:bg-white rounded-xl h-11 px-6 font-bold text-slate-600">
                    Learn about records
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {records.map(rec => (
                <Card key={rec.id} className="group hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 rounded-[1.5rem] border-slate-200/60 overflow-hidden bg-white">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row md:items-center">
                            <div className="flex flex-1 items-center gap-6 p-6 sm:p-8">
                                <div className={`w-16 h-16 ${rec.bgColor || 'bg-slate-50'} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner`}>
                                    {rec.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 border-slate-200 text-slate-500 bg-slate-50">
                                            {rec.type}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 px-2 py-0.5 rounded-lg">
                                            <Calendar className="w-3.5 h-3.5" /> {rec.date}
                                        </div>
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 truncate tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
                                        {rec.title || rec.doctor}
                                    </h4>
                                    {rec.doctor && rec.title && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="w-3.5 h-3.5" />
                                            </div>
                                            {rec.doctor}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center px-8 pb-8 md:pb-0 md:h-full gap-3 border-t md:border-t-0 md:border-l border-slate-50 bg-slate-50/30 group-hover:bg-blue-50/20 transition-colors">
                                <Button variant="ghost" size="lg" className="h-14 px-6 rounded-2xl text-slate-600 hover:text-blue-600 hover:bg-white hover:shadow-sm font-black text-base gap-3 transition-all">
                                    <Eye className="w-5 h-5 transition-transform group-hover:scale-110" /> 
                                    <span>View <span className="hidden lg:inline">Report</span></span>
                                </Button>
                                <Button size="lg" className="h-14 w-14 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all active:scale-95">
                                    <Download className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-14 w-12 rounded-2xl text-slate-300 hover:text-slate-600">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
