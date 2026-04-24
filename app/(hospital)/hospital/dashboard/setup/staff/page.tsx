"use client";

import { useState, useEffect } from "react";
import { Users, Shield, Calendar, Plus, Search, Mail, ChevronDown, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  flexRender, type ColumnDef,
} from "@tanstack/react-table";

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

// Default permission templates
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

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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
      setTimeout(() => { setSent(false); onClose(); setEmail(""); }, 1500);
    } catch {}
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="flex items-center gap-2 py-4 text-green-600 justify-center">
            <Check className="h-5 w-5" /> Invite sent!
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@hospital.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
              >
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
          </div>
        )}
        {!sent && (
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleSend} disabled={!email || sending}>
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Mail className="h-3.5 w-3.5 mr-1" />}
              Send Invite
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Staff Members ────────────────────────────────────────────────────────

function StaffTab({ staff, onToggle }: { staff: StaffMember[]; onToggle: (id: string, active: boolean) => void }) {
  const [filter, setFilter] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const columns: ColumnDef<StaffMember>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">{row.original.name}</div>
          <div className="text-[10px] text-slate-400">{row.original.email ?? row.original.mobile}</div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px]">{ROLE_LABELS[row.original.role]}</Badge>
      ),
    },
    {
      accessorKey: "shift",
      header: "Shift",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.original.shift ?? "—"}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={(v) => onToggle(row.original.id, v)}
        />
      ),
    },
  ];

  const filtered = staff.filter(
    (s) => s.name.toLowerCase().includes(filter.toLowerCase()) || s.role.toLowerCase().includes(filter.toLowerCase())
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search staff..."
            className="pl-8 text-sm"
          />
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-3.5 w-3.5 mr-1" /> Invite Staff
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-xs text-slate-400">No staff members yet. Invite your first team member!</td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}

// ─── Tab: Roles & Permissions ─────────────────────────────────────────────────

function PermissionsTab() {
  const [perms, setPerms] = useState<Record<StaffRole, Record<ModuleName, PermLevel>>>(() => {
    const init: Partial<Record<StaffRole, Record<ModuleName, PermLevel>>> = {};
    for (const role of ROLES) {
      init[role] = {} as Record<ModuleName, PermLevel>;
      for (const mod of MODULES) {
        (init[role] as Record<ModuleName, PermLevel>)[mod] = "NONE";
      }
    }
    return init as Record<StaffRole, Record<ModuleName, PermLevel>>;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const cyclePermission = (role: StaffRole, mod: ModuleName) => {
    const current = perms[role][mod];
    const idx = PERM_LEVELS.indexOf(current);
    const next = PERM_LEVELS[(idx + 1) % PERM_LEVELS.length];
    setPerms((p) => ({ ...p, [role]: { ...p[role], [mod]: next } }));
  };

  const applyTemplate = (templateName: string) => {
    const tpl = PERM_TEMPLATES[templateName];
    // Apply to all matching roles
    const roleMap: Record<string, StaffRole> = {
      "Doctor Template": "DOCTOR",
      "Nurse Template": "NURSE",
      "Receptionist Template": "RECEPTIONIST",
      "Admin Template": "HOSPITAL_ADMIN",
    };
    const role = roleMap[templateName];
    if (role) setPerms((p) => ({ ...p, [role]: tpl }));
  };

  const savePermissions = async () => {
    setSaving(true);
    await fetch("/api/hospital/staff/permissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: perms }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {Object.keys(PERM_TEMPLATES).map((t) => (
            <button
              key={t}
              onClick={() => applyTemplate(t)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              {t}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={savePermissions} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
          {saved ? <><Check className="h-3.5 w-3.5 mr-1 text-green-500" /> Saved!</> : "Save Permissions"}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wide text-[10px] sticky left-0 bg-slate-50 w-28">Role</th>
              {MODULES.map((m) => (
                <th key={m} className="px-3 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wide text-[10px]">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ROLES.map((role) => (
              <tr key={role} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-semibold text-slate-700 sticky left-0 bg-white text-xs">{ROLE_LABELS[role]}</td>
                {MODULES.map((mod) => {
                  const level = perms[role][mod];
                  return (
                    <td key={mod} className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => cyclePermission(role, mod)}
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:opacity-80 ${PERM_COLORS[level]}`}
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
      <p className="text-xs text-slate-400 mt-2">Click any cell to cycle: NONE → VIEW → EDIT → FULL</p>
    </div>
  );
}

// ─── Tab: Shift Schedule ──────────────────────────────────────────────────────

function ShiftTab({ staff }: { staff: StaffMember[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const shifts: ShiftType[] = ["MORNING", "EVENING", "NIGHT"];
  const shiftColors: Record<ShiftType, string> = {
    MORNING: "bg-yellow-100 text-yellow-800",
    EVENING: "bg-orange-100 text-orange-800",
    NIGHT: "bg-blue-100 text-blue-800",
    ROTATIONAL: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-auto">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-2.5 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wide sticky left-0 bg-slate-50">Staff</th>
            {days.map((d) => (
              <th key={d} className="px-3 py-2.5 text-center font-bold text-slate-500 text-[10px] uppercase">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {staff.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-8 text-xs text-slate-400">No staff to schedule</td>
            </tr>
          ) : (
            staff.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2.5 font-semibold text-slate-700 sticky left-0 bg-white">{s.name}</td>
                {days.map((d) => (
                  <td key={d} className="px-3 py-2.5 text-center">
                    {s.shift ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${shiftColors[s.shift]}`}>
                        {s.shift.charAt(0)}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "permissions" | "shifts">("staff");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hospital/staff")
      .then((r) => r.json())
      .then((d) => setStaff(d.staff ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, isActive } : s));
    await fetch(`/api/hospital/staff/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
  };

  const tabs = [
    { id: "staff", label: "Staff Members", icon: Users },
    { id: "permissions", label: "Roles & Permissions", icon: Shield },
    { id: "shifts", label: "Shift Schedule", icon: Calendar },
  ] as const;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-xl">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff & Roles</h1>
          <p className="text-xs text-slate-500">RBAC security, team management, shift scheduling</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all
                ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      ) : (
        <>
          {activeTab === "staff" && <StaffTab staff={staff} onToggle={handleToggleActive} />}
          {activeTab === "permissions" && <PermissionsTab />}
          {activeTab === "shifts" && <ShiftTab staff={staff} />}
        </>
      )}
    </div>
  );
}
