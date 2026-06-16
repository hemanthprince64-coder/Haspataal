'use client';

import {
  Stethoscope,
  Plus,
  Search,
  Mail,
  Smartphone,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  ChevronRight,
  GraduationCap,
  Calendar,
  Clock,
  DollarSign,
  ShieldCheck,
  Globe,
  Building2,
  UserPlus,
  Info,
  Filter,
  MoreVertical,
  LayoutGrid,
  Award,
  Briefcase,
  History,
  Settings,
  Eye,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Branch {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  speciality: string;
  experienceYears: number;
  consultationFee: number;
  followUpFee: number;
  followUpDays: number;
  isActive: boolean;
  departments: string[];
  branchIds: string[];
  consultationDurationMins: number;
  allowsOnlineBooking: boolean;
  availableFrom?: string;
  registration?: {
    number: string;
    council: string;
    degree: string;
  } | null;
}

const SPECIALITIES = [
  'General Physician',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Gynecology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology',
  'Dentistry',
  'ENT',
];

// ─── Wizard Dialog ────────────────────────────────────────────────────────────

function DoctorWizard({
  open,
  onClose,
  onSuccess,
  editDoctor,
  branches,
  departments,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editDoctor: Doctor | null;
  branches: Branch[];
  departments: Department[];
}) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: '',
    mobile: '',
    email: '',
    speciality: 'General Physician',
    experienceYears: 0,
    branchIds: [],
    deptIds: [],
    consultationFee: 500,
    followUpFee: 0,
    followUpDays: 7,
    consultationDurationMins: 15,
    allowsOnlineBooking: true,
    medicalCouncilRegNo: '',
    qualification: '',
  });

  useEffect(() => {
    if (editDoctor) {
      setForm({
        name: editDoctor.name,
        mobile: editDoctor.mobile,
        email: editDoctor.email || '',
        speciality: editDoctor.speciality,
        experienceYears: editDoctor.experienceYears,
        branchIds: editDoctor.branchIds || [],
        deptIds: editDoctor.departments || [],
        consultationFee: editDoctor.consultationFee,
        followUpFee: editDoctor.followUpFee,
        followUpDays: editDoctor.followUpDays,
        consultationDurationMins: editDoctor.consultationDurationMins,
        allowsOnlineBooking: editDoctor.allowsOnlineBooking,
        medicalCouncilRegNo: editDoctor.registration?.number || '',
        qualification: editDoctor.registration?.degree || '',
      });
    } else {
      setForm({
        name: '',
        mobile: '',
        email: '',
        speciality: 'General Physician',
        experienceYears: 0,
        branchIds: [],
        deptIds: [],
        consultationFee: 500,
        followUpFee: 0,
        followUpDays: 7,
        consultationDurationMins: 15,
        allowsOnlineBooking: true,
        medicalCouncilRegNo: '',
        qualification: '',
      });
    }
    setStep(1);
  }, [editDoctor, open]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/hospital/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save doctor');
      toast.success(editDoctor ? 'Doctor profile updated' : 'Doctor recruited successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const toggleBranch = (id: string) => {
    const ids = [...form.branchIds];
    if (ids.includes(id)) setForm({ ...form, branchIds: ids.filter((x) => x !== id) });
    else setForm({ ...form, branchIds: [...ids, id] });
  };

  const toggleDept = (id: string) => {
    const ids = [...form.deptIds];
    if (ids.includes(id)) setForm({ ...form, deptIds: ids.filter((x) => x !== id) });
    else setForm({ ...form, deptIds: [...ids, id] });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-900 px-8 py-10 text-white relative">
          <div className="relative z-10">
            <Badge className="bg-blue-600 text-white border-none font-black text-[10px] uppercase tracking-[0.2em] mb-3 px-3 py-1">
              Phase {step} of 3
            </Badge>
            <DialogTitle className="text-3xl font-black tracking-tight mb-2">
              {step === 1
                ? 'Practitioner Identity'
                : step === 2
                  ? 'Clinical Configuration'
                  : 'Compliance & Credentials'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              {step === 1
                ? 'Establish basic professional details and affiliation'
                : step === 2
                  ? 'Define consultation fees, durations, and booking channels'
                  : 'Verify medical registration for regulatory compliance'}
            </DialogDescription>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Stethoscope className="h-32 w-32" />
          </div>
        </div>

        <div className="p-8 bg-white">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Sarah Connor"
                    className="rounded-xl h-12 border-slate-200 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Mobile
                  </label>
                  <Input
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="rounded-xl h-12 border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Primary Speciality
                  </label>
                  <Select
                    value={form.speciality}
                    onValueChange={(v) => setForm({ ...form, speciality: v })}
                  >
                    <SelectTrigger className="rounded-xl h-12 border-slate-200 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {SPECIALITIES.map((s) => (
                        <SelectItem key={s} value={s} className="rounded-lg font-medium">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Experience (Years)
                  </label>
                  <Input
                    type="number"
                    value={form.experienceYears}
                    onChange={(e) =>
                      setForm({ ...form, experienceYears: parseInt(e.target.value) || 0 })
                    }
                    className="rounded-xl h-12 border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Assigned Branches
                </label>
                <div className="flex flex-wrap gap-2">
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBranch(b.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all
                        ${
                          form.branchIds.includes(b.id)
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'
                        }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-blue-600" /> Consultation Fee (₹)
                  </label>
                  <Input
                    type="number"
                    value={form.consultationFee}
                    onChange={(e) =>
                      setForm({ ...form, consultationFee: parseInt(e.target.value) || 0 })
                    }
                    className="rounded-2xl h-14 border-slate-200 font-black text-lg text-blue-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <History className="h-3 w-3 text-slate-400" /> Follow-up Fee (₹)
                  </label>
                  <Input
                    type="number"
                    value={form.followUpFee}
                    onChange={(e) =>
                      setForm({ ...form, followUpFee: parseInt(e.target.value) || 0 })
                    }
                    className="rounded-2xl h-14 border-slate-200 font-black text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Follow-up Window (Days)
                  </label>
                  <Input
                    type="number"
                    value={form.followUpDays}
                    onChange={(e) =>
                      setForm({ ...form, followUpDays: parseInt(e.target.value) || 0 })
                    }
                    className="rounded-xl h-12 border-slate-200 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Slot Duration (Mins)
                  </label>
                  <Select
                    value={form.consultationDurationMins.toString()}
                    onValueChange={(v) =>
                      setForm({ ...form, consultationDurationMins: parseInt(v) })
                    }
                  >
                    <SelectTrigger className="rounded-xl h-12 border-slate-200 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {[10, 15, 20, 30, 45, 60].map((m) => (
                        <SelectItem key={m} value={m.toString()} className="font-medium">
                          {m} Minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-5 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-center justify-between">
                <div className="flex gap-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest leading-none mb-1">
                      Online Booking Engine
                    </p>
                    <p className="text-[10px] text-blue-800 font-medium">
                      Allow patients to book appointments via web/app
                    </p>
                  </div>
                </div>
                <Switch
                  checked={form.allowsOnlineBooking}
                  onCheckedChange={(v) => setForm({ ...form, allowsOnlineBooking: v })}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Medical Council Registration No.
                </label>
                <Input
                  value={form.medicalCouncilRegNo}
                  onChange={(e) => setForm({ ...form, medicalCouncilRegNo: e.target.value })}
                  placeholder="e.g. MCI-12345"
                  className="rounded-xl h-12 border-slate-200 font-black uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Academic Qualification
                </label>
                <Input
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  placeholder="e.g. MBBS, MD (Cardiology)"
                  className="rounded-xl h-12 border-slate-200 font-bold"
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Department Affiliations
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {departments.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-white hover:border-blue-200 transition-all cursor-pointer"
                      onClick={() => toggleDept(d.id)}
                    >
                      <Checkbox
                        checked={form.deptIds.includes(d.id)}
                        onCheckedChange={() => toggleDept(d.id)}
                        className="rounded-md"
                      />
                      <span className="text-[11px] font-bold text-slate-700 truncate">
                        {d.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50/50 p-8 flex gap-3 border-t border-slate-100">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="h-14 rounded-2xl px-8 border-slate-200 font-bold text-slate-500"
            >
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={nextStep}
              className="flex-1 bg-slate-900 hover:bg-black text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-100"
            >
              Continue to {step === 1 ? 'Configuration' : 'Compliance'}{' '}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="h-5 w-5 mr-2" />
              )}
              Authorize & Register Specialist
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [docRes, branchRes, deptRes] = await Promise.all([
        fetch('/api/hospital/doctors'),
        fetch('/api/hospital/branches'),
        fetch('/api/hospital/departments'),
      ]);
      const [docData, branchData, deptData] = await Promise.all([
        docRes.json(),
        branchRes.json(),
        deptRes.json(),
      ]);
      setDoctors(docData.doctors ?? []);
      setBranches(branchData.branches ?? []);
      setDepartments(deptData.departments ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleStatus = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/hospital/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      fetchData();
      toast.success(`Practitioner ${!current ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.speciality.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900 rounded-[1.5rem] shadow-2xl shadow-slate-200">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Clinical Specialists
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Manage clinical staff, medical registration, and billing rates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 border-slate-200 bg-white rounded-2xl font-medium focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <Button
            onClick={() => {
              setEditDoctor(null);
              setWizardOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Recruit Doctor
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-48 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 opacity-20" />
          <p className="mt-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">
            Hydrating clinical registry...
          </p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center">
          <div className="p-8 bg-slate-50 rounded-full mb-6">
            <Stethoscope className="h-16 w-16 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Specialists Registered</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm font-medium">
            Initialize your clinical team to enable OPD bookings and IPD admissions.
          </p>
          <Button
            variant="outline"
            className="mt-8 rounded-xl h-12 px-6 border-slate-200 font-bold"
            onClick={() => setWizardOpen(true)}
          >
            Initialize Registry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden relative"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center font-black text-xl border-2 border-blue-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                      {doc.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 border-none font-black text-[9px] h-5 px-2 uppercase"
                        >
                          {doc.speciality}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                          {doc.experienceYears}+ YRS EXP
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Switch
                      checked={doc.isActive}
                      onCheckedChange={() => handleToggleStatus(doc.id, doc.isActive)}
                      className="data-[state=checked]:bg-blue-600 scale-90"
                    />
                    <Badge
                      className={`text-[8px] font-black px-1.5 h-4 border-none ${doc.registration?.number ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                    >
                      {doc.registration?.number ? 'VERIFIED' : 'REG PENDING'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-all duration-500">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Consultation
                    </span>
                    <span className="text-xl font-black text-slate-800 tracking-tighter">
                      ₹{doc.consultationFee}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-all duration-500">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Duration
                    </span>
                    <span className="text-xl font-black text-slate-800 tracking-tighter">
                      {doc.consultationDurationMins}m
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-2 uppercase text-[10px] tracking-widest font-black opacity-50">
                      <Building2 className="h-3.5 w-3.5" /> Deployments
                    </span>
                    <span className="text-slate-800">{doc.branchIds.length} Branches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.departments.length > 0 ? (
                      doc.departments.slice(0, 3).map((id) => {
                        const name = departments.find((d) => d.id === id)?.name;
                        return (
                          <Badge
                            key={id}
                            variant="outline"
                            className="text-[8px] font-bold border-slate-200 text-slate-400"
                          >
                            {name}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-[10px] italic text-slate-300">
                        No departments assigned
                      </span>
                    )}
                    {doc.departments.length > 3 && (
                      <Badge variant="outline" className="text-[8px] font-bold border-slate-200">
                        +{doc.departments.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Activity className="h-3.5 w-3.5 text-blue-600" /> Web Booking:{' '}
                  {doc.allowsOnlineBooking ? 'LIVE' : 'OFF'}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-md transition-all"
                    onClick={() => {
                      setEditDoctor(doc);
                      setWizardOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-12 bg-indigo-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl relative z-10">
          <h2 className="text-2xl font-black tracking-tight mb-4 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-blue-400" /> Verification Protocol
          </h2>
          <p className="text-indigo-200 font-medium leading-relaxed mb-8">
            Haspataal enforces medical registration verification (MCI/NMC) for all clinical
            specialists. Practitioners without a valid medical council number will be flagged for
            internal review and restricted from issuing digital prescriptions in compliance with
            local healthcare regulations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-indigo-900 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Global Sync</p>
                <p className="text-[10px] text-indigo-300 font-medium">
                  Shared registry across branches
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-indigo-900 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Smart Slots</p>
                <p className="text-[10px] text-indigo-300 font-medium">
                  Dynamic duration overrides
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-indigo-900 rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Compliance</p>
                <p className="text-[10px] text-indigo-300 font-medium">
                  Medical council sync enabled
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-16 opacity-5">
          <Activity className="h-64 w-64" />
        </div>
      </div>

      <DoctorWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={fetchData}
        editDoctor={editDoctor}
        branches={branches}
        departments={departments}
      />
    </div>
  );
}
