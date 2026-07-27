'use client';

import {
  Menu,
  Home,
  Search,
  MessageSquare,
  HeartPulse,
  FileText,
  AlertTriangle,
} from 'lucide-react';

import React, { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ProfileDropdown from '@/app/(patient)/components/ProfileDropdown';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'MedChat AI', href: '/medchat', icon: MessageSquare },
  { name: 'Recovery', href: '/recovery', icon: HeartPulse },
  { name: 'Records', href: '/records', icon: FileText },
];

export function PatientNavigation({
  patient,
  onOpenSidebar,
}: {
  patient?: any;
  onOpenSidebar?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop & Mobile Top Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          {/* Left Section: Hamburger & Brand */}
          <div className="flex items-center gap-4">
            {/* Desktop Hamburger (Hidden on mobile where bottom nav is used) */}
            {onOpenSidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex shrink-0 hover:bg-muted/50 rounded-full"
                onClick={onOpenSidebar}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            )}

            {/* Brand Logo */}
            <Link
              href="/patient/dashboard"
              className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95"
            >
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground hidden sm:inline-block">
                Haspataal
              </span>
            </Link>
          </div>

          {/* Center Section: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 mx-6 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (pathname === '/' && link.name === 'Home');
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 no-underline',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon
                    className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground')}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Emergency & Profile */}
          <div className="flex items-center gap-3 md:gap-5">
            <Button
              variant="destructive"
              className="font-semibold shadow-md shadow-destructive/20 hover:shadow-destructive/40 transition-all flex gap-2 rounded-full px-4 md:px-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 relative z-10" />
              <span className="hidden sm:inline relative z-10">Emergency</span>
              <span className="sm:hidden relative z-10">SOS</span>
            </Button>

            <ProfileDropdown patient={patient} />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur pb-safe-offset shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.1)]">
        {/* pb-2 adds some padding for non-iOS, but handles most standard modern phones */}
        <div className="flex justify-around items-center px-2 h-16 pb-2 pt-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (pathname === '/' && link.name === 'Home');
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative group',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center p-1.5 rounded-full transition-all duration-300 ease-out',
                    isActive ? 'bg-primary/10' : 'group-hover:bg-muted',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-[22px] w-[22px] transition-transform duration-300',
                      isActive && 'scale-110 stroke-[2.5px]',
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium leading-none tracking-wide transition-all duration-300',
                    isActive ? 'font-semibold opacity-100' : 'opacity-80 group-hover:opacity-100',
                  )}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind the fixed bottom nav on mobile */}
      <div className="h-16 md:hidden w-full shrink-0" />
    </>
  );
}
