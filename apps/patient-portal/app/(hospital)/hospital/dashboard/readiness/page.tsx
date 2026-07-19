'use client';

import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Rocket,
  Shield,
  Activity,
  Users,
  Database,
  Server,
  RefreshCw,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const readinessItems = [
  {
    id: 'arch',
    name: 'Architecture',
    status: 'passed',
    icon: Server,
    desc: 'Core infrastructure, identity, and outbox patterns',
  },
  {
    id: 'security',
    name: 'Security Review',
    status: 'pending',
    icon: Shield,
    desc: 'IDOR checks, PHI leakage, tenant boundaries',
  },
  {
    id: 'simulation',
    name: 'Hospital Simulation',
    status: 'passed',
    icon: Activity,
    desc: '300 OPD, 30 IPD, Lab/Pharmacy load test',
  },
  {
    id: 'backup',
    name: 'Backup & Restore',
    status: 'pending',
    icon: Database,
    desc: 'Full database restore drill',
  },
  {
    id: 'acceptance',
    name: 'User Acceptance',
    status: 'pending',
    icon: Users,
    desc: 'Unguided staff testing & validation',
  },
  {
    id: 'perf',
    name: 'Performance Targets',
    status: 'measuring',
    icon: Clock,
    desc: 'Registration <30s, Consult <3m, Bill <20s',
  },
  {
    id: 'regression',
    name: 'Regression Tests',
    status: 'passed',
    icon: RefreshCw,
    desc: 'Automated test suite & type checks',
  },
  {
    id: 'production',
    name: 'Production Deployment',
    status: 'not-started',
    icon: Rocket,
    desc: 'SSL, Monitoring, Reverse proxy, Health checks',
  },
];

const severityLevels = [
  {
    level: 'P0 - Stop Launch',
    desc: 'Data corruption, wrong patient, PHI leak, billing corruption',
    color: 'bg-red-500',
  },
  {
    level: 'P1 - Fix Before Go-Live',
    desc: 'Crash, workflow blocker, printing failure',
    color: 'bg-orange-500',
  },
  {
    level: 'P2 - Fix During Pilot',
    desc: 'UI confusion, slow screen, minor usability issue',
    color: 'bg-yellow-500',
  },
  { level: 'P3 - Backlog', desc: 'Cosmetic issue, enhancement request', color: 'bg-slate-500' },
];

const issueOrigins = [
  {
    type: 'Clinical',
    desc: 'Patient care or documentation',
    icon: Activity,
    color: 'text-rose-600',
  },
  {
    type: 'Financial',
    desc: 'Billing, refunds, payments',
    icon: Database,
    color: 'text-emerald-600',
  },
  { type: 'Security', desc: 'Authorization, PHI, audit', icon: Shield, color: 'text-purple-600' },
  { type: 'Workflow', desc: 'UI/navigation/usability', icon: Users, color: 'text-blue-600' },
  { type: 'Performance', desc: 'Slow queries, rendering', icon: Clock, color: 'text-orange-600' },
  {
    type: 'Infrastructure',
    desc: 'Deployment, backups, printers',
    icon: Server,
    color: 'text-slate-600',
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'passed':
      return {
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        label: 'Passed',
      };
    case 'pending':
      return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending' };
    case 'measuring':
      return { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Measuring' };
    case 'not-started':
      return { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Not Started' };
    default:
      return { icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Unknown' };
  }
};

export default function ReleaseReadinessDashboard() {
  const progress = Math.round(
    (readinessItems.filter((i) => i.status === 'passed').length / readinessItems.length) * 100,
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Release Readiness
          </h1>
          <p className="text-slate-500">Validation tracking for Muzaffarpur Pilot (MVP 1.1)</p>
        </div>
        <Badge
          variant="outline"
          className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-widest font-bold"
        >
          Code Freeze Active
        </Badge>
      </div>

      <Card className="bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Rocket className="w-32 h-32 text-teal-400" />
        </div>
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-2">
                Overall Progress
              </h3>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-black">{progress}%</span>
                <span className="text-slate-400 font-medium mb-1">validated for go-live</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="hidden md:block w-px h-24 bg-slate-800 mx-4" />

            <div className="hidden md:block flex-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Current Phase
              </h3>
              <p className="text-xl font-medium text-white mb-2">
                Phase 3: <span className="text-teal-400">Hospital Simulation</span>
              </p>
              <p className="text-sm text-slate-400">Next: Staff Training & Limited Pilot</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-400" /> Validation Gates
          </h2>
          <div className="grid gap-3">
            {readinessItems.map((item) => {
              const conf = getStatusConfig(item.status);
              return (
                <div
                  key={item.id}
                  className="flex items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`p-2 rounded-lg ${conf.bg} mr-4`}>
                    <item.icon className={`w-5 h-5 ${conf.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${conf.color} ${conf.bg} border-none font-bold uppercase tracking-wider text-[10px]`}
                  >
                    {conf.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-slate-400" /> Issue Severity Matrix
            </h2>
            <Card>
              <CardContent className="p-0 divide-y divide-slate-100">
                {severityLevels.map((lvl) => (
                  <div key={lvl.level} className="p-4 flex gap-4">
                    <div className="mt-1">
                      <div className={`w-3 h-3 rounded-full ${lvl.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{lvl.level}</h4>
                      <p className="text-sm text-slate-500">{lvl.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" /> Issue Origins
            </h2>
            <Card>
              <CardContent className="p-0 grid grid-cols-2 divide-x divide-y divide-slate-100">
                {issueOrigins.map((orig) => (
                  <div key={orig.type} className="p-3">
                    <h4
                      className={`font-bold text-sm mb-1 flex items-center gap-1.5 ${orig.color}`}
                    >
                      <orig.icon className="w-4 h-4" />
                      {orig.type}
                    </h4>
                    <p className="text-xs text-slate-500 leading-tight">{orig.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-400" /> Daily Review Checklist
            </h2>
            <Card className="bg-blue-50/50 border-blue-100">
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm text-blue-900">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Number of patients seen
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Number of crashes
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> How many times did
                    staff need help?
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Slowest workflow
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Printing issues
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Bugs fixed today vs
                    remaining
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
