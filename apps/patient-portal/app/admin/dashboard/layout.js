import { LayoutDashboard, Building2, LogOut, Shield } from 'lucide-react';

import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { logoutAdmin } from '@/app/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { requireRole } from '../../../lib/auth/requireRole';
import { UserRole } from '../../../types';

export default async function AdminDashboardLayout({ children }) {
  let admin;
  try {
    admin = await requireRole(UserRole.PLATFORM_ADMIN, 'session_admin');
  } catch (e) {
    redirect('/admin');
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/dashboard/hospitals', label: 'Hospitals', icon: Building2 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-[270px] bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between p-6 shrink-0 z-20">
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shadow-md shadow-blue-500/5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base text-white tracking-tight leading-none mb-1">
                Haspataal
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">
                Admin Panel
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} passHref legacyBehavior>
                  <a className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition-all group duration-300">
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Controls */}
        <div className="border-t border-slate-800/80 pt-6 mt-6">
          <div className="flex items-center gap-3 px-2 mb-5">
            <Avatar className="w-9 h-9 border border-slate-700 bg-slate-800 text-blue-500">
              <AvatarFallback className="font-bold text-xs uppercase text-slate-300">
                {admin.name ? admin.name.substring(0, 2) : 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">
                Signed In As
              </div>
              <div className="text-sm font-bold text-white truncate">
                {admin.name || 'Administrator'}
              </div>
            </div>
          </div>

          <form action={logoutAdmin}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 gap-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">
            Platform Services
          </div>
          <div className="flex items-center gap-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Node Sync Active</span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
