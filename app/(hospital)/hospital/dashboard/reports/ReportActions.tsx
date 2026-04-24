'use client';

import { useActionState, useState } from 'react';
import { cancelVisitHospital, completeVisitHospital } from '@/app/actions';
import { Check, X, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const initialState = { message: '', success: false };

interface ReportActionsProps {
    visitId: string;
    status: string;
}

export default function ReportActions({ visitId, status }: ReportActionsProps) {
    const [cancelState, cancelAction, isCancelling] = useActionState(cancelVisitHospital, initialState);
    const [completeState, completeAction, isCompleting] = useActionState(completeVisitHospital, initialState);
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');

    if (cancelState?.success) return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">CANCELLED</span>;
    if (completeState?.success) return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold flex items-center gap-1"><Sparkles className="h-2 w-2" /> COMPLETED</span>;

    if (status !== 'SCHEDULED') {
        return <span className="text-slate-300 text-xs">—</span>;
    }

    if (showNotes) {
        return (
            <div className="flex flex-col gap-2 min-w-[240px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Clinical notes (Vitals, Diagnosis, Advice)..."
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all min-h-[80px]"
                />
                
                <form action={completeAction} encType="multipart/form-data" className="space-y-2">
                    <input type="hidden" name="visitId" value={visitId} />
                    <input type="hidden" name="notes" value={notes} />
                    
                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                          Prescription / Lab Referral
                        </label>
                        <input 
                            type="file" 
                            name="prescriptionImage"
                            accept="image/*,.pdf"
                            className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                    </div>

                    <div className="flex gap-1">
                      <Button 
                        type="submit" 
                        disabled={isCompleting || !notes} 
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-8"
                      >
                          {isCompleting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          AI CARE JOURNEY
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowNotes(false)}
                        className="px-2 h-8"
                      >
                        <X className="h-3.5 w-3.5 text-slate-400" />
                      </Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowNotes(true)}
              className="h-8 text-[10px] font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
                <Check className="h-3 w-3 mr-1" /> COMPLETE
            </Button>
            
            <form action={cancelAction}>
                <input type="hidden" name="visitId" value={visitId} />
                <Button 
                  type="submit" 
                  disabled={isCancelling} 
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                    {isCancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                </Button>
            </form>
        </div>
    );
}
