"use client";

import { useState, useEffect, useCallback } from "react";
import type { Unit, Department, DeptType, Bed } from "@prisma/client";
import {
  Plus, Pencil, Trash2, GripVertical, ChevronRight,
  Building2, Layers, AlertCircle, Loader2, Check, X,
  BedDouble, LayoutGrid, Info, ArrowUpRight,
  Search, Filter, MoreVertical, LayoutPanelLeft
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type ExtendedUnit = Unit & { beds: Bed[] };
type ExtendedDepartment = Department & { units: ExtendedUnit[] };

// ─── Sortable Unit Item ───────────────────────────────────────────────────────

function SortableUnit({ 
  unit, 
  onSelect, 
  isSelected,
  onEdit,
  onDelete 
}: { 
  unit: ExtendedUnit; 
  onSelect: () => void;
  isSelected: boolean;
  onEdit: (u: ExtendedUnit) => void;
  onDelete: (id: string) => void;
}) {
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
      onClick={onSelect}
      className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-2
        ${isSelected ? "bg-blue-50/50 border-blue-500" : "bg-white border-transparent hover:bg-slate-50"}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-slate-100 rounded text-slate-300">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{unit.name}</span>
          {unit.floor && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-slate-100 text-slate-600 font-normal">
              Floor {unit.floor}
            </Badge>
          )}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
          <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {unit.capacity} Capacity</span>
          <span>{unit.type || "General Ward"}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEdit(unit); }}>
          <Pencil className="h-3.5 w-3.5 text-slate-500" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-600" onClick={(e) => { e.stopPropagation(); onDelete(unit.id); }}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<ExtendedDepartment[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Dialog States
  const [deptDialog, setDeptDialog] = useState<{ open: boolean; edit?: Department }>({ open: false });
  const [unitDialog, setUnitDialog] = useState<{ open: boolean; edit?: ExtendedUnit }>({ open: false });
  const [deleteWarning, setDeleteWarning] = useState<{ open: boolean; error?: string }>({ open: false });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedDept = departments.find(d => d.id === selectedDeptId);
  const selectedUnit = selectedDept?.units.find(u => u.id === selectedUnitId);

  // Initial Load
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hospital/departments");
      const data = await res.json();
      setDepartments(data.departments ?? []);
      if (data.departments?.length > 0 && !selectedDeptId) {
        setSelectedDeptId(data.departments[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch departments", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDeptId]);

  useEffect(() => { fetchDepartments(); }, []);

  // Handlers
  const handleDeptSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      type: formData.get("type") as DeptType,
    };

    try {
      if (deptDialog.edit) {
        await fetch(`/api/hospital/departments/${deptDialog.edit.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/hospital/departments", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await fetchDepartments();
      setDeptDialog({ open: false });
    } catch (err) {
      console.error(err);
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
      name: formData.get("name") as string,
      capacity: parseInt(formData.get("capacity") as string),
      floor: formData.get("floor") as string,
      type: formData.get("type") as string,
      bedType: "GENERAL", // Default
    };

    try {
      if (unitDialog.edit) {
        await fetch(`/api/hospital/units/${unitDialog.edit.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/hospital/departments/${selectedDeptId}/units`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await fetchDepartments();
      setUnitDialog({ open: false });
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    try {
      const res = await fetch(`/api/hospital/units/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setDeleteWarning({ open: true, error: data.error });
        return;
      }
      await fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedDeptId) return;

    const units = [...(selectedDept?.units || [])];
    const oldIndex = units.findIndex(u => u.id === active.id);
    const newIndex = units.findIndex(u => u.id === over.id);
    const reorderedIds = arrayMove(units, oldIndex, newIndex).map(u => u.id);

    // Optimistic update
    setDepartments(prev => prev.map(d => 
      d.id === selectedDeptId 
        ? { ...d, units: arrayMove(d.units, oldIndex, newIndex) } 
        : d
    ));

    await fetch(`/api/hospital/departments/${selectedDeptId}/units/reorder`, {
      method: "PUT",
      body: JSON.stringify({ unitIds: reorderedIds }),
    });
  };

  const bedStatusColors: Record<string, string> = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    OCCUPIED: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
    RESERVED: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    MAINTENANCE: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
  };

  const statusDot: Record<string, string> = {
    AVAILABLE: "bg-emerald-500",
    OCCUPIED: "bg-rose-500",
    RESERVED: "bg-amber-500",
    MAINTENANCE: "bg-slate-500",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <LayoutPanelLeft className="h-5 w-5 text-white" />
            </div>
            Hospital Structure Core
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage departments, units, and bed inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white" onClick={() => fetchDepartments()}>
            <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100" onClick={() => setDeptDialog({ open: true })}>
            <Plus className="h-4 w-4 mr-2" /> New Department
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left: Department List */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Departments</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none font-bold">
                {departments.length}
              </Badge>
            </div>
            <div className="p-2 space-y-1">
              {loading && departments.length === 0 ? (
                <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></div>
              ) : departments.map(dept => (
                <div
                  key={dept.id}
                  onClick={() => {
                    setSelectedDeptId(dept.id);
                    if (dept.units.length > 0) setSelectedUnitId(dept.units[0].id);
                    else setSelectedUnitId(null);
                  }}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all relative
                    ${selectedDeptId === dept.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${selectedDeptId === dept.id ? "bg-white/20" : "bg-slate-100 group-hover:bg-blue-50"}`}>
                    <Layers className={`h-4 w-4 ${selectedDeptId === dept.id ? "text-white" : "text-slate-500 group-hover:text-blue-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{dept.name}</div>
                    <div className={`text-[10px] mt-0.5 flex items-center gap-2 ${selectedDeptId === dept.id ? "text-blue-100" : "text-slate-400"}`}>
                      <span className="font-mono uppercase tracking-tighter">{dept.code}</span>
                      <span className="opacity-40">•</span>
                      <span>{dept.units.length} Units</span>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${selectedDeptId === dept.id ? "text-white translate-x-1" : "text-slate-300 group-hover:text-slate-400"}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-blue-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold flex items-center gap-2 mb-2"><Info className="h-4 w-4" /> Management Rules</h3>
              <ul className="text-xs space-y-2 opacity-90 font-medium">
                <li className="flex gap-2"><span>•</span> NICU/PICU must be Units, not Departments</li>
                <li className="flex gap-2"><span>•</span> OPD departments cannot have beds</li>
                <li className="flex gap-2"><span>•</span> IPD/BOTH must have at least 1 unit</li>
                <li className="flex gap-2"><span>•</span> Cannot delete units with occupied beds</li>
              </ul>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10"><Building2 className="h-32 w-32" /></div>
          </div>
        </div>

        {/* Right: Units & Beds Tabs */}
        <div className="col-span-12 lg:col-span-8">
          {selectedDept ? (
            <Tabs defaultValue="units" className="w-full">
              <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <TabsList className="bg-slate-100 p-1 border-none">
                  <TabsTrigger value="units" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 px-6 font-bold text-xs">
                    <Layers className="h-4 w-4 mr-2" /> Units & Wards
                  </TabsTrigger>
                  <TabsTrigger 
                    value="beds" 
                    disabled={selectedDept.type === 'OPD'}
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 px-6 font-bold text-xs"
                  >
                    <BedDouble className="h-4 w-4 mr-2" /> Bed Inventory
                  </TabsTrigger>
                </TabsList>
                <div className="px-4">
                   <Badge variant="outline" className={`text-[10px] font-bold ${selectedDept.type === 'OPD' ? 'text-blue-600 border-blue-200' : 'text-purple-600 border-purple-200'}`}>
                      {selectedDept.type} Mode
                   </Badge>
                </div>
              </div>

              <TabsContent value="units" className="mt-0 focus-visible:outline-none">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div>
                      <h3 className="font-bold text-slate-800">{selectedDept.name} Units</h3>
                      <p className="text-[11px] text-slate-500">Manage wards, semi-private rooms, and specialized units</p>
                    </div>
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setUnitDialog({ open: true })}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Unit
                    </Button>
                  </div>

                  <div className="min-h-[400px]">
                    {selectedDept.units.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                        <Layers className="h-12 w-12 mb-4" />
                        <p className="text-sm font-bold">No Units Registered</p>
                        <p className="text-xs">Create your first ward or unit to begin</p>
                      </div>
                    ) : (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={selectedDept.units.map(u => u.id)} strategy={verticalListSortingStrategy}>
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
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800">Bed Visualization</h3>
                        <p className="text-[11px] text-slate-500">Real-time status and allocation</p>
                      </div>
                      <div className="flex items-center gap-4">
                         {['AVAILABLE', 'OCCUPIED', 'RESERVED'].map(status => (
                           <div key={status} className="flex items-center gap-1.5">
                             <div className={`h-2 w-2 rounded-full ${statusDot[status]}`} />
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{status}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {selectedDept.units.map(unit => (
                        <button
                          key={unit.id}
                          onClick={() => setSelectedUnitId(unit.id)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                            ${selectedUnitId === unit.id ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-400"}`}
                        >
                          {unit.name} ({unit.beds.length})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 flex-1 overflow-y-auto">
                    {!selectedUnit ? (
                      <div className="flex flex-col items-center justify-center h-full py-20 opacity-30">
                        <LayoutGrid className="h-10 w-10 mb-2" />
                        <p className="text-sm font-bold">Select a unit to view beds</p>
                      </div>
                    ) : selectedUnit.beds.length === 0 ? (
                      <div className="text-center py-20 opacity-30">
                        <p className="text-sm font-bold">No beds generated</p>
                        <p className="text-xs">Capacity is set to 0 for this unit</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {selectedUnit.beds.map(bed => (
                          <div
                            key={bed.id}
                            className={`p-3 rounded-xl border-2 transition-all cursor-default relative overflow-hidden group
                              ${bedStatusColors[bed.status]}`}
                          >
                            <div className="flex flex-col items-center justify-center gap-1 py-2">
                              <BedDouble className="h-6 w-6 opacity-40 group-hover:scale-110 transition-transform" />
                              <span className="font-black text-sm">{bed.bedNumber}</span>
                            </div>
                            <div className={`absolute top-0 right-0 w-8 h-8 -mr-4 -mt-4 rotate-45 ${statusDot[bed.status]}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                       <ArrowUpRight className="h-3 w-3" /> Auto-generated based on unit capacity
                    </div>
                    {selectedUnit && (
                      <Badge className="bg-slate-200 text-slate-600 border-none font-bold text-[9px]">
                        {selectedUnit.beds.filter(b => b.status === 'AVAILABLE').length} / {selectedUnit.capacity} FREE
                      </Badge>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
               <Building2 className="h-12 w-12 mb-4 opacity-20" />
               <p className="font-bold">Select a department to manage</p>
            </div>
          )}
        </div>
      </div>

      {/* Department Dialog */}
      <Dialog open={deptDialog.open} onOpenChange={(o) => setDeptDialog({ open: o })}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{deptDialog.edit ? 'Edit' : 'New'} Department</DialogTitle>
            <DialogDescription className="text-xs">
              Departments group specialized clinical services together.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeptSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Department Name</label>
              <Input name="name" defaultValue={deptDialog.edit?.name} placeholder="e.g. Cardiology" required className="rounded-xl border-slate-200 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Code</label>
                <Input name="code" defaultValue={deptDialog.edit?.code} placeholder="e.g. CARD" required className="rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Type</label>
                <select name="type" defaultValue={deptDialog.edit?.type || "IPD"} className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="OPD">OPD (Outpatient)</option>
                  <option value="IPD">IPD (Inpatient)</option>
                  <option value="BOTH">BOTH (OPD + IPD)</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                </select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={saveLoading} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-12 font-bold">
                {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                {deptDialog.edit ? 'Update Department' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unit Dialog */}
      <Dialog open={unitDialog.open} onOpenChange={(o) => setUnitDialog({ open: o })}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{unitDialog.edit ? 'Edit' : 'Add'} Unit / Ward</DialogTitle>
            <DialogDescription className="text-xs">
              Units are physical areas where beds are located.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUnitSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Unit Name</label>
              <Input name="name" defaultValue={unitDialog.edit?.name} placeholder="e.g. Semi-Private A" required className="rounded-xl border-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Capacity (Beds)</label>
                <Input name="capacity" type="number" defaultValue={unitDialog.edit?.capacity || 0} placeholder="0" required className="rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Floor</label>
                <Input name="floor" defaultValue={unitDialog.edit?.floor || ""} placeholder="e.g. 3rd" className="rounded-xl border-slate-200" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Unit Type</label>
              <Input name="type" defaultValue={unitDialog.edit?.type || ""} placeholder="e.g. General, ICU, Deluxe" className="rounded-xl border-slate-200" />
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
               <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
               <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  <strong>Auto-Bed Generation:</strong> Saving will automatically create or adjust bed numbers (B1, B2...) based on the capacity.
               </p>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={saveLoading} className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-12 font-bold">
                {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                {unitDialog.edit ? 'Update Unit & Beds' : 'Create Unit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Warning Dialog */}
      <Dialog open={deleteWarning.open} onOpenChange={(o) => setDeleteWarning({ open: o })}>
        <DialogContent className="sm:max-w-[400px] border-rose-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 font-bold">
              <AlertCircle className="h-5 w-5" /> Operation Blocked
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              {deleteWarning.error || "Cannot perform this action."}
            </p>
            <p className="text-[11px] text-slate-400 mt-3 bg-slate-50 p-2 rounded-lg">
              Rule: Units cannot be deleted while they contain beds with status 'OCCUPIED'. Please discharge patients first.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setDeleteWarning({ open: false })}>Understood</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
