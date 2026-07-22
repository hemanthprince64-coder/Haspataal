/* eslint-disable */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertTriangle, IndianRupee } from 'lucide-react';
import { checkSchemeEligibility, getTotalSchemeBenefit } from '@/lib/anc/scheme-tracker';

interface SchemeTrackerProps {
  profile: any;
}

export default function SchemeTracker({ profile }: SchemeTrackerProps) {
  const eligibility = checkSchemeEligibility({
    gravida: profile?.gravida || 1,
    para: profile?.para || 0,
    bplCard: profile?.bplCard || false,
    aadhaarLinked: profile?.aadhaarLinked || false,
    bankAccountLinked: profile?.bankAccountLinked || false,
    registeredAt: profile?.registeredAt ? new Date(profile.registeredAt) : undefined,
    schemeEnrolled: profile?.schemeEnrolled || [],
    ancVisits: profile?.ancVisits || 0,
    institutionaldelivery: profile?.institutionalDelivery || false,
  });

  const totalBenefit = getTotalSchemeBenefit(eligibility);

  return (
    <Card className="rounded-[2rem] border-emerald-200/60 shadow-xl overflow-hidden">
      <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 p-6">
        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-emerald-600" /> Government Schemes
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          JSY + PMMVY benefits — track your entitlements
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Total Benefit Summary */}
        <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border border-emerald-200">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Benefits Received</p>
          <p className="text-3xl font-black text-emerald-800">₹{totalBenefit.toLocaleString()}</p>
        </div>

        {/* JSY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Janani Suraksha Yojana (JSY)</p>
              <p className="text-xs text-slate-500">Cash incentive for institutional delivery</p>
            </div>
            <Badge className={eligibility.jsy.eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
              {eligibility.jsy.eligible ? 'Eligible' : 'Not Eligible'}
            </Badge>
          </div>
          {eligibility.jsy.reason && (
            <p className="text-xs text-amber-600 font-medium">{eligibility.jsy.reason}</p>
          )}
          <div className="space-y-2">
            {eligibility.jsy.installments.map((inst, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                {inst.status === 'PAID' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{inst.name}</p>
                </div>
                <p className="text-sm font-bold text-slate-600">₹{inst.amount}</p>
                <Badge variant={inst.status === 'PAID' ? 'default' : 'secondary'} className="text-xs">
                  {inst.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* PMMVY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Pradhan Mantri Matru Vandana Yojana (PMMVY)</p>
              <p className="text-xs text-slate-500">Maternity benefit of ₹5,000 in 3 installments</p>
            </div>
            <Badge className={eligibility.pmmvy.eligible ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}>
              {eligibility.pmmvy.eligible ? 'Eligible' : 'Not Eligible'}
            </Badge>
          </div>
          {eligibility.pmmvy.reason && (
            <p className="text-xs text-amber-600 font-medium">{eligibility.pmmvy.reason}</p>
          )}
          <div className="space-y-2">
            {eligibility.pmmvy.installments.map((inst, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                {inst.status === 'PAID' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{inst.name}</p>
                </div>
                <p className="text-sm font-bold text-slate-600">₹{inst.amount}</p>
                <Badge variant={inst.status === 'PAID' ? 'default' : 'secondary'} className="text-xs">
                  {inst.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Documents Alert */}
        {(eligibility.jsy.reason || eligibility.pmmvy.reason) && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-bold text-amber-800">Action Required</p>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Visit nearest Common Service Centre (CSC) or bank to link Aadhaar and open/bank account.
              ASHA worker can assist with documentation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
