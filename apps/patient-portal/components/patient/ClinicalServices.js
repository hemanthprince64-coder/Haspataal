import {
  Hospital,
  FileText,
  Pill,
  Activity,
  ClipboardList,
  Syringe,
  Baby,
  ShieldCheck,
  MessageSquareMore,
  ChevronRight,
} from 'lucide-react';

import Link from 'next/link';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const clinicalSections = [
  {
    name: 'Medical History',
    href: '/medical-history',
    icon: <Hospital className="w-6 h-6" />,
    desc: 'Conditions & allergies',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    name: 'Prescriptions',
    href: '/prescriptions',
    icon: <FileText className="w-6 h-6" />,
    desc: 'Clinical & uploaded',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    name: 'Medications',
    href: '/medications',
    icon: <Pill className="w-6 h-6" />,
    desc: 'Current medicines',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    name: 'Vitals Tracker',
    href: '/vitals',
    icon: <Activity className="w-6 h-6" />,
    desc: 'BP, weight, sugar',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    name: 'Test Reports',
    href: '/records',
    icon: <ClipboardList className="w-6 h-6" />,
    desc: 'Lab results & scans',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    name: 'Vaccinations',
    href: '/vaccinations',
    icon: <Syringe className="w-6 h-6" />,
    desc: 'Vaccine records',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
  {
    name: 'Pregnancy Tracker',
    href: '/tracker',
    icon: <Baby className="w-6 h-6" />,
    desc: 'Maternal health',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
  {
    name: 'Insurance',
    href: '/insurance',
    icon: <ShieldCheck className="w-6 h-6" />,
    desc: 'Policy details',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    name: 'MedChat AI',
    href: '/medchat',
    icon: <MessageSquareMore className="w-6 h-6" />,
    desc: 'AI health assistant',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
];

export default function ClinicalServices() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clinicalSections.map((s, i) => (
        <Link key={s.href} href={s.href} className="group no-underline">
          <Card className="h-full border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 rounded-[1.5rem] overflow-hidden bg-white">
            <CardContent className="p-6 pt-6 grid grid-cols-[auto_1fr_auto] items-center gap-5">
              <div
                className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
              >
                {s.icon}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate leading-tight mb-1">
                  {s.name}
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 font-medium truncate leading-normal">
                  {s.desc}
                </CardDescription>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-400 transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
