import { Lock, ChevronLeft } from 'lucide-react';

import React from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

export interface AuthCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  bottomLink?: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    href: string;
  };
}

export function AuthCard({ title, description, icon: Icon, children, bottomLink }: AuthCardProps) {
  return (
    <Card className="max-w-[460px] w-full rounded-[3rem] border-slate-200/50 shadow-2xl shadow-slate-200/40 bg-white overflow-hidden">
      <CardHeader className="p-10 pb-0 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20 animate-fade-in-up">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter">
          {title}
        </CardTitle>
        <CardDescription className="text-slate-500 text-lg font-medium tracking-tight mt-2">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-10 pt-8">
        {children}

        {bottomLink && (
          <div className="mt-12 pt-8 border-t border-slate-100">
            <a
              href={bottomLink.href}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-blue-600 transition-colors">
                  <bottomLink.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    {bottomLink.subtitle}
                  </div>
                  <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {bottomLink.title}
                  </div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180" />
            </a>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50/50 p-6 flex justify-center border-t border-slate-100">
        <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <Lock className="w-3.5 h-3.5" /> End-to-end Encrypted
        </p>
      </CardFooter>
    </Card>
  );
}
