import {
  Clock,
  CheckCircle2,
  Building2,
  MapPin,
  FileText,
  Globe,
  GraduationCap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { services } from '@/lib/services';

import HospitalActions from './HospitalActions';

export const dynamic = 'force-dynamic';

export default async function AdminHospitalsPage() {
  const rawHospitals = await services.admin.getAllHospitals();

  // Fetch doctor counts concurrently
  const hospitals = await Promise.all(
    rawHospitals.map(async (h) => {
      const doctors = await services.platform.getHospitalDoctors(h.id);
      return { ...h, doctorCount: doctors.length };
    }),
  );

  const pending = hospitals.filter((h) => h.verificationStatus === 'pending');
  const active = hospitals.filter(
    (h) => h.accountStatus === 'active' && h.verificationStatus === 'verified',
  );
  const others = hospitals.filter(
    (h) => h.verificationStatus !== 'pending' && h.accountStatus !== 'active',
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-slate-100">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Hospital Management</h1>
        <p className="text-slate-400 text-sm">
          {hospitals.length} total hospitals • {pending.length} pending • {active.length} active
        </p>
      </div>

      {/* Pending Approvals Section */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>Pending Approvals</span>
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
              {pending.length}
            </Badge>
          </h2>

          <div className="grid gap-6">
            {pending.map((h) => (
              <Card
                key={h.id}
                className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {h.legalName || h.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                        {h.facilityType || 'HOSPITAL'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <strong>City:</strong> {h.city || '—'}
                      </span>
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <strong>Reg No:</strong> {h.registrationNumber || '—'}
                      </span>
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-slate-500" />
                        <strong>Council No:</strong> {h.medicalCouncilNumber || '—'}
                      </span>
                    </div>

                    <div className="flex gap-4 pt-1">
                      {h.googleLocationUrl && (
                        <a
                          href={h.googleLocationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/5 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/10"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>View Map Location</span>
                        </a>
                      )}
                      {h.approvalDocumentUrl && (
                        <a
                          href={h.approvalDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors bg-teal-500/5 hover:bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/10"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Preview Legal License</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center shrink-0">
                    <HospitalActions hospitalId={h.id} name={h.name} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Hospitals Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Active Hospitals</span>
        </h2>

        <Card className="bg-slate-900/40 border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Hospital Details</th>
                  <th className="py-4 px-6">Registration Info</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {active.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 px-6 text-center text-slate-500 font-medium">
                      No active hospitals on the platform yet.
                    </td>
                  </tr>
                ) : (
                  active.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4.5 px-6">
                        <div className="font-bold text-white text-base">
                          {h.legalName || h.name}
                        </div>
                        <div className="text-slate-400 text-xs mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{h.city}</span>
                          <span className="text-slate-600">•</span>
                          <span>{h.doctorCount} doctors active</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="text-xs text-slate-400 space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-500">Reg:</span>
                            <span>{h.registrationNumber || '—'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-500">Council:</span>
                            <span>{h.medicalCouncilNumber || '—'}</span>
                          </div>
                          {h.approvalDocumentUrl && (
                            <a
                              href={h.approvalDocumentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-300 transition-colors mt-0.5"
                            >
                              <FileText className="w-3 h-3" />
                              <span>View License</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase tracking-wider text-[10px]">
                          Active
                        </Badge>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <HospitalActions hospitalId={h.id} name={h.name} isActive />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Other Hospitals Section */}
      {others.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            <span>Other Facilities</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {others.map((h) => (
              <Card
                key={h.id}
                className="bg-slate-900/20 border border-slate-800/80 p-5 flex items-center justify-between opacity-70"
              >
                <div>
                  <h3 className="font-bold text-white">{h.legalName || h.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{h.city}</span>
                  </p>
                </div>
                <Badge
                  variant="destructive"
                  className="font-bold uppercase tracking-wider text-[10px]"
                >
                  {h.accountStatus || 'INACTIVE'}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
