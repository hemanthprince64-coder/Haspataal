"use client";

import { useState, useEffect } from "react";
import type { Unit, Department, DeptType } from "@prisma/client";
import {
  Plus, Pencil, Trash2, GripVertical, ChevronRight,
  Building2, Layers, AlertCircle, Loader2, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Sortable Item ────────────────────────────────────────────────────────────

function SortableUnit({ unit }: { unit: Unit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: unit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white ${isDragging ? "shadow-lg border-blue-200 z-10" : ""}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-slate-50 rounded">
        <GripVertical className="h-4 w-4 text-slate-300" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-semibold text-slate-800">{unit.name}</div>
        <div className="text-[10px] text-slate-400">{unit.bedType} · {unit.capacity} beds{unit.wardNumber ? ` · ${unit.wardNumber}` : ""}</div>
      </div>
      <Badge variant="outline" className="text-[10px]">{unit.bedType}</Badge>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [deptDialog, setDeptDialog] = useState<{ open: boolean; edit?: any }>({ open: false });
  const [unitDialog, setUnitDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load departments
  useEffect(() => {
    fetch("/api/hospital/departments")
      .then((r) => r.json())
      .then((data) => setDepartments(data.departments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedDeptData = departments.find((d) => d.id === selectedDept);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedDept) return;

    setDepartments((prev) => {
      const deptIdx = prev.findIndex(d => d.id === selectedDept);
      if (deptIdx === -1) return prev;

      const newDepts = [...prev];
      const units = [...newDepts[deptIdx].units];
      const oldIndex = units.findIndex(u => u.id === active.id);
      const newIndex = units.findIndex(u => u.id === over.id);
      
      newDepts[deptIdx].units = arrayMove(units, oldIndex, newIndex);
      return newDepts;
    });

    await fetch(`/api/hospital/departments/${selectedDept}/units/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitIds: arrayMove(selectedDeptData!.units, 
          selectedDeptData!.units.findIndex((u: any) => u.id === active.id),
          selectedDeptData!.units.findIndex((u: any) => u.id === over.id)
        ).map((u: any) => u.id)
      }),
    });
  };

  const handleSeedDepts = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/hospital/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: true }),
      });
      const data = await res.json();
      if (data.departments) setDepartments(data.departments);
    } catch {}
    setSeeding(false);
  };

  const handleAddDept = async (form: any) => {
    const res = await fetch("/api/hospital/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.department) {
      setDepartments((prev) => [...prev, data.department]);
    }
  };

  const handleUpdateDept = async (id: string, updates: any) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    await fetch(`/api/hospital/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const handleDeleteDept = async (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDept === id) setSelectedDept(null);
    await fetch(`/api/hospital/departments/${id}`, { method: "DELETE" });
  };

  const handleAddUnit = async (unit: any) => {
    if (!selectedDept) return;
    const res = await fetch(`/api/hospital/departments/${selectedDept}/units`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unit),
    });
    const data = await res.json();
    if (data.unit) {
      setDepartments((prev) =>
        prev.map((d) => d.id === selectedDept ? { ...d, units: [...d.units, data.unit] } : d)
      );
    }
  };

  const deptTypeColor: Record<string, string> = {
    OPD: "bg-blue-100 text-blue-700",
    IPD: "bg-purple-100 text-purple-700",
    BOTH: "bg-teal-100 text-teal-700",
    EMERGENCY: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Departments & Units</h1>
            <p className="text-xs text-slate-500">Structural foundation — all data links to departments</p>
          </div>
        </div>
        <Button
          onClick={() => setDeptDialog({ open: true })}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Department
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4 min-h-[500px]">
        {/* Left: Department List */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Departments</span>
            <span className="text-xs text-slate-400">{departments.length} total</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          ) : departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-slate-500 mb-4">No departments configured</p>
              <Button onClick={handleSeedDepts} disabled={seeding} variant="outline" size="sm">
                {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Seed Common Departments
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                    ${selectedDept === dept.id ? "bg-blue-50 border-r-2 border-blue-500" : "hover:bg-slate-50"}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-slate-800 truncate">{dept.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${deptTypeColor[dept.type]}`}>
                        {dept.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{dept.code}</span>
                      <span className="text-[10px] text-slate-400">{dept.units?.length || 0} units</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={dept.isActive}
                      onCheckedChange={(v) => handleUpdateDept(dept.id, { isActive: v })}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ChevronRight className={`h-3.5 w-3.5 transition-colors ${selectedDept === dept.id ? "text-blue-500" : "text-slate-300"}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Units Panel */}
        <div className="col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
          {!selectedDept ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <Layers className="h-8 w-8 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">Select a department</p>
              <p className="text-xs text-slate-400">to view and manage its units / sub-wards</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700">{selectedDeptData?.name}</span>
                  <span className="text-xs text-slate-400 ml-2">units & sub-wards</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setUnitDialog(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Unit
                </Button>
              </div>

              {!selectedDeptData?.units?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Layers className="h-7 w-7 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No units yet</p>
                  <p className="text-xs text-slate-400">Add sub-wards like ICU, NICU, General Ward</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedDeptData.units.map((u: any) => u.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="divide-y divide-slate-100">
                      {selectedDeptData.units.map((unit: any) => (
                        <SortableUnit key={unit.id} unit={unit} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialogs placeholders (Simplified for now) */}
      {unitDialog && (
        <Dialog open={unitDialog} onOpenChange={setUnitDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Unit</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <Input id="unitName" placeholder="Unit Name (e.g. ICU-A)" />
              <Input id="unitCapacity" type="number" placeholder="Capacity" />
            </div>
            <DialogFooter>
              <Button onClick={() => {
                const name = (document.getElementById("unitName") as HTMLInputElement).value;
                const capacity = parseInt((document.getElementById("unitCapacity") as HTMLInputElement).value);
                handleAddUnit({ name, capacity });
                setUnitDialog(false);
              }}>Add Unit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deptDialog.open && (
        <Dialog open={deptDialog.open} onOpenChange={(o) => setDeptDialog({ open: o })}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <Input id="deptName" placeholder="Department Name" />
              <Input id="deptCode" placeholder="Code (e.g. CARD)" />
            </div>
            <DialogFooter>
              <Button onClick={() => {
                const name = (document.getElementById("deptName") as HTMLInputElement).value;
                const code = (document.getElementById("deptCode") as HTMLInputElement).value;
                handleAddDept({ name, code, type: 'OPD' });
                setDeptDialog({ open: false });
              }}>Add Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
