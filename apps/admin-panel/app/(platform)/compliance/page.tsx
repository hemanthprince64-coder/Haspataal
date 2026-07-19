import React from 'react';

export default function ComplianceCenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Center</h1>
          <p className="text-muted-foreground">
            Regulatory tracking for Hospitals, Doctors, and the Platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="border bg-card shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Hospital Compliance</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">NABH Accreditations</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                100% Valid
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">NABL Certifications</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                3 Expiring
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fire Safety</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                100% Valid
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Biomedical Waste</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                1 Missing
              </span>
            </div>
          </div>
        </div>

        <div className="border bg-card shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Doctor Compliance</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Medical Council Reg.</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                100% Valid
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">License Renewals</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                12 Pending
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Mandatory Training</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                98% Complete
              </span>
            </div>
          </div>
        </div>

        <div className="border bg-card shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Platform Compliance</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">DPDP Consent</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ABDM Integration</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Data Encryption</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                AES-256
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Automated Backups</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Last 2h
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
