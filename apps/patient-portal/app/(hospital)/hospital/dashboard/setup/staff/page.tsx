/* eslint-disable */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Shield,
  Calendar,
  Plus,
  Search,
  Mail,
  ChevronDown,
  Check,
  X,
  Loader2,
  Trash2,
  Pencil,
  Clock,
  AlertCircle,
  UserPlus,
  ShieldCheck,
  UserCog,
  ShieldAlert,
  FileText,
  Smartphone,
  GraduationCap,
  Droplet,
  Clock3,
  ExternalLink,
  Timer,
  MoreVertical,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffRole =
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'BILLING'
  | 'PHARMACIST'
  | 'LAB_TECH'
  | 'HOSPITAL_ADMIN'
  | 'SUPER_ADMIN';
type ShiftType = 'MORNING' | 'EVENING' | 'NIGHT' | 'ROTATIONAL';

interface StaffMember {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  role: StaffRole;
  shift?: ShiftType;
  isActive: boolean;
  departmentId?: string;
  designation?: string;
  qualifications: string[];
  bloodGroup?: string;
}

interface StaffInvite {
  id: string;
  email: string;
  role: StaffRole;
  createdAt: string;
  expiresAt: string;
}

type ModuleName =
  | 'OPD'
  | 'IPD'
  | 'Billing'
  | 'Pharmacy'
  | 'Diagnostics'
  | 'Reports'
  | 'Settings'
  | 'Analytics';
type PermLevel = 'NONE' | 'VIEW' | 'EDIT' | 'FULL';

const ROLES: StaffRole[] = [
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'BILLING',
  'PHARMACIST',
  'LAB_TECH',
  'HOSPITAL_ADMIN',
  'SUPER_ADMIN',
];
const MODULES: ModuleName[] = [
  'OPD',
  'IPD',
  'Billing',
  'Pharmacy',
  'Diagnostics',
  'Reports',
  'Settings',
  'Analytics',
];
const PERM_LEVELS: PermLevel[] = ['NONE', 'VIEW', 'EDIT', 'FULL'];
const SHIFTS: ShiftType[] = ['MORNING', 'EVENING', 'NIGHT', 'ROTATIONAL'];

