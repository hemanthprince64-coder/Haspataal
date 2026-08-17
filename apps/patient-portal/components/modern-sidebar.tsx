/* eslint-disable */
'use client';

import {
  Home,
  Search,
  Bot,
  Building2,
  Microscope,
  FileText,
  User,
  Stethoscope,
  Pill,
  HeartPulse,
  Syringe,
  Baby,
  ShieldCheck,
  AlertTriangle,
  X,
  Command,
  Calendar,
  Package,
  Siren,
} from 'lucide-react';

import { useEffect, useRef } from 'react';

import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

const ModernSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname() || '';
  const sidebarRef = useRef(null);
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, category: 'Main' },
    {
      name: 'Escalations',
      href: '/hospital/escalations',
      icon: Siren,
      category: 'Main',
      priority: true,
    },
    { name: 'Patient Management', href: '/patient', icon: User, category: 'HMS Modules' },
    {
      name: 'Appointments',
      href: '/patient/appointments',
      icon: Calendar,
      category: 'HMS Modules',
    },
    { name: 'EHR System', href: '/patient/ehr', icon: FileText, category: 'HMS Modules' },
    { name: 'Inventory', href: '/patient/inventory', icon: Package, category: 'HMS Modules' },
    { name: 'MedChat AI', href: '/medchat', icon: Bot, category: 'AI & Support' },
    { name: 'Find Doctors', href: '/search', icon: Search, category: 'Services' },
    { name: 'Hospitals', href: '/hospitals', icon: Building2, category: 'Services' },
    { name: 'Lab Tests', href: '/lab-tests', icon: Microscope, category: 'Diagnostics' },
    {
      name: 'Medical History',
      href: '/medical-history',
      icon: Stethoscope,
      category: 'Health Records',
    },
    { name: 'Medications', href: '/medications', icon: Pill, category: 'Treatments' },
    { name: 'Vitals', href: '/vitals', icon: HeartPulse, category: 'Monitoring' },
    { name: 'Vaccinations', href: '/vaccinations', icon: Syringe, category: 'Prevention' },
    { name: 'Pregnancy', href: '/tracker', icon: Baby, category: 'Special Care' },
    { name: 'Insurance', href: '/insurance', icon: ShieldCheck, category: 'Coverage' },
  ];

  // Group navigation items by category
  const groupedLinks = navLinks.reduce((acc: Record<string, typeof navLinks>, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-[210] w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <Command className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Navigation
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">HMS Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close menu"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-6">
            {Object.entries(groupedLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
                  {category}
                </h3>
                <div className="space-y-1">
                  {links.map((link) => {
                    const isActive = pathname.startsWith(link.href) && link.href !== '/dashboard';
                    const isExactActive = pathname === link.href;
                    const active = isActive || isExactActive;
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 no-underline ${
                          active
                            ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-l-2 border-sky-600'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                        } ${link.priority ? 'bg-red-50/60' : ''}`}
                        onClick={onClose}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            active
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-slate-400 dark:text-slate-500'
                          } ${link.priority ? 'text-red-500' : ''}`}
                        />
                        <span>{link.name}</span>
                        {link.priority && (
                          <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                            1
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <Link
            href="/emergency"
            className="flex items-center justify-center gap-2 w-full bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 font-medium py-3 rounded-lg transition-all duration-200 no-underline"
            onClick={onClose}
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Emergency SOS</span>
          </Link>

          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Theme</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-xs"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ModernSidebar;
