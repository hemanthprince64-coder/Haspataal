"use client";

import { useState, useEffect } from "react";
import { 
  Users, Shield, Calendar, Plus, Search, Mail, 
  ChevronDown, Check, X, Loader2, Trash2, Pencil,
  Clock, AlertCircle, UserPlus, ShieldCheck, UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffRole = "DOCTOR" | "NURSE" | "RECEPTIONIST" | "BILLING" | "PHARMACIST" | "LAB_TECH" | "HOSPITAL_ADMIN" | "SUPER_ADMIN";
type ShiftType = "MORNING" | "EVENING" | "NIGHT" | "ROTATIONAL";

interface StaffMember {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  role: StaffRole;
  shift?: ShiftType;
  isActive: boolean;
  departmentId?: string;
}

interface StaffInvite {
  id: string;
  email: string;
  role: StaffRole;
  createdAt: string;
  expiresAt: string;
}

type ModuleName = "OPD" | "IPD" | "Billing" | "Pharmacy" | "Diagnostics" | "Reports" | "Settings" | "Analytics";
type PermLevel = "NONE" | "VIEW" | "EDIT" | "FULL";

const ROLES: StaffRole[] = ["DOCTOR", "NURSE", "RECEPTIONIST", "BILLING", "PHARMACIST", "LAB_TECH", "HOSPITAL_ADMIN", "SUPER_ADMIN"];
const MODULES: ModuleName[] = ["OPD", "IPD", "Billing", "Pharmacy", "Diagnostics", "Reports", "Settings", "Analytics"];
const PERM_LEVELS: PermLevel[] = ["NONE", "VIEW", "EDIT", "FULL"];
const SHIFTS: ShiftType[] = ["MORNING", "EVENING", "NIGHT", "ROTATIONAL"];

const PERM_COLORS: Record<PermLevel, string> = {
  NONE: "bg-slate-100 text-slate-500",
  VIEW: "bg-blue-100 text-blue-700",
  EDIT: "bg-yellow-100 text-yellow-700",
  FULL: "bg-green-100 text-green-700",
};

const PERM_TEMPLATES: Record<string, Record<ModuleName, PermLevel>> = {
  "Doctor Template": { OPD: "EDIT", IPD: "EDIT", Billing: "VIEW", Pharmacy: "VIEW", Diagnostics: "EDIT", Reports: "VIEW", Settings: "NONE", Analytics: "VIEW" },
  "Nurse Template": { OPD: "VIEW", IPD: "EDIT", Billing: "NONE", Pharmacy: "VIEW", Diagnostics: "VIEW", Reports: "VIEW", Settings: "NONE", Analytics: "NONE" },
  "Receptionist Template": { OPD: "FULL", IPD: "VIEW", Billing: "EDIT", Pharmacy: "NONE", Diagnostics: "NONE", Reports: "VIEW", Settings: "NONE", Analytics: "VIEW" },
  "Admin Template": { OPD: "FULL", IPD: "FULL", Billing: "FULL", Pharmacy: "FULL", Diagnostics: "FULL", Reports: "FULL", Settings: "FULL", Analytics: "FULL" },
};

const ROLE_LABELS: Record<StaffRole, string> = {
  DOCTOR: "Doctor", NURSE: "Nurse", RECEPTIONIST: "Receptionist",
  BILLING: "Billing", PHARMACIST: "Pharmacist", LAB_TECH: "Lab Tech",
  HOSPITAL_ADMIN: "Hospital Admin", SUPER_ADMIN: "Super Admin",
};

// ─── Invite Dialog ────────────────────────────────────────────────────────────

function InviteDialog({ open, onClose, onInviteSent }: { open: boolean; onClose: () => void; onInviteSent: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("RECEPTIONIST");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setSending(true);
    try {
      await fetch("/api/hospital/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      setSent(true);
      onInviteSent();
      setTimeout(() => { setSent(false); onClose(); setEmail(""); }, 1500);
    } catch {}
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Invite Staff Member
          </DialogTitle>
          <DialogDescription className="text-xs">
            Send an invitation link to the staff member's email.
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-10 text-emerald-600 justify-center text-center">
            <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <div className="font-bold">Invitation Sent!</div>
            <p className="text-xs text-slate-500">They can now join using the link in their email.</p>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Email Address</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="staff@hospital.com" 
                className="rounded-xl border-slate-200 h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Assigned Role</label>
              <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="rounded-lg">
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
               <Shield className="h-5 w-5 text-blue-600 shrink-0" />
               <p className="text-[11px] text-blue-800 leading-relaxed">
                 Roles define default permissions. You can customize these in the <strong>Roles & Permissions</strong> tab.
               </p>
            </div>
          </div>
        )}
        {!sent && (
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSend} disabled={!email || sending} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-11 px-6 shadow-md shadow-blue-100">
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Invitation
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Staff Dialog ────────────────────────────────────────────────────────

function EditStaffDialog({ 
  member, 
  open, 
  onClose, 
  onSave 
}: { 
  member: StaffMember | null; 
  open: boolean; 
  onClose: () => void; 
  onSave: (id: string, updates: any) => void;
}) {
  const [role, setRole] = useState<StaffRole>("RECEPTIONIST");
  const [shift, setShift] = useState<ShiftType | "NONE">("NONE");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setRole(member.role);
      setShift(member.shift || "NONE");
    }
  }, [member]);

  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    await onSave(member.id, { role, shift: shift === "NONE" ? null : shift });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserCog className="h-5 w-5 text-slate-700" />
            Edit Staff Member
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update role and shift for {member?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Staff Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
              <SelectTrigger className="rounded-xl h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="rounded-lg">{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Work Shift</label>
            <Select value={shift} onValueChange={(v) => setShift(v as any)}>
              <SelectTrigger className="rounded-xl h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="NONE" className="rounded-lg text-slate-400 italic">No specific shift</SelectItem>
                {SHIFTS.map((s) => (
                  <SelectItem key={s} value={s} className="rounded-lg">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800 rounded-xl h-11 px-6">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Save Changes
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
  const [search, setSearch] = useState("");
  
  // Dialog States
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  
  // Permissions State
  const [perms, setPerms] = useState<Record<StaffRole, Record<ModuleName, PermLevel>>>(() => {
    const init: Partial<Record<StaffRole, Record<ModuleName, PermLevel>>> = {};
    for (const role of ROLES) {
      init[role] = {} as Record<ModuleName, PermLevel>;
      for (const mod of MODULES) (init[role] as any)[mod] = "NONE";
    }
    return init as Record<StaffRole, Record<ModuleName, PermLevel>>;
  });
  const [permsLoading, setPermsLoading] = useState(true);
  const [savingPerms, setSavingPerms] = useState(false);
  const [savedPerms, setSavedPerms] = useState(false);

  const fetchData = async () => {
    try {
      const [staffRes, invitesRes, permsRes] = await Promise.all([
        fetch("/api/hospital/staff"),
        fetch("/api/hospital/staff/invites"),
        fetch("/api/hospital/staff/permissions")
      ]);
      
      const [staffData, invitesData, permsData] = await Promise.all([
        staffRes.json(),
        invitesRes.json(),
        permsRes.json()
      ]);

      setStaff(staffData.staff ?? []);
      setInvites(invitesData.invites ?? []);
      
      if (permsData.permissions) {
        const newPerms = { ...perms };
        permsData.permissions.forEach((p: any) => {
          if (p.roleName && ROLES.includes(p.roleName as StaffRole)) {
            newPerms[p.roleName as StaffRole] = p.permissions;
          }
        });
        setPerms(newPerms);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setPermsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateStaff = async (id: string, updates: any) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    await fetch(`/api/hospital/staff/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    fetchData(); // Refresh to be safe
  };

  const handleCancelInvite = async (id: string) => {
    setInvites(prev => prev.filter(i => i.id !== id));
    await fetch("/api/hospital/staff/invites", {
      method: "DELETE",
      body: JSON.stringify({ id })
    });
  };

  const savePermissions = async () => {
    setSavingPerms(true);
    await fetch("/api/hospital/staff/permissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: perms }),
    });
    setSavingPerms(false);
    setSavedPerms(true);
    setTimeout(() => setSavedPerms(false), 2000);
  };

  const cyclePermission = (role: StaffRole, mod: ModuleName) => {
    const current = perms[role][mod];
    const idx = PERM_LEVELS.indexOf(current);
    const next = PERM_LEVELS[(idx + 1) % PERM_LEVELS.length];
    setPerms((p) => ({ ...p, [role]: { ...p[role], [mod]: next } }));
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            Staff & Access Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your medical team, shifts, and security roles</p>
        </div>
        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 rounded-xl h-11 px-6" 
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" /> Invite New Staff
        </Button>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <TabsList className="bg-slate-100 p-1 border-none">
            <TabsTrigger value="members" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 px-6 font-bold text-xs">
              <Users className="h-4 w-4 mr-2" /> Team Members
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 px-6 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 mr-2" /> Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="shifts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 px-6 font-bold text-xs">
              <Clock className="h-4 w-4 mr-2" /> Shift Roster
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Quick search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs border-slate-200 bg-slate-50 focus:bg-white rounded-lg" 
            />
          </div>
        </div>

        <TabsContent value="members" className="mt-0 outline-none">
          <div className="grid grid-cols-12 gap-6">
            {/* Active Staff Table */}
            <div className="col-span-12 lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registered Staff</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold border-none">{staff.length} Active</Badge>
              </div>
              
              {loading ? (
                <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></div>
              ) : staff.length === 0 ? (
                <div className="py-20 text-center opacity-40">
                   <Users className="h-12 w-12 mx-auto mb-4" />
                   <p className="font-bold">No registered staff yet</p>
                   <p className="text-xs">Invite your team to get started</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Identity</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Role & Access</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Shift</th>
                      <th className="px-6 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStaff.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 group transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs uppercase">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800">{s.name}</div>
                              <div className="text-[11px] text-slate-500">{s.email || s.mobile}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <Badge variant="outline" className="rounded-lg text-[10px] bg-white font-bold border-slate-200">
                             {ROLE_LABELS[s.role]}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                          {s.shift || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                             <Switch 
                               checked={s.isActive} 
                               onCheckedChange={(v) => handleUpdateStaff(s.id, { isActive: v })} 
                             />
                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditMember(s)}>
                               <Pencil className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                             </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Sidebar: Invites & Stats */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Invites</span>
                  {invites.length > 0 && <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />}
                </div>
                <div className="p-4 space-y-3">
                  {invites.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-4 italic">No pending invitations</p>
                  ) : invites.map(inv => (
                    <div key={inv.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group relative">
                      <div className="text-[12px] font-bold text-slate-800 truncate mb-1">{inv.email}</div>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-amber-100 text-amber-700 border-none text-[9px] font-black h-4">
                          {ROLE_LABELS[inv.role]}
                        </Badge>
                        <button 
                          onClick={() => handleCancelInvite(inv.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Quick Tip */}
              <div className="bg-indigo-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold flex items-center gap-2 mb-2"><ShieldCheck className="h-4 w-4" /> Pro Tip</h3>
                  <p className="text-[11px] opacity-90 leading-relaxed font-medium">
                    Use <strong>Permission Templates</strong> in the next tab to quickly configure complex RBAC roles like Doctors and Receptionists in one click.
                  </p>
                </div>
                <div className="absolute top-0 right-0 p-6 opacity-10"><Shield className="h-24 w-24" /></div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="mt-0 outline-none">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">RBAC Configuration</h3>
                  <p className="text-[11px] text-slate-500">Define what each professional role can see and do</p>
                </div>
                <Button 
                  size="sm" 
                  disabled={savingPerms || permsLoading} 
                  onClick={savePermissions}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                >
                  {savingPerms ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Check className="h-3.5 w-3.5 mr-2" />}
                  {savedPerms ? "Permissions Saved" : "Save Settings"}
                </Button>
              </div>

              {permsLoading ? (
                <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-wide text-[10px] sticky left-0 bg-slate-50 w-32 border-r border-slate-100">Role</th>
                        {MODULES.map(m => (
                          <th key={m} className="px-4 py-4 text-center font-black text-slate-400 uppercase tracking-wide text-[10px]">{m}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {ROLES.map(role => (
                        <tr key={role} className="hover:bg-slate-50/50 group">
                          <td className="px-6 py-4 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-50 group-hover:bg-slate-50">{ROLE_LABELS[role]}</td>
                          {MODULES.map(mod => {
                            const level = perms[role][mod];
                            return (
                              <td key={mod} className="px-4 py-4 text-center">
                                <button
                                  onClick={() => cyclePermission(role, mod)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all hover:scale-105 border shadow-sm ${PERM_COLORS[level]}`}
                                >
                                  {level}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Apply Presets:</span>
                <div className="flex gap-2">
                  {Object.keys(PERM_TEMPLATES).map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        const roleMap: any = { "Doctor Template": "DOCTOR", "Nurse Template": "NURSE", "Receptionist Template": "RECEPTIONIST", "Admin Template": "HOSPITAL_ADMIN" };
                        const role = roleMap[t];
                        if (role) setPerms(p => ({ ...p, [role]: PERM_TEMPLATES[t] }));
                      }}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="shifts" className="mt-0 outline-none">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
               <h3 className="font-bold text-slate-800">Weekly Shift Roster</h3>
               <p className="text-[11px] text-slate-500">Monitor staff availability across the clinical week</p>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-xs">
                 <thead className="bg-slate-50 border-b border-slate-100">
                   <tr>
                     <th className="px-6 py-3 text-left font-bold text-slate-400 text-[10px] uppercase sticky left-0 bg-slate-50 border-r border-slate-100">Team Member</th>
                     {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                       <th key={d} className="px-4 py-3 text-center font-bold text-slate-400 text-[10px] uppercase">{d}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {staff.length === 0 ? (
                     <tr><td colSpan={8} className="text-center py-20 text-xs text-slate-400 italic">No staff available for scheduling</td></tr>
                   ) : staff.map(s => (
                     <tr key={s.id} className="hover:bg-slate-50/50">
                       <td className="px-6 py-4 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-50">{s.name}</td>
                       {[1,2,3,4,5,6,7].map(d => (
                         <td key={d} className="px-4 py-4 text-center">
                           {s.shift ? (
                             <Badge className={`rounded-md text-[9px] font-black border-none px-2
                               ${s.shift === 'MORNING' ? 'bg-yellow-100 text-yellow-800' : 
                                 s.shift === 'EVENING' ? 'bg-orange-100 text-orange-800' : 
                                 s.shift === 'NIGHT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}
                             >
                               {s.shift.charAt(0)}
                             </Badge>
                           ) : <span className="text-slate-200">—</span>}
                         </td>
                       ))}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </TabsContent>
      </Tabs>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInviteSent={fetchData} />
      <EditStaffDialog member={editMember} open={!!editMember} onClose={() => setEditMember(null)} onSave={handleUpdateStaff} />
    </div>
  );
}