const PERM_COLORS: Record<PermLevel, string> = {
  NONE: 'bg-slate-100 text-slate-400 border-slate-200',
  VIEW: 'bg-blue-50 text-blue-600 border-blue-200',
  EDIT: 'bg-amber-50 text-amber-700 border-amber-200',
  FULL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const ROLE_LABELS: Record<StaffRole, string> = {
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  BILLING: 'Billing',
  PHARMACIST: 'Pharmacist',
  LAB_TECH: 'Lab Tech',
  HOSPITAL_ADMIN: 'Hospital Admin',
  SUPER_ADMIN: 'Super Admin',
};

// ─── Invite Dialog ────────────────────────────────────────────────────────────

function InviteDialog({
  open,
  onClose,
  onInviteSent,
}: {
  open: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('RECEPTIONIST');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setSending(true);
    try {
      const res = await fetch('/api/hospital/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send invite');
      }
      toast.success('Invitation sent successfully');
      onInviteSent();
      onClose();
      setEmail('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            Recruit Team
          </DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Authorized staff will receive a secure onboarding link.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Official Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff.name@hospital.com"
              className="rounded-xl border-slate-200 h-12 font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Assigned Role Profile
            </label>
            <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
              <SelectTrigger className="rounded-xl h-12 border-slate-200 font-bold">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="rounded-lg font-medium">
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
            <Shield className="h-6 w-6 text-blue-600 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Access levels for <strong>{ROLE_LABELS[role]}</strong> can be fine-tuned globally in
              the Permissions tab after they join.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSend}
            disabled={!email || sending}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Mail className="h-5 w-5 mr-2" />
            )}
            Dispatch Secure Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Staff Dialog ────────────────────────────────────────────────────────

function EditStaffDialog({
  member,
  open,
  onClose,
  onSave,
}: {
  member: StaffMember | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: any) => void;
}) {
  const [form, setForm] = useState<any>({
    name: '',
    role: 'RECEPTIONIST',
    shift: 'MORNING',
    mobile: '',
    designation: '',
    qualifications: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name,
        role: member.role,
        shift: member.shift || 'MORNING',
        mobile: member.mobile || '',
        designation: member.designation || '',
        qualifications: member.qualifications || [],
        bloodGroup: member.bloodGroup || '',
      });
    }
  }, [member]);

  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    await onSave(member.id, form);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <UserCog className="h-6 w-6 text-slate-700" />
            Staff Profile Update
          </DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Manage credentials and operational details for {member?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl h-11 border-slate-200 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Mobile
              </label>
              <Input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="rounded-xl h-11 border-slate-200 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Clinical Role
              </label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as StaffRole })}
              >
                <SelectTrigger className="rounded-xl h-11 border-slate-200 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="rounded-lg font-medium">
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Assigned Shift
              </label>
              <Select
                value={form.shift}
                onValueChange={(v) => setForm({ ...form, shift: v as any })}
              >
                <SelectTrigger className="rounded-xl h-11 border-slate-200 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {SHIFTS.map((s) => (
                    <SelectItem key={s} value={s} className="rounded-lg font-medium">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Designation
              </label>
              <Input
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g. Senior Surgeon"
                className="rounded-xl h-11 border-slate-200 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Blood Group
              </label>
              <Input
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                placeholder="O+"
                className="rounded-xl h-11 border-slate-200 font-black uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Academic Qualifications
            </label>
            <Input
              value={form.qualifications.join(', ')}
              onChange={(e) =>
                setForm({
                  ...form,
                  qualifications: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="MBBS, MD (General Medicine)"
              className="rounded-xl h-11 border-slate-200 font-bold"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-black rounded-2xl h-14 font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-100"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Check className="h-5 w-5 mr-2" />
            )}
            Sync Staff Metadata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invites, setInvites] = useState<StaffInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog States
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);

  // Permissions State
  const [perms, setPerms] = useState<Record<string, any>>({});
  const [permsLoading, setPermsLoading] = useState(true);
  const [savingPerms, setSavingPerms] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [staffRes, invitesRes, permsRes] = await Promise.all([
        fetch('/api/hospital/staff'),
        fetch('/api/hospital/staff/invites'),
        fetch('/api/hospital/staff/permissions'),
      ]);

      const [staffData, invitesData, permsData] = await Promise.all([
        staffRes.json(),
        invitesRes.json(),
        permsRes.json(),
      ]);

      setStaff(staffData.staff ?? []);
      setInvites(invitesData.invites ?? []);

      const pMap: Record<string, any> = {};
      (permsData.permissions || []).forEach((p: any) => {
        pMap[p.roleName] = p.permissions;
      });
      setPerms(pMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setPermsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStaff = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/hospital/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      toast.success('Staff profile synced');
      fetchData();
    } catch {
      toast.error('Failed to update staff');
    }
  };

  const handleCancelInvite = async (id: string) => {
    if (!confirm('Revoke this invitation?')) return;
    try {
      await fetch('/api/hospital/staff/invites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      toast.success('Invitation revoked');
      fetchData();
    } catch {
      toast.error('Failed to revoke invite');
    }
  };

  const savePermissions = async (roleName: string, rolePerms: any) => {
    setSavingPerms(true);
    try {
      await fetch('/api/hospital/staff/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: { [roleName]: rolePerms } }),
      });
      toast.success(`${ROLE_LABELS[roleName as StaffRole]} permissions updated`);
    } catch {
      toast.error('Failed to save permissions');
    } finally {
      setSavingPerms(false);
    }
  };

  const cyclePermission = (role: string, mod: ModuleName) => {
    const rolePerms = perms[role] || {};
    const current = rolePerms[mod] || 'NONE';
    const idx = PERM_LEVELS.indexOf(current as PermLevel);
    const next = PERM_LEVELS[(idx + 1) % PERM_LEVELS.length];

    const newRolePerms = { ...rolePerms, [mod]: next };
    setPerms((prev) => ({ ...prev, [role]: newRolePerms }));
    // We don't auto-save to avoid too many requests
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.designation?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Workforce</h1>
            <p className="text-sm text-slate-500 font-medium">
              Coordinate your team, credentials, and access protocols
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 rounded-2xl h-12 px-8 font-black uppercase text-xs tracking-widest"
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" /> Recuit Staff
        </Button>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <TabsList className="bg-slate-100 p-1.5 border-none h-12 rounded-xl">
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-2 px-8 font-black text-[10px] uppercase tracking-wider"
            >
              <Users className="h-4 w-4 mr-2" /> Team Roster
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-2 px-8 font-black text-[10px] uppercase tracking-wider"
            >
              <ShieldCheck className="h-4 w-4 mr-2" /> Security RBAC
            </TabsTrigger>
            <TabsTrigger
              value="shifts"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-2 px-8 font-black text-[10px] uppercase tracking-wider"
            >
              <Clock3 className="h-4 w-4 mr-2" /> Ops Roster
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, role or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 text-sm border-slate-100 bg-slate-50 focus:bg-white rounded-xl font-medium"
            />
          </div>
        </div>

        <TabsContent value="members" className="mt-0 outline-none">
          <div className="grid grid-cols-12 gap-8">
            {/* Active Staff Table */}
            <div className="col-span-12 lg:col-span-9 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 tracking-tight">Onboarded Specialists</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Registered professionals with active system access
                  </p>
                </div>
                <Badge className="bg-blue-600 text-white font-black text-[10px] h-6 px-3 border-none rounded-lg">
                  {staff.length} Active Members
                </Badge>
              </div>

              {loading ? (
                <div className="py-32 text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
                </div>
              ) : staff.length === 0 ? (
                <div className="py-32 text-center opacity-30">
                  <div className="p-6 bg-slate-50 rounded-full inline-block mb-4">
                    <Users className="h-12 w-12" />
                  </div>
                  <p className="font-black uppercase text-sm tracking-widest">Workspace is empty</p>
                  <p className="text-xs font-medium mt-1">
                    Start by recruiting your first clinical lead
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Professional Identity
                        </th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Clinical Designation
                        </th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Deployment
                        </th>
                        <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Sync
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredStaff.map((s) => (
                        <tr key={s.id} className="hover:bg-blue-50/20 group transition-all">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm border border-blue-100 shadow-sm uppercase group-hover:scale-105 transition-transform">
                                {s.name.substring(0, 2)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-800 tracking-tight">
                                  {s.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-0.5">
                                  <Mail className="h-3 w-3" /> {s.email || 'No email'}
                                  <span className="opacity-40">•</span>
                                  <Smartphone className="h-3 w-3" /> {s.mobile || 'No mobile'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1">
                              <div className="text-xs font-black text-slate-700 uppercase tracking-tight">
                                {s.designation || 'General Practitioner'}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <GraduationCap className="h-3 w-3 text-slate-300" />
                                <span className="text-[9px] text-slate-400 font-bold">
                                  {s.qualifications.join(', ') || 'Qualifications Pending'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className="w-fit rounded-lg text-[10px] bg-white font-black border-slate-200 uppercase tracking-tighter"
                              >
                                {ROLE_LABELS[s.role]}
                              </Badge>
                              <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                                <Clock3 className="h-2.5 w-2.5" /> {s.shift || 'ROTATIONAL'}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-center gap-3">
                              <Switch
                                checked={s.isActive}
                                onCheckedChange={(v) => handleUpdateStaff(s.id, { isActive: v })}
                                className="data-[state=checked]:bg-blue-600"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl hover:bg-slate-100 transition-colors"
                                onClick={() => setEditMember(s)}
                              >
                                <UserCog className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sidebar: Invites & Stats */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-8">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Active Invites
                  </span>
                  {invites.length > 0 && (
                    <Badge className="bg-amber-500 text-white text-[9px] h-5 border-none font-black">
                      {invites.length}
                    </Badge>
                  )}
                </div>
                <div className="p-5 space-y-4">
                  {invites.length === 0 ? (
                    <div className="text-center py-8">
                      <Timer className="h-8 w-8 mx-auto text-slate-200 mb-2" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                        Queue is empty
                      </p>
                    </div>
                  ) : (
                    invites.map((inv) => {
                      const daysLeft = Math.ceil(
                        (new Date(inv.expiresAt).getTime() - new Date().getTime()) /
                          (1000 * 3600 * 24),
                      );
                      return (
                        <div
                          key={inv.id}
                          className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative hover:border-amber-200 transition-all"
                        >
                          <div className="text-[11px] font-black text-slate-800 truncate mb-1.5 uppercase tracking-tight">
                            {inv.email}
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <Badge className="bg-white text-slate-600 border-slate-200 text-[8px] font-black h-4 px-1.5 uppercase">
                              {ROLE_LABELS[inv.role]}
                            </Badge>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                              <Timer className="h-2.5 w-2.5" /> {daysLeft}D EXPIRY
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => handleCancelInvite(inv.id)}
                            className="w-full h-8 text-[9px] font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg uppercase tracking-widest"
                          >
                            Revoke Access
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Security Banner */}
              <div className="bg-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-black flex items-center gap-2 mb-4 text-blue-400 uppercase text-[10px] tracking-widest">
                    <ShieldCheck className="h-5 w-5" /> Access Protocol
                  </h3>
                  <p className="text-[11px] opacity-80 leading-relaxed font-medium">
                    All staff invitations enforce a 7-day acceptance window. Unclaimed slots are
                    automatically purged for system security.
                  </p>
                  <Button
                    variant="link"
                    className="text-blue-400 p-0 text-[10px] font-black uppercase tracking-widest mt-4 h-auto hover:text-white transition-colors"
                  >
                    View Security Logs <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </div>
                <div className="absolute -bottom-4 -right-4 p-6 opacity-10">
                  <Shield className="h-32 w-32" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="mt-0 outline-none">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Permission Matrix
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Configure module-level access for clinical and admin roles
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100">
                {PERM_LEVELS.map((lvl) => (
                  <div key={lvl} className="flex items-center gap-2 px-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${statusDot[lvl] || 'bg-slate-300'}`}
                    />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {lvl}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {permsLoading ? (
              <div className="py-32 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[10px] sticky left-0 bg-slate-50 w-48 border-r border-slate-100 shadow-sm z-10">
                        Clinical Role
                      </th>
                      {MODULES.map((m) => (
                        <th
                          key={m}
                          className="px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]"
                        >
                          {m}
                        </th>
                      ))}
                      <th className="px-8 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ROLES.map((role) => (
                      <tr key={role} className="hover:bg-blue-50/10 group">
                        <td className="px-10 py-6 font-black text-slate-700 sticky left-0 bg-white border-r border-slate-50 group-hover:bg-slate-50 shadow-sm z-10 text-xs uppercase tracking-tighter">
                          {ROLE_LABELS[role]}
                        </td>
                        {MODULES.map((mod) => {
                          const level = (perms[role] || {})[mod] || 'NONE';
                          return (
                            <td key={mod} className="px-6 py-6 text-center">
                              <button
                                onClick={() => cyclePermission(role, mod)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all hover:scale-110 border shadow-sm uppercase tracking-widest ${PERM_COLORS[level as PermLevel]}`}
                              >
                                {level}
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-8 py-6 text-center">
                          <Button
                            size="sm"
                            onClick={() => savePermissions(role, perms[role])}
                            disabled={savingPerms}
                            className="h-9 px-4 bg-slate-900 hover:bg-black rounded-xl text-[9px] font-black uppercase tracking-widest"
                          >
                            {savingPerms ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Save
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-4 w-4 text-blue-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Protocol Tip:
                </span>
                <p className="text-[11px] text-slate-600 font-medium">
                  Click on any permission badge to cycle through access levels. Don't forget to sync
                  changes per role.
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100"
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shifts" className="mt-0 outline-none">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Duty Roster Visualization
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Weekly operational distribution of clinical workforce
                </p>
              </div>
              <div className="flex items-center gap-2">
                {SHIFTS.map((s) => (
                  <Badge
                    key={s}
                    className={`rounded-xl text-[9px] font-black border-none px-3 py-1.5 uppercase tracking-widest
                     ${
                       s === 'MORNING'
                         ? 'bg-yellow-100 text-yellow-700'
                         : s === 'EVENING'
                           ? 'bg-orange-100 text-orange-700'
                           : s === 'NIGHT'
                             ? 'bg-blue-100 text-blue-700'
                             : 'bg-purple-100 text-purple-700'
                     }`}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-5 text-left font-black text-slate-400 text-[10px] uppercase tracking-widest sticky left-0 bg-slate-50 border-r border-slate-100 shadow-sm z-10 w-48">
                      Specialist
                    </th>
                    {[
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                      'Sunday',
                    ].map((d) => (
                      <th
                        key={d}
                        className="px-6 py-5 text-center font-black text-slate-400 text-[10px] uppercase tracking-widest"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-32 text-xs text-slate-400 italic font-medium"
                      >
                        Recruit staff to generate shift visualization
                      </td>
                    </tr>
                  ) : (
                    staff.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-50/10 transition-colors">
                        <td className="px-10 py-6 font-bold text-slate-800 sticky left-0 bg-white border-r border-slate-50 shadow-sm z-10 text-xs tracking-tight">
                          {s.name}
                          <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1">
                            {s.designation || ROLE_LABELS[s.role]}
                          </div>
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <td key={d} className="px-6 py-6 text-center">
                            {s.shift ? (
                              <div
                                className={`h-10 w-10 mx-auto rounded-2xl flex items-center justify-center font-black text-[10px] shadow-sm transition-all hover:scale-110 cursor-pointer
                               ${
                                 s.shift === 'MORNING'
                                   ? 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                                   : s.shift === 'EVENING'
                                     ? 'bg-orange-50 text-orange-600 border border-orange-100'
                                     : s.shift === 'NIGHT'
                                       ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                       : 'bg-purple-50 text-purple-600 border border-purple-100'
                               }`}
                              >
                                {s.shift.charAt(0)}
                              </div>
                            ) : (
                              <div className="h-10 w-10 mx-auto rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center">
                                <div className="h-1.5 w-1.5 bg-slate-100 rounded-full" />
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100 max-w-lg">
                <h4 className="text-sm font-bold text-slate-800 flex items-center justify-center gap-2 mb-2">
                  <LayoutGrid className="h-4 w-4 text-blue-600" /> Granular Scheduling Coming Soon
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  We are working on per-day shift overrides and vacation management. Currently, the
                  roster reflects the staff member's primary assigned shift.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInviteSent={fetchData}
      />
      <EditStaffDialog
        member={editMember}
        open={!!editMember}
        onClose={() => setEditMember(null)}
        onSave={handleUpdateStaff}
      />
    </div>
  );
}

const statusDot: Record<string, string> = {
  NONE: 'bg-slate-300',
  VIEW: 'bg-blue-500',
  EDIT: 'bg-amber-500',
  FULL: 'bg-emerald-500',
};
