'use client';

import { motion } from 'framer-motion';
import { CheckCircle, PhoneCall, Play, Settings2, Sparkles } from 'lucide-react';

import React from 'react';

import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  hospitalName: string;
  onStart: () => void;
}

export default function WelcomeScreen({ hospitalName, onStart }: WelcomeScreenProps) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Hero Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/50 via-white to-blue-50/30 p-8 shadow-xl shadow-teal-900/5 mb-8"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Sparkles className="h-40 w-40 text-teal-600" />
        </div>

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="bg-teal-500 text-white p-4 rounded-2xl shadow-lg shadow-teal-500/20">
            <CheckCircle className="h-12 w-12" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 mb-2">
              <Sparkles className="h-3 w-3" /> Approved & Verified
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Congratulations, {hospitalName}!
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Your clinic profile is officially approved on the Haspataal Network. Let's get your
              setup completed in just a few minutes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Assisted Onboarding Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/50 p-6 shadow-md mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-700 flex-shrink-0">
              <PhoneCall className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Not technical? Let us do the work!
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Our onboarding experts can configure your entire hospital over the phone. We will
                set up your doctors, staff, fees, and departments for you.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-amber-300 hover:bg-amber-100 text-amber-800 font-bold shrink-0 self-stretch sm:self-auto text-center"
            onClick={() =>
              alert(
                'Support request submitted! An onboarding specialist will call you on your registered mobile number shortly.',
              )
            }
          >
            Request Assisted Call
          </Button>
        </div>
      </motion.div>

      {/* Grid Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core Wizard Action */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col justify-between border border-slate-200 bg-white hover:border-teal-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          onClick={onStart}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-500 group-hover:text-white transition-colors">
              <Settings2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Start Setup Wizard</h3>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Answer 6 quick questions to auto-configure your custom departments, lab, and pharmacy
              settings.
            </p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold w-full mt-6 shadow-sm">
            Begin Setup
          </Button>
        </motion.div>

        {/* Schedule Call */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col justify-between border border-slate-200 bg-white hover:border-teal-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          onClick={() =>
            alert(
              'Onboarding Call Scheduled! A calendar invite has been sent to your admin email address.',
            )
          }
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <PhoneCall className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Schedule Call</h3>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Book a 15-minute onboarding Zoom/phone session at your convenience to align workflows.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-slate-300 hover:bg-slate-50 text-slate-700 font-bold w-full mt-6"
          >
            Book Appointment
          </Button>
        </motion.div>

        {/* Watch Tutorial */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col justify-between border border-slate-200 bg-white hover:border-teal-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          onClick={() => alert('Playing Quick Walkthrough Tutorial Video... (Mock)')}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:bg-purple-50 group-hover:text-white transition-colors">
              <Play className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Watch Tutorial</h3>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              See a 3-minute video showing the daily OPD patient queue, e-prescription generation,
              and billing workflow.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-slate-300 hover:bg-slate-50 text-slate-700 font-bold w-full mt-6"
          >
            Watch Video (3 Min)
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
