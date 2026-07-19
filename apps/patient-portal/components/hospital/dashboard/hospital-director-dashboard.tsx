'use client';

import {
  Activity,
  IndianRupee,
  Users,
  Stethoscope,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShieldAlert,
  BedDouble,
  PackageX,
  CheckSquare,
} from 'lucide-react';

import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HospitalDirectorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Hospital Director Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Unified operational, clinical, financial, and quality oversight.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CLINICAL QUADRANT */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Stethoscope className="w-5 h-5" />
              Clinical Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">OPD Census (Today)</p>
                <p className="text-2xl font-bold">
                  412 <span className="text-sm font-normal text-emerald-600">+12%</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">IPD Census</p>
                <p className="text-2xl font-bold">
                  87 <span className="text-sm font-normal text-slate-400">Stable</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Avg OPD Wait Time</p>
                <p className="text-2xl font-bold text-amber-600">24m</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Lab Turnaround (TAT)</p>
                <p className="text-2xl font-bold text-emerald-600">45m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FINANCIAL QUADRANT */}
        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <IndianRupee className="w-5 h-5" />
              Financial Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Daily Revenue</p>
                <p className="text-2xl font-bold">₹8.4L</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Pending TPA Claims</p>
                <p className="text-2xl font-bold text-amber-600">₹12.1L</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Cash Collection Rate</p>
                <p className="text-2xl font-bold text-emerald-600">98.5%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Outstanding Balances</p>
                <p className="text-2xl font-bold text-red-600">₹2.3L</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OPERATIONAL QUADRANT */}
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Activity className="w-5 h-5" />
              Operational Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BedDouble className="w-4 h-4" /> Bed Occupancy
                </div>
                <span className="font-bold">87% (13 Beds Free)</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <PackageX className="w-4 h-4" /> Pharmacy Stock-Outs
                </div>
                <Badge variant="destructive">4 Items</Badge>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" /> System MTTR (7d)
                </div>
                <span className="font-bold text-emerald-600">4.2m</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <AlertTriangle className="w-4 h-4" /> Active Facility Alerts
                </div>
                <span className="font-bold text-amber-600">1 (HVAC ICU-A)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QUALITY QUADRANT */}
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
              Quality & Safety Governance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckSquare className="w-4 h-4" /> Critical Lab Acknowledgements
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                  100% (12/12)
                </Badge>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" /> Unresolved Emergency Encounters
                </div>
                <span className="font-bold text-red-600">2 Pending Demographic Sync</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ShieldAlert className="w-4 h-4" /> CDS Medication Overrides
                </div>
                <span className="font-bold">14 (Trailing 24h)</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <AlertTriangle className="w-4 h-4" /> Near-Miss Incident Reports
                </div>
                <span className="font-bold text-amber-600">1 Logged (Awaiting Review)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
