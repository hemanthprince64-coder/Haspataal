'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, ShieldCheck, MessageSquare, Radio, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsDeprecationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900 p-12 text-white relative">
          <div className="relative z-10">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-4">Unified Communications</h1>
            <p className="text-slate-400 font-medium leading-relaxed">
              To streamline provider management, <strong>Notifications</strong> have been merged
              into the <strong>Infrastructure & Integrations</strong> module.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Radio className="h-32 w-32" />
          </div>
        </div>

        <div className="p-12 space-y-8">
          <div className="space-y-6">
            <div className="flex gap-5">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Messaging Hub</p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Manage WhatsApp, SMS, and Email nodes alongside their templates in one place.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Secure Orchestration</p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Webhook logs and provider credentials are now consolidated for security.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => router.push('/hospital/dashboard/setup/integrations')}
            className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100"
          >
            Go to Communications Hub <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            System Architecture v5.0 • Core Node
          </p>
        </div>
      </div>
    </div>
  );
}
