'use client';

import {
  Search,
  Calendar,
  Siren,
  UserCircle,
  MapPin,
  Wallet,
  LogOut,
  FileDown,
  ChevronRight,
  UserCog,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';

import { useState, useEffect } from 'react';

import Link from 'next/link';

import { getPatientFullProfile, patientLogout } from '@/app/actions';
import ClinicalServices from '@/components/patient/ClinicalServices';
import ProfileCard from '@/components/patient/ProfileCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const actionSections = [
  {
    name: 'Book Appointment',
    href: '/search',
    icon: <Search className="w-6 h-6" />,
    desc: 'Find doctors & hospitals',
    bg: 'bg-blue-50',
    color: 'text-blue-600',
  },
  {
    name: 'My Appointments',
    href: '/appointments',
    icon: <Calendar className="w-6 h-6" />,
    desc: 'Upcoming & Past',
    bg: 'bg-indigo-50',
    color: 'text-indigo-600',
  },
  {
    name: 'Emergency SOS',
    href: '/emergency',
    icon: <Siren className="w-6 h-6" />,
    desc: 'Ambulance help',
    bg: 'bg-rose-50',
    color: 'text-rose-600',
  },
];

export default function ProfilePage() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    getPatientFullProfile()
      .then((data) => {
        if (data) setPatient(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Profile load err:', err);
        setLoading(false);
      });
  }, []);

  const walletBalance = patient?.wallet?.balance || 0;
  const formattedBalance = parseFloat(walletBalance).toFixed(2);

  const personalSections = [
    {
      name: 'Profile Details',
      href: '/profile/details',
      icon: <UserCircle className="w-6 h-6" />,
      desc: 'Complete medical bio',
      bg: 'bg-sky-50',
      color: 'text-sky-600',
    },
    {
      name: 'Saved Addresses',
      href: '/addresses',
      icon: <MapPin className="w-6 h-6" />,
      desc: 'Home, Work & More',
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
    {
      name: 'Haspataal Wallet',
      href: '/wallet',
      icon: <Wallet className="w-6 h-6" />,
      desc: `Balance: ₹${formattedBalance} • Tap to top-up`,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 animate-fade-in space-y-12">
      {/* Header Section */}
      <div className="space-y-6">
        {loading ? (
          <Skeleton className="h-48 w-full rounded-[2rem]" />
        ) : (
          <ProfileCard patient={patient} />
        )}
      </div>

      {/* Quick Actions */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionSections.map((s) => (
            <Link key={s.href} href={s.href} className="group no-underline">
              <Card className="border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 rounded-[1.5rem] bg-white overflow-hidden h-full">
                <CardContent className="p-6 pt-6 grid grid-cols-[auto_1fr_auto] items-center gap-5">
                  <div
                    className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
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
      </section>

      {/* Personal Data */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <UserCog className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
            Account & Personal
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-24 rounded-[1.5rem]" />)
            : personalSections.map((s) => (
                <Link key={s.href} href={s.href} className="group no-underline">
                  <Card className="border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 rounded-[1.5rem] bg-white overflow-hidden h-full">
                    <CardContent className="p-6 pt-6 grid grid-cols-[auto_1fr_auto] items-center gap-5">
                      <div
                        className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        {s.icon}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate leading-tight mb-1">
                          {s.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500 font-medium truncate leading-normal">
                          {s.desc}
                        </CardDescription>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-400 transition-colors shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </section>

      {/* Clinical Services */}
      <section className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              Clinical Services
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => import('@/app/export').then((m) => m.downloadPatientReport(patient))}
            className="h-10 rounded-xl px-4 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold text-[11px] uppercase tracking-widest gap-2"
          >
            <FileDown className="w-4 h-4" /> PDF Health Report
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
          </div>
        ) : (
          <ClinicalServices />
        )}
      </section>

      {/* Logout Action */}
      <div className="mt-8 mb-24 md:mb-0">
        <Button
          type="button"
          variant="destructive"
          size="lg"
          onClick={() => setLogoutDialogOpen(true)}
          className="w-full h-14 md:h-12 rounded-[1.25rem] md:rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-rose-500/10 transition-all active:scale-95 group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
          Terminate Secured Session
        </Button>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Are you sure you want to terminate your secured session? You will need to log in again
              to access your health records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <form action={patientLogout}>
              <Button
                type="submit"
                variant="destructive"
                className="rounded-xl bg-rose-600 hover:bg-rose-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Confirm Logout
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
