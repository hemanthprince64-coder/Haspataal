/* eslint-disable */
'use client';

import { Plus, Search, Trash2, UserPlus, Stethoscope, Loader2, UserCog } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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

type StaffRole =
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'BILLING'
  | 'PHARMACIST'
  | 'LAB_TECH'
  | 'HOSPITAL_ADMIN';

interface StaffMember {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  role: StaffRole;
  shift?: string;
  isActive: boolean;
  departmentId?: string;
  designation?: string;
  qualifications: string[];
  bloodGroup?: string;
  source: 'staff' | 'doctor';
  speciality?: string;
  experienceYears?: number;
  consultationFee?: number;
}

const ROLES: StaffRole[] = [
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'BILLING',
  'PHARMACIST',
  'LAB_TECH',
  'HOSPITAL_ADMIN',
];

const ROLE_COLORS: Record<string, string> = {
  DOCTOR: 'bg-blue-50 text-blue-700 border-blue-200',
  NURSE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RECEPTIONIST: 'bg-amber-50 text-amber-700 border-amber-200',
  BILLING: 'bg-purple-50 text-purple-700 border-purple-200',
  PHARMACIST: 'bg-rose-50 text-rose-700 border-rose-200',
  LAB_TECH: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  HOSPITAL_ADMIN: 'bg-slate-100 text-slate-700 border-slate-200',
};

const ROLE_LABELS: Record<string, string> = {
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  BILLING: 'Billing',
  PHARMACIST: 'Pharmacist',
  LAB_TECH: 'Lab Tech',
  HOSPITAL_ADMIN: 'Admin',
};

