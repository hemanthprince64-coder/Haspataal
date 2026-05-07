'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Unit, Department, DeptType, Bed, Staff } from '@prisma/client';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronRight,
  Building2,
  Layers,
  AlertCircle,
  Loader2,
  Check,
  X,
  BedDouble,
  LayoutGrid,
  Info,
  ArrowUpRight,
  Search,
  Filter,
  MoreVertical,
  LayoutPanelLeft,
  User,
  ClipboardList,
  ShieldAlert,
  Zap,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type ExtendedUnit = Unit & { beds: Bed[] };
type ExtendedDepartment = Department & { units: ExtendedUnit[] };

// ─── Sortable Unit Item ───────────────────────────────────────────────────────

function SortableUnit({
  unit,
  onSelect,
  isSelected,
  onEdit,
  onDelete,
}: {
  unit: ExtendedUnit;
  onSelect: () => void;
  isSelected: boolean;
  onEdit: (u: ExtendedUnit) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: unit.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-2
        ${isSelected ? 'bg-blue-50/50 border-blue-500' : 'bg-white border-transparent hover:bg-slate-50'}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 hover:bg-slate-100 rounded text-slate-300"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{unit.name}</span>
          {unit.floor && (
            <Badge
              variant="secondary"
              className="text-[9px] h-4 px-1.5 bg-slate-100 text-slate-600 font-black uppercase"
            >
              FL {unit.floor}
            </Badge>
          )}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-3 font-medium uppercase tracking-tight">
          <span className="flex items-center gap-1">
            <BedDouble className="h-3 w-3" /> {unit.capacity} Beds
          </span>
          <span className="opacity-40">•</span>
          <span>{unit.type || 'General Ward'}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(unit);
          }}
        >
          <Pencil className="h-3.5 w-3.5 text-slate-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(unit.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<ExtendedDepartment[]>([]);
  const [doctors, setDoctors] = useState<Staff[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Dialog States
  const [deptDialog, setDeptDialog] = useState<{ open: boolean; edit?: ExtendedDepartment }>({
    open: false,
  });
  const [unitDialog, setUnitDialog] = useState<{ open: boolean; edit?: ExtendedUnit }>({
    open: false,
  });
  const [deleteWarning, setDeleteWarning] = useState<{ open: boolean; error?: string }>({
    open: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const selectedUnit = selectedDept?.units.find((u) => u.id === selectedUnitId);

  // Initial Load
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptRes, staffRes] = await Promise.all([
        fetch('/api/hospital/departments'),
        fetch('/api/hospital/staff'),
      ]);

      const deptData = await deptRes.json();
      const staffData = await staffRes.json();

      setDepartments(deptData.departments ?? []);
      setDoctors((staffData.staff ?? []).filter((s: Staff) => s.role === 'DOCTOR'));

      if (deptData.departments?.length > 0 && !selectedDeptId) {
        setSelectedDeptId(deptData.departments[0].id);
        if (deptData.departments[0].units.length > 0) {
          setSelectedUnitId(deptData.departments[0].units[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDeptId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeptSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      code: (formData.get('code') as string).toUpperCase(),
      type: formData.get('type') as DeptType,
      headDoctorId: (formData.get('headDoctorId') as string) || null,
      description: formData.get('description') as string,
      maxCapacity: parseInt(formData.get('maxCapacity') as string) || 0,
    };

    // Check for duplicate code (client-side)
    const duplicate = departments.find(
      (d) => d.code === payload.code && d.id !== deptDialog.edit?.id,
    );
    if (duplicate) {
      toast.error(`Department code "${payload.code}" is already in use by ${duplicate.name}`);
      setSaveLoading(false);
      return;
    }

    try {
      const res = await fetch(
        deptDialog.edit
          ? `/api/hospital/departments/${deptDialog.edit.id}`
          : '/api/hospital/departments',
        {
          method: deptDialog.edit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error();

      await fetchData();
      setDeptDialog({ open: false });
      toast.success(`Department ${deptDialog.edit ? 'updated' : 'created'} successfully`);
    } catch (err) {
      toast.error('Failed to save department');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUnitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    setSaveLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      capacity: parseInt(formData.get('capacity') as string),
      floor: formData.get('floor') as string,
      type: formData.get('type') as string,
      bedType: formData.get('bedType') as string,
    };

    try {
      const res = await fetch(
        unitDialog.edit
          ? `/api/hospital/units/${unitDialog.edit.id}`
          : `/api/hospital/departments/${selectedDeptId}/units`,
        {
          method: unitDialog.edit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error();

      await fetchData();
      setUnitDialog({ open: false });
      toast.success(`Unit ${unitDialog.edit ? 'updated' : 'created'} successfully`);
    } catch (err) {
      toast.error('Failed to save unit');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    try {
      const res = await fetch(`/api/hospital/units/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteWarning({ open: true, error: data.error });
        return;
      }
      await fetchData();
      toast.success('Unit deleted');
    } catch (err) {
      toast.error('Failed to delete unit');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedDeptId) return;

    const units = [...(selectedDept?.units || [])];
    const oldIndex = units.findIndex((u) => u.id === active.id);
    const newIndex = units.findIndex((u) => u.id === over.id);
    const reorderedIds = arrayMove(units, oldIndex, newIndex).map((u) => u.id);

    // Optimistic update
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === selectedDeptId ? { ...d, units: arrayMove(d.units, oldIndex, newIndex) } : d,
      ),
    );

    await fetch(`/api/hospital/departments/${selectedDeptId}/units/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitIds: reorderedIds }),
    });
  };

  const bedStatusColors: Record<string, string> = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    OCCUPIED: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    RESERVED: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    MAINTENANCE: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
    CLEANING: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
  };

  const statusDot: Record<string, string> = {
    AVAILABLE: 'bg-emerald-500',
    OCCUPIED: 'bg-rose-500',
    RESERVED: 'bg-amber-500',
    MAINTENANCE: 'bg-slate-500',
    CLEANING: 'bg-cyan-500',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100">
            <LayoutPanelLeft className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Architecture
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Define your departments, wards, and bed infrastructure
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white h-10 px-4 rounded-xl font-bold text-slate-600 border-slate-200"
            onClick={() => fetchData()}
          >
            <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-xl font-bold shadow-lg shadow-blue-100"
            onClick={() => setDeptDialog({ open: true })}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Department
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left: Department List */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Departments
                </span>
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-600 text-white border-none font-black text-[10px] h-5 px-2"
              >
                {departments.length}
              </Badge>
            </div>
            <div className="p-3 space-y-2">
              {loading && departments.length === 0 ? (
                <div className="py-24 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                </div>
              ) : (
                departments.map((dept) => (
                  <div
                    key={dept.id}
                    onClick={() => {
                      setSelectedDeptId(dept.id);
                      if (dept.units.length > 0) setSelectedUnitId(dept.units[0].id);
                      else setSelectedUnitId(null);
                    }}
                    className={`group flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all relative border
                    ${
                      selectedDeptId === dept.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100'
                        : 'bg-white text-slate-600 border-transparent hover:border-blue-100 hover:bg-blue-50/30'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${selectedDeptId === dept.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-blue-50'}`}
                    >
                      <Layers
                        className={`h-4 w-4 ${selectedDeptId === dept.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm tracking-tight truncate">{dept.name}</div>
                      <div
                        className={`text-[10px] mt-0.5 flex items-center gap-2 font-bold uppercase tracking-tighter ${selectedDeptId === dept.id ? 'text-blue-100' : 'text-slate-400'}`}
                      >
                        <span>{dept.code}</span>
                        <span className="opacity-40">•</span>
                        <span>{dept.units.length} Units</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${selectedDeptId === dept.id ? 'text-white translate-x-1' : 'text-slate-300 group-hover:text-slate-400'}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 opacity-0 group-hover:opacity-100 ${selectedDeptId === dept.id ? 'text-white hover:bg-white/20' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeptDialog({ open: true, edit: dept });
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-blue-400 uppercase text-[10px] tracking-widest">
                <ShieldAlert className="h-4 w-4" /> Management Protocol
              </h3>
              <ul className="text-xs space-y-3 opacity-90 font-medium">
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>OPD departments are restricted from bed allocation.</span>
                </li>
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>
                    Each IPD unit automatically generates a bed inventory map based on capacity.
                  </span>
                </li>
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>Units cannot be removed if beds are in 'OCCUPIED' status.</span>
                </li>
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <span>Maximum capacity limits trigger overcrowding alerts in Analytics.</span>
                </li>
              </ul>
            </div>
            <div className="absolute -bottom-6 -right-6 p-8 opacity-10">
              <Building2 className="h-40 w-40" />
            </div>
          </div>
        </div>

        {/* Right: Units & Beds Tabs */}
        <div className="col-span-12 lg:col-span-8">
          {selectedDept ? (
            <Tabs defaultValue="units" className="w-full">
              <div className="flex items-center justify-between mb-6 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
                <TabsList className="bg-slate-100 p-1 border-none">
                  <TabsTrigger
                    value="units"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl py-2.5 px-8 font-black text-[10px] uppercase tracking-wider"
                  >
                    <Layers className="h-4 w-4 mr-2" /> Units & Layout
                  </TabsTrigger>
                  <TabsTrigger
                    value="beds"
                    disabled={selectedDept.type === 'OPD'}
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl py-2.5 px-8 font-black text-[10px] uppercase tracking-wider"
                  >
                    <BedDouble className="h-4 w-4 mr-2" /> Bed Inventory
                  </TabsTrigger>
                </TabsList>
                <div className="px-5 flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Department Head
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {doctors.find((d) => d.id === selectedDept.headDoctorId)?.name ||
                        'Not Assigned'}
                    </span>
                  </div>
                  <Badge
                    className={`rounded-lg text-[10px] font-black px-3 py-1 border-none ${selectedDept.type === 'OPD' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
                  >
                    {selectedDept.type}
                  </Badge>
                </div>
              </div>

              <TabsContent value="units" className="mt-0 focus-visible:outline-none">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {selectedDept.name} Units
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Physical wards and specialized care units for this department
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-slate-900 hover:bg-black text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-slate-100"
                      onClick={() => setUnitDialog({ open: true })}
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" /> Add Unit
                    </Button>
                  </div>

                  <div className="min-h-[450px]">
                    {selectedDept.units.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-32 text-center opacity-30">
                        <div className="p-5 bg-slate-50 rounded-full mb-4">
                          <Layers className="h-10 w-10" />
                        </div>
                        <p className="text-sm font-bold">No Units Registered</p>
                        <p className="text-xs font-medium">
                          Configure wards to enable bed management
                        </p>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={selectedDept.units.map((u) => u.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="divide-y divide-slate-100">
                            {selectedDept.units.map((unit) => (
                              <SortableUnit
                                key={unit.id}
                                unit={unit}
                                isSelected={selectedUnitId === unit.id}
                                onSelect={() => setSelectedUnitId(unit.id)}
                                onEdit={(u) => setUnitDialog({ open: true, edit: u })}
                                onDelete={handleDeleteUnit}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="beds" className="mt-0 focus-visible:outline-none">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[550px]">
                  <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                          Bed Visualization
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Live status across {selectedUnit?.name || 'selected unit'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                        {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'].map((status) => (
                          <div key={status} className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${statusDot[status]}`} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                              {status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {selectedDept.units.map((unit) => (
                        <button
                          key={unit.id}
                          onClick={() => setSelectedUnitId(unit.id)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border
                            ${
                              selectedUnitId === unit.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                            }`}
                        >
                          {unit.name}{' '}
                          <span className="ml-1 opacity-60 font-bold">[{unit.beds.length}]</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 flex-1 overflow-y-auto">
                    {!selectedUnit ? (
                      <div className="flex flex-col items-center justify-center h-full py-32 opacity-20">
                        <LayoutGrid className="h-12 w-12 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">
                          Select a unit ward
                        </p>
                      </div>
                    ) : selectedUnit.beds.length === 0 ? (
                      <div className="text-center py-32 opacity-30">
                        <div className="p-5 bg-slate-50 rounded-full inline-block mb-4">
                          <BedDouble className="h-10 w-10" />
                        </div>
                        <p className="text-sm font-bold">No beds available</p>
                        <p className="text-xs font-medium">Update unit capacity to generate beds</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {selectedUnit.beds.map((bed) => (
                          <div
                            key={bed.id}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-default relative overflow-hidden group
                              ${bedStatusColors[bed.status]}`}
                          >
                            <div className="flex flex-col items-center justify-center gap-2 py-3">
                              <BedDouble className="h-7 w-7 opacity-30 group-hover:scale-110 group-hover:opacity-60 transition-all" />
                              <span className="font-black text-sm tracking-tighter">
                                {bed.bedNumber}
                              </span>
                              <Badge className="text-[8px] font-black h-4 bg-white/40 border-none group-hover:bg-white/80">
                                {bed.type}
                              </Badge>
                            </div>
                            <div
                              className={`absolute top-0 right-0 w-10 h-10 -mr-5 -mt-5 rotate-45 shadow-sm ${statusDot[bed.status]}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-blue-500" /> Auto-allocated via unit capacity
                    </div>
                    {selectedUnit && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">AVAILABILITY</span>
                        <Badge className="bg-white text-slate-800 border-slate-200 font-black text-[10px] h-6 px-3">
                          {selectedUnit.beds.filter((b) => b.status === 'AVAILABLE').length} /{' '}
                          {selectedUnit.capacity} FREE
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-48 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400">
              <div className="p-6 bg-slate-50 rounded-full mb-6">
                <Building2 className="h-16 w-16 opacity-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No Department Selected</h3>
              <p className="text-sm font-medium text-slate-500 mt-2">
                Pick a clinical department from the left to manage its structure
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Department Dialog */}
      <Dialog open={deptDialog.open} onOpenChange={(o) => setDeptDialog({ open: o })}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {deptDialog.edit ? 'Edit' : 'Create'} Department
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Structure your clinical operations by specialty and capacity.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeptSubmit} className="space-y-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Department Name
                </label>
                <Input
                  name="name"
                  defaultValue={deptDialog.edit?.name}
                  placeholder="e.g. Cardiology"
                  required
                  className="rounded-xl h-11 border-slate-200 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Code
                </label>
                <Input
                  name="code"
                  defaultValue={deptDialog.edit?.code}
                  placeholder="CARD"
                  required
                  className="rounded-xl h-11 border-slate-200 font-black uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Operational Type
                </label>
                <select
                  name="type"
                  defaultValue={deptDialog.edit?.type || 'IPD'}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OPD">OPD (Outpatient Only)</option>
                  <option value="IPD">IPD (Inpatient Only)</option>
                  <option value="BOTH">BOTH (Clinical & Ward)</option>
                  <option value="EMERGENCY">EMERGENCY / TRIAGE</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Head Doctor
                </label>
                <select
                  name="headDoctorId"
                  defaultValue={deptDialog.edit?.headDoctorId || ''}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Not Assigned</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Department Description
              </label>
              <textarea
                name="description"
                defaultValue={deptDialog.edit?.description || ''}
                rows={2}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Focus areas, specialized treatments..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Max Capacity (Overcrowding Limit)
              </label>
              <Input
                name="maxCapacity"
                type="number"
                defaultValue={deptDialog.edit?.maxCapacity || 0}
                placeholder="0"
                className="rounded-xl h-11 border-slate-200"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={saveLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 font-black shadow-xl shadow-blue-100 text-sm uppercase tracking-widest"
              >
                {saveLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Check className="h-5 w-5 mr-2" />
                )}
                {deptDialog.edit ? 'Update Structure' : 'Initialize Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unit Dialog */}
      <Dialog open={unitDialog.open} onOpenChange={(o) => setUnitDialog({ open: o })}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {unitDialog.edit ? 'Update' : 'Initialize'} Ward Unit
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Configure ward specifics and capacity for {selectedDept?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUnitSubmit} className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Unit / Ward Name
              </label>
              <Input
                name="name"
                defaultValue={unitDialog.edit?.name}
                placeholder="e.g. Intensive Care Unit (ICU)"
                required
                className="rounded-xl h-11 border-slate-200 font-bold"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['General Ward', 'Semi-Private', 'Deluxe', 'ICU', 'NICU', 'Triage'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const input = document.querySelector(
                        'input[name="name"]',
                      ) as HTMLInputElement;
                      if (input) input.value = t;
                    }}
                    className="text-[9px] font-black bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Capacity (Total Beds)
                </label>
                <Input
                  name="capacity"
                  type="number"
                  defaultValue={unitDialog.edit?.capacity || 0}
                  placeholder="0"
                  required
                  className="rounded-xl h-11 border-slate-200 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Floor / Wing
                </label>
                <Input
                  name="floor"
                  defaultValue={unitDialog.edit?.floor || ''}
                  placeholder="e.g. 3rd Floor"
                  className="rounded-xl h-11 border-slate-200 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Default Bed Type
                </label>
                <select
                  name="bedType"
                  defaultValue={unitDialog.edit?.bedType || 'GENERAL'}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="ICU">ICU</option>
                  <option value="NICU">NICU</option>
                  <option value="PRIVATE">Private</option>
                  <option value="SEMI_PRIVATE">Semi-Private</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Classification
                </label>
                <Input
                  name="type"
                  defaultValue={unitDialog.edit?.type || ''}
                  placeholder="e.g. Critical Care"
                  className="rounded-xl h-11 border-slate-200 font-bold"
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
              <Zap className="h-6 w-6 text-amber-500 shrink-0" />
              <div>
                <p className="text-[11px] text-amber-900 leading-snug font-bold">
                  Automatic Inventory Generation
                </p>
                <p className="text-[10px] text-amber-800/70 leading-snug font-medium mt-1">
                  System will automatically generate bed codes (B1, B2...) based on capacity. Ensure
                  capacity matches physical count.
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={saveLoading}
                className="w-full bg-slate-900 hover:bg-black rounded-2xl h-14 font-black shadow-xl shadow-slate-100 text-sm uppercase tracking-widest"
              >
                {saveLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Check className="h-5 w-5 mr-2" />
                )}
                {unitDialog.edit ? 'Update Unit Infrastructure' : 'Authorize New Ward'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Warning Dialog */}
      <Dialog open={deleteWarning.open} onOpenChange={(o) => setDeleteWarning({ open: o })}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-rose-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 font-black uppercase text-lg tracking-tighter">
              <ShieldAlert className="h-6 w-6" /> Safety Protocol Blocked
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-sm font-bold text-slate-800 leading-relaxed">
              {deleteWarning.error ||
                'The requested operation violates clinical safety constraints.'}
            </p>
            <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Safety Rule #402
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Active clinical units containing beds with status 'OCCUPIED' cannot be removed to
                prevent data loss and orphaned patient records.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full rounded-2xl h-12 font-black bg-slate-900 hover:bg-black"
              onClick={() => setDeleteWarning({ open: false })}
            >
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
