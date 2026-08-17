'use client';

import { User, Stethoscope, ShieldCheck, LogOut } from 'lucide-react';

import { useState, useRef, useEffect } from 'react';

import Link from 'next/link';

import Avatar from '@/app/components/Avatar';

interface ProfileDropdownProps {
  patient: any;
}

export default function ProfileDropdown({ patient }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Medical History', href: '/medical-history', icon: Stethoscope },
    { name: 'Insurance', href: '/insurance', icon: ShieldCheck },
  ];

  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:scale-105 transition-transform duration-200 ring-4 ring-transparent hover:ring-blue-50 rounded-full focus:outline-none focus:ring-blue-100"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar
          size="md"
          imageUrl={patient?.profilePhotoUrl}
          name={patient?.name || patient?.nickname}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-100 mb-1">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {patient?.name || patient?.nickname || 'Patient'}
            </p>
            {patient?.phone && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{patient.phone}</p>
            )}
          </div>

          <div className="flex flex-col">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Icon className="w-4 h-4 opacity-70" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-1 pt-1 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 opacity-70" />
              Sign Out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
