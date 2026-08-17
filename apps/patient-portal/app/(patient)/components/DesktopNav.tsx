'use client';

import { Home, Search, MessageSquare, RotateCcw, FileText } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DesktopNav() {
  const pathname = usePathname() || '';

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Medchat', href: '/medchat', icon: MessageSquare },
    { name: 'Recovery', href: '/recovery', icon: RotateCcw },
    { name: 'Records', href: '/records', icon: FileText },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1 mx-6">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 no-underline ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
