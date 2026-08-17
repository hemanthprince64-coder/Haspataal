'use client';

import { UserPlus, Search, CalendarPlus, FileText, Mic, Printer, Home } from 'lucide-react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SuperQuickActionBar() {
  const router = useRouter();

  const actions = [
    { label: 'Register Patient', icon: UserPlus, href: '/hospital/dashboard/reception' },
    {
      label: 'Search Patient',
      icon: Search,
      action: () => {
        // Trigger command palette if possible, or just go to reception search
        const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
        document.dispatchEvent(event);
      },
    },
    { label: 'Book Appointment', icon: CalendarPlus, href: '/hospital/dashboard/consultation' },
    { label: 'Quick Bill', icon: FileText, href: '/hospital/dashboard/billing' },
    {
      label: 'Call Next',
      icon: Mic,
      action: () => router.push('/hospital/dashboard/consultation'),
    },
    { label: 'Print', icon: Printer, action: () => window.print() },
    { label: 'Home', icon: Home, href: '/hospital/dashboard' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-2 px-4 shadow-md sticky top-0 z-40 overflow-x-auto flex gap-2 sm:gap-4 no-scrollbar">
      {actions.map((action, i) => {
        const Icon = action.icon;

        if (action.href) {
          return (
            <Link
              key={i}
              href={action.href}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors text-xs sm:text-sm font-medium whitespace-nowrap border border-slate-700 hover:border-slate-600"
            >
              <Icon className="w-4 h-4 text-teal-400" />
              {action.label}
            </Link>
          );
        }

        return (
          <button
            key={i}
            onClick={action.action}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors text-xs sm:text-sm font-medium whitespace-nowrap border border-slate-700 hover:border-slate-600"
          >
            <Icon className="w-4 h-4 text-blue-400" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
