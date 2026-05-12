import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logoutHospital } from '@/app/actions';
import Image from 'next/image';
import { Button } from '@haspataal/ui';
import { LayoutDashboard, CreditCard, BarChart3, Users, LogOut } from 'lucide-react';

export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user;

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/billing', label: 'OPD & Billing', icon: CreditCard },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
    ...(user.role === 'ADMIN'
      ? [{ href: '/dashboard/doctors', label: 'Manage Doctors', icon: Users }]
      : []),
  ];

  return (
    <div className="flex min-h-[calc(100vh-60px)]">
      {/* Sidebar - Using shadcn/ui style with Tailwind */}
      <aside className="w-[260px] bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col py-6 flex-shrink-0 hidden md:flex">
        {/* Hospital Info */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🏥</span>
            </div>
            <div>
              <div className="font-bold text-sm">{user.name}</div>
              <div className="text-xs text-slate-400">{user.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom - Logout */}
        <div className="px-3 mt-auto pt-6 border-t border-slate-700">
          <form action={logoutHospital}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-red-300 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile header (simplified - could be expanded) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-2 flex justify-around z-50">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 p-2 text-slate-300"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-slate-50 overflow-y-auto md:pb-6 pb-20">
        {children}
      </main>
    </div>
  );
}