export default function StaffDashboardPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);

  const [staffForm, setStaffForm] = useState({
    name: '',
    mobile: '',
    email: '',
    role: 'RECEPTIONIST' as StaffRole,
    designation: '',
    qualifications: '',
    bloodGroup: '',
  });
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    mobile: '',
    email: '',
    speciality: 'General',
    experienceYears: 0,
    consultationFee: 500,
    consultationDurationMins: 15,
    allowsOnlineBooking: true,
    availableFrom: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, doctorsRes] = await Promise.all([
        fetch('/api/hospital/staff'),
        fetch('/api/hospital/doctors'),
      ]);
      const [staffData, doctorsData] = await Promise.all([staffRes.json(), doctorsRes.json()]);

      const staffList: StaffMember[] = (staffData.staff || []).map((s: any) => ({
        ...s,
        source: 'staff',
        speciality: undefined,
        experienceYears: undefined,
        consultationFee: undefined,
      }));

      const doctorList: StaffMember[] = (doctorsData.doctors || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        mobile: d.mobile,
        role: 'DOCTOR' as StaffRole,
        shift: undefined,
        isActive: d.isActive ?? true,
        designation: d.speciality,
        qualifications: [],
        source: 'doctor',
        speciality: d.speciality,
        experienceYears: d.experienceYears,
        consultationFee: d.consultationFee,
      }));

      setStaff([...staffList, ...doctorList]);
    } catch {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateStaff = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/hospital/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffForm.name,
          mobile: staffForm.mobile,
          email: staffForm.email || undefined,
          role: staffForm.role,
          designation: staffForm.designation || undefined,
          qualifications: staffForm.qualifications
            ? staffForm.qualifications
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          bloodGroup: staffForm.bloodGroup || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add staff');
      }
      toast.success('Staff member added');
      setStaffDialogOpen(false);
      setStaffForm({
        name: '',
        mobile: '',
        email: '',
        role: 'RECEPTIONIST',
        designation: '',
        qualifications: '',
        bloodGroup: '',
      });
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDoctor = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/hospital/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: doctorForm.name,
          mobile: doctorForm.mobile,
          email: doctorForm.email || undefined,
          speciality: doctorForm.speciality,
          experienceYears: doctorForm.experienceYears,
          consultationFee: doctorForm.consultationFee,
          consultationDurationMins: doctorForm.consultationDurationMins,
          allowsOnlineBooking: doctorForm.allowsOnlineBooking,
          availableFrom: doctorForm.availableFrom || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add doctor');
      }
      toast.success('Doctor added to team');
      setDoctorDialogOpen(false);
      setDoctorForm({
        name: '',
        mobile: '',
        email: '',
        speciality: 'General',
        experienceYears: 0,
        consultationFee: 500,
        consultationDurationMins: 15,
        allowsOnlineBooking: true,
        availableFrom: '',
      });
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStaff = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/hospital/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      toast.success('Updated');
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleRemoveStaff = async (id: string) => {
    try {
      const res = await fetch(`/api/hospital/staff/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setStaff(staff.filter((s) => s.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleRemoveDoctor = async () => {
    // Doctors are removed by deactivating their affiliation or we could have a dedicated endpoint
    // For now, we'll just remove from local list and show a toast
    toast.info('Doctor deactivation requires affiliation management');
  };

  const doctorCount = staff.filter((s) => s.role === 'DOCTOR').length;
  const activeCount = staff.filter((s) => s.isActive).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinical Workforce</h1>
          <p className="text-sm text-gray-500">
            {doctorCount} doctors · {activeCount} active members · {staff.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-lg border-gray-200">
                <UserPlus className="h-4 w-4 mr-2" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Staff Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Full Name *
                    </label>
                    <Input
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Mobile *
                    </label>
                    <Input
                      value={staffForm.mobile}
                      onChange={(e) => setStaffForm({ ...staffForm, mobile: e.target.value })}
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <Input
                      type="email"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      placeholder="email@hospital.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Role *</label>
                    <Select
                      value={staffForm.role}
                      onValueChange={(v: StaffRole) => setStaffForm({ ...staffForm, role: v })}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Designation
                    </label>
                    <Input
                      value={staffForm.designation}
                      onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                      placeholder="e.g. Senior Surgeon"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Blood Group
                    </label>
                    <Input
                      value={staffForm.bloodGroup}
                      onChange={(e) => setStaffForm({ ...staffForm, bloodGroup: e.target.value })}
                      placeholder="O+"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Qualifications (comma-separated)
                  </label>
                  <Input
                    value={staffForm.qualifications}
                    onChange={(e) => setStaffForm({ ...staffForm, qualifications: e.target.value })}
                    placeholder="MBBS, MD (General Medicine)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStaffDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateStaff}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Staff
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={doctorDialogOpen} onOpenChange={setDoctorDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Stethoscope className="h-4 w-4 mr-2" /> Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Doctor to Hospital</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Full Name *
                    </label>
                    <Input
                      value={doctorForm.name}
                      onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                      placeholder="Dr. Full Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Mobile *
                    </label>
                    <Input
                      value={doctorForm.mobile}
                      onChange={(e) => setDoctorForm({ ...doctorForm, mobile: e.target.value })}
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <Input
                      type="email"
                      value={doctorForm.email}
                      onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Speciality *
                    </label>
                    <Input
                      value={doctorForm.speciality}
                      onChange={(e) => setDoctorForm({ ...doctorForm, speciality: e.target.value })}
                      placeholder="e.g. Cardiology"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Experience (years)
                    </label>
                    <Input
                      type="number"
                      value={doctorForm.experienceYears}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          experienceYears: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Consultation Fee (₹)
                    </label>
                    <Input
                      type="number"
                      value={doctorForm.consultationFee}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          consultationFee: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Duration (mins)
                    </label>
                    <Input
                      type="number"
                      value={doctorForm.consultationDurationMins}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          consultationDurationMins: parseInt(e.target.value) || 15,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Available From
                    </label>
                    <Input
                      type="date"
                      value={doctorForm.availableFrom}
                      onChange={(e) =>
                        setDoctorForm({ ...doctorForm, availableFrom: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={doctorForm.allowsOnlineBooking}
                    onCheckedChange={(v: boolean) =>
                      setDoctorForm({ ...doctorForm, allowsOnlineBooking: v })
                    }
                  />
                  <span className="text-sm font-medium">Allow Online Booking</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDoctorDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDoctor}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Doctor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={roleFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            className={`rounded-lg text-xs font-semibold ${roleFilter === 'ALL' ? 'bg-gray-900 text-white' : 'border-gray-200'}`}
            onClick={() => setRoleFilter('ALL')}
          >
            All
          </Button>
          {ROLES.map((r) => (
            <Button
              key={r}
              variant={roleFilter === r ? 'default' : 'outline'}
              size="sm"
              className={`rounded-lg text-xs font-semibold ${roleFilter === r ? 'bg-gray-900 text-white' : 'border-gray-200'}`}
              onClick={() => setRoleFilter(r)}
            >
              {ROLE_LABELS[r]}
            </Button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search name, mobile, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-lg border-gray-200 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Member
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Designation
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Loading team...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No members found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${m.role === 'DOCTOR' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {m.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{m.name}</p>
                        {m.source === 'doctor' && m.speciality && (
                          <p className="text-xs text-gray-400">
                            {m.speciality} · {m.experienceYears ?? 0} yrs
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-600">{m.mobile}</div>
                    {m.email && <div className="text-xs text-gray-400">{m.email}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`border text-[10px] font-bold uppercase ${ROLE_COLORS[m.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                    >
                      {ROLE_LABELS[m.role] || m.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {m.designation || m.speciality || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Switch
                      checked={m.isActive}
                      onCheckedChange={(v: boolean) => handleUpdateStaff(m.id, { isActive: v })}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => handleUpdateStaff(m.id, {})}
                      >
                        <UserCog className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600"
                        onClick={() =>
                          m.source === 'staff' ? handleRemoveStaff(m.id) : handleRemoveDoctor()
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
