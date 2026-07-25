/* eslint-disable */
import { requireHospitalStaff } from '@haspataal/auth';
import { AuthorizationService } from '@haspataal/core';
import {
  LayoutDashboard,
  CreditCard,
  RefreshCw,
  BedDouble,
  Pill,
  TestTube,
  BarChart3,
  Bell,
  FileText,
  Settings2,
  MapPin,
  LogOut,
  Sparkles,
  Landmark,
  UserPlus,
  Stethoscope,
  Menu,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { logoutHospital } from '@/app/actions';
import CommandPalette from '@/components/hospital/CommandPalette';
import OfflineBanner from '@/components/hospital/OfflineBanner';
import SuperQuickActionBar from '@/components/hospital/SuperQuickActionBar';
import BranchSwitcher from '@/components/hospital/branch-switcher';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getActiveBranchId } from '@/lib/branch';
import { prisma } from '@/lib/prisma';
import { computeSetupCompletion } from '@/lib/setup/completion-engine';
import { SessionUser } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  let user: SessionUser;
  try {
    user = (await requireHospitalStaff('session_user')) as unknown as SessionUser;
  } catch (e) {
    redirect('/hospital/login');
  }

  const hospitalId = user.hospitalId;
  let setupProgress = 0;
  let branches: any[] = [];
  let activeBranchId: string | null = null;
  let hasCriticalWarnings = false;

  // ── Setup Gate ───────────────────────────────────────────────────────────────
  // If the hospital has not yet gone live (accountStatus !== 'active'),
  // redirect to the full-screen setup wizard. This prevents access to any
  // dashboard module until onboarding is complete.
  let needsRedirect = false;
  if (hospitalId) {
    try {
      const hospitalStatus = await prisma.hospitalsMaster.findUnique({
        where: { id: hospitalId },
        select: { accountStatus: true },
      });
      if (hospitalStatus && hospitalStatus.accountStatus !== 'active') {
        needsRedirect = true;
      }
    } catch (gateErr) {
      // If we can't read the DB, let them through rather than hard-block
      console.error('Setup gate check failed:', gateErr);
    }
  }

  if (needsRedirect) {
    redirect('/hospital/setup');
  }
  // ─────────────────────────────────────────────────────────────────────────────

  try {
    if (hospitalId) {
      const [completion, branchList, currentBranchId] = await Promise.all([
        computeSetupCompletion(hospitalId),
        prisma.branch.findMany({ where: { hospitalId, isActive: true } }),
        getActiveBranchId(),
      ]);
      setupProgress = completion.totalWeightedScore;
      branches = branchList;
      activeBranchId = currentBranchId || branchList.find((b) => b.isHeadquarters)?.id || null;
      hasCriticalWarnings = completion.criticalWarnings.length > 0;
    }
  } catch (err) {
    console.error('Failed to compute setup progress:', err);
  }

  const authService = new AuthorizationService(prisma);
  const permissions = await authService.getStaffPermissions(user.id, user.role);

  const allNavItems = [
    {
      href: '/hospital/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      module: 'OVERVIEW',
    },
    {
      href: '/hospital/dashboard/reception',
      label: 'Reception',
      icon: UserPlus,
      badge: null,
      module: 'RECEPTION',
    },
    {
      href: '/hospital/dashboard/consultation',
      label: 'Consultation',
      icon: Stethoscope,
      badge: null,
      module: 'CONSULTATION',
    },
    {
      href: '/hospital/dashboard/billing',
      label: 'OPD & Billing',
      icon: CreditCard,
      badge: null,
      module: 'BILLING',
    },
    {
      href: '/hospital/dashboard/retention',
      label: 'Retention',
      icon: RefreshCw,
      badge: 'AI',
      module: 'RETENTION',
    },
    {
      href: '/hospital/dashboard/wards',
      label: 'IPD / Wards',
      icon: BedDouble,
      badge: null,
      module: 'WARDS',
    },
    {
      href: '/hospital/dashboard/pharmacy',
      label: 'Pharmacy',
      icon: Pill,
      badge: null,
      module: 'PHARMACY',
    },
    {
      href: '/hospital/dashboard/diagnostics',
      label: 'Diagnostics',
      icon: TestTube,
      badge: null,
      module: 'DIAGNOSTICS',
    },
    {
      href: '/hospital/dashboard/analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
      module: 'ANALYTICS',
    },
    {
      href: '/hospital/dashboard/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: '12',
      module: 'NOTIFICATIONS',
    },
    {
      href: '/hospital/dashboard/reports',
      label: 'Reports',
      icon: FileText,
      badge: null,
      module: 'REPORTS',
    },
    {
      href: '/hospital/dashboard/settlements',
      label: 'Settlements',
      icon: Landmark,
      badge: null,
      module: 'SETTLEMENTS',
    },
    {
      href: '/hospital/dashboard/setup',
      label: 'Setup Wizard',
      icon: Settings2,
      badge: setupProgress < 100 ? '!' : null,
      isCritical: hasCriticalWarnings,
      module: 'SETUP',
    },
    {
      href: '/hospital/dashboard/setup/branches',
      label: 'Branches',
      icon: MapPin,
      badge: branches.length > 1 ? branches.length : null,
      module: 'SETUP',
    },
  ];

  const navItems = allNavItems.filter(
    (item) =>
      authService.hasCapability(permissions, item.module) ||
      item.module === 'SETUP' ||
      item.module === 'NOTIFICATIONS' ||
      item.module === 'RETENTION' ||
      item.module === 'ANALYTICS' ||
      item.module === 'RECEPTION' ||
      item.module === 'CONSULTATION',
  );

  const sidebarContent = (
    <>
      {/* Branch Switcher Container */}
      <div className="mb-6 px-1">
        {branches.length > 0 && (
          <BranchSwitcher branches={branches} activeBranchId={activeBranchId} />
        )}
      </div>

      {/* Hospital Mini Profile */}
      <div className="px-2 mb-8">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group hover:bg-white/10 transition-all cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-lg flex-shrink-0 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            🏥
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-xs text-white truncate">{user.name}</div>
            <div className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-wider mt-0.5">
              Hospital Admin
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative min-h-[44px]
                            ${item.isCritical ? 'text-slate-300 hover:text-white' : 'hover:bg-white/5 hover:text-white'}`}
            >
              <Icon
                className={`h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity ${item.isCritical && setupProgress < 100 ? 'text-red-400 motion-safe:animate-pulse' : ''}`}
              />
              <span>{item.label}</span>

              {item.badge && (
                <span
                  className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-1
                                ${
                                  item.badge === '!'
                                    ? 'bg-red-500 text-white motion-safe:animate-pulse'
                                    : item.badge === 'AI'
                                      ? 'bg-purple-500 text-white'
                                      : 'bg-teal-500 text-white'
                                }`}
                >
                  {item.badge === '!' && <AlertTriangle className="h-3 w-3" />}
                  {item.badge === 'AI' && <Sparkles className="h-2 w-2" />}
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Setup Progress Visualization */}
      <div className="mt-8 mb-6 mx-1 p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="h-8 w-8 text-teal-400" />
        </div>

        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mb-1">
              Onboarding
            </span>
            <span className="text-sm font-bold text-white">Setup Progress</span>
          </div>
          <span className="text-lg font-black text-teal-400">{setupProgress}%</span>
        </div>

        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(20,184,166,0.5)]"
            style={{ width: `${setupProgress}%` }}
          />
        </div>

        {setupProgress < 100 && (
          <p className="text-[9px] text-slate-500 mt-3 font-medium">
            Complete critical modules to activate your hospital.
          </p>
        )}
      </div>

      {/* Logout Action */}
      <div className="pt-4 mt-2 border-t border-slate-800">
        <form action={logoutHospital}>
          <button
            type="submit"
            suppressHydrationWarning
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group min-h-[44px]"
          >
            <LogOut className="h-4 w-4 opacity-70 group-hover:opacity-100" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <OfflineBanner />
      <div className="flex min-h-[calc(100vh-60px)] font-sans bg-slate-50/50 flex-col md:flex-row">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to main content
        </a>

        {/* Sidebar - Desktop Only */}
        <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col p-4 flex-shrink-0 border-r border-slate-800 shadow-xl z-20">
          {sidebarContent}
        </aside>

        {/* Main Content Area */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto scroll-smooth pb-20 md:pb-0 flex flex-col text-senior-base"
        >
          <div className="flex items-center bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
            {/* Visible on tablet only — md:block lg:hidden */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="hidden md:flex lg:hidden p-2.5 min-h-[44px] min-w-[44px] items-center justify-center text-slate-400 hover:text-white ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 p-4 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col sm:max-w-xs [&>button]:text-slate-400 [&>button]:hover:text-white"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                {sidebarContent}
              </SheetContent>
            </Sheet>
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <SuperQuickActionBar />
            </div>
          </div>
          <div className="flex-1">{children}</div>
        </main>

        <CommandPalette />

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-blue-600 transition-colors relative"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 motion-safe:animate-pulse">
                    <span className="sr-only">New notification</span>
                  </span>
                )}
              </Link>
            );
          })}
          {navItems.length > 4 && (
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-blue-600 transition-colors relative">
                  <ChevronUp className="h-5 w-5" />
                  <span className="text-[10px] font-medium truncate max-w-[60px]">More</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] px-4 py-6 overflow-y-auto">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle>Modules</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 pb-8">
                  {navItems.slice(4).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-xl text-sm font-medium transition-all group relative border border-slate-100 hover:border-slate-200 hover:bg-slate-50`}
                      >
                        <Icon className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span
                            className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm text-white flex items-center gap-1 ${item.badge === '!' ? 'bg-red-500 motion-safe:animate-pulse' : 'bg-teal-500'}`}
                          >
                            {item.badge === '!' && <AlertTriangle className="h-3 w-3" />}
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </nav>
      </div>
    </>
  );
}
