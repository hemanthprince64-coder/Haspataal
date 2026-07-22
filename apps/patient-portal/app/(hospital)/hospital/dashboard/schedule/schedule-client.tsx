/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getDoctorSchedule,
  upsertDoctorSchedule,
  generateSlotsFromSchedule,
  blockExistingSlots,
  getSlotsForDoctor,
} from '@/lib/schedule-actions';

interface Doctor {
  id: string;
  name: string;
}

interface ScheduleClientProps {
  doctors: Doctor[];
}

interface WeeklyTemplateRow {
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAYS_MAP = [
  { val: 1, name: 'Monday' },
  { val: 2, name: 'Tuesday' },
  { val: 3, name: 'Wednesday' },
  { val: 4, name: 'Thursday' },
  { val: 5, name: 'Friday' },
  { val: 6, name: 'Saturday' },
  { val: 7, name: 'Sunday' },
];

export default function ScheduleClient({ doctors }: ScheduleClientProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || '');
  const [schedule, setSchedule] = useState<WeeklyTemplateRow[]>(
    DAYS_MAP.map((d) => ({
      dayOfWeek: d.val,
      dayName: d.name,
      startTime: '09:00',
      endTime: '17:00',
      isActive: false,
    })),
  );

  const [slotsDate, setSlotsDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Block Dialog state
  const [blockStartTime, setBlockStartTime] = useState('09:00');
  const [blockEndTime, setBlockEndTime] = useState('17:00');
  const [blockReason, setBlockReason] = useState('');
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  // Load schedule when doctor selection changes
  useEffect(() => {
    if (selectedDoctorId) {
      loadSchedule();
      loadSlots();
    }
  }, [selectedDoctorId]);

  // Load slots when date or doctor changes
  useEffect(() => {
    if (selectedDoctorId && slotsDate) {
      loadSlots();
    }
  }, [selectedDoctorId, slotsDate]);

  const loadSchedule = async () => {
    setLoadingSchedule(true);
    const res = await getDoctorSchedule(selectedDoctorId);
    if (res.success && res.data) {
      // Map returned database rows onto weekly templates
      const updated = DAYS_MAP.map((d) => {
        const row = res.data.find((item: any) => item.dayOfWeek === d.val);
        return {
          dayOfWeek: d.val,
          dayName: d.name,
          startTime: row?.startTime || '09:00',
          endTime: row?.endTime || '17:00',
          isActive: row?.isActive ?? false,
        };
      });
      setSchedule(updated);
    }
    setLoadingSchedule(false);
  };

  const loadSlots = async () => {
    setLoadingSlots(true);
    // Fetch slots for the selected date (start and end range matching the selected date)
    const res = await getSlotsForDoctor(selectedDoctorId, slotsDate, slotsDate);
    if (res.success && res.data) {
      setSlots(res.data.slots);
      setBlocks(res.data.blocks);
    }
    setLoadingSlots(false);
  };

  const handleUpsertRow = async (row: WeeklyTemplateRow) => {
    const res = await upsertDoctorSchedule({
      doctorId: selectedDoctorId,
      dayOfWeek: row.dayOfWeek,
      startTime: row.startTime,
      endTime: row.endTime,
      isActive: row.isActive,
      slotDurationMinutes: 30, // 30-min duration default
    });
    if (res.success) {
      loadSchedule();
    }
  };

  const handleGenerateNext30Days = async () => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);

    const res = await generateSlotsFromSchedule({
      doctorId: selectedDoctorId,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });

    if (res.success) {
      alert(res.message);
      loadSlots();
    } else {
      alert('Error: ' + res.message);
    }
  };

  const handleBlockSlots = async () => {
    const blockStart = `${slotsDate}T${blockStartTime}:00`;
    const blockEnd = `${slotsDate}T${blockEndTime}:00`;

    const res = await blockExistingSlots({
      doctorId: selectedDoctorId,
      blockStart,
      blockEnd,
      reason: blockReason,
    });

    if (res.success) {
      setIsBlockDialogOpen(false);
      setBlockReason('');
      loadSlots();
    } else {
      alert('Error: ' + res.message);
    }
  };

  const isSlotBlocked = (slot: any) => {
    const slotTime = new Date(slot.startTime).getTime();
    return blocks.some((b) => {
      const blockStart = new Date(b.blockStart).getTime();
      const blockEnd = new Date(b.blockEnd).getTime();
      return slotTime >= blockStart && slotTime < blockEnd;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1">
          <Label htmlFor="doctor-select" className="text-slate-400 text-xs">
            Selected Doctor
          </Label>
          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
            <SelectTrigger className="w-[280px] bg-slate-950 border-slate-800 text-slate-100">
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
              {doctors.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleGenerateNext30Days}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all"
          >
            Generate Next 30 Days
          </Button>

          <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all">
                Block Slot Range
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-100">
                  Block Slots Range
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm">
                  Temporarily disable bookings for a specific period on {slotsDate}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="block-start" className="text-slate-300">
                      Start Time
                    </Label>
                    <Input
                      id="block-start"
                      type="time"
                      value={blockStartTime}
                      onChange={(e) => setBlockStartTime(e.target.value)}
                      className="bg-slate-900 border-slate-850 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="block-end" className="text-slate-300">
                      End Time
                    </Label>
                    <Input
                      id="block-end"
                      type="time"
                      value={blockEndTime}
                      onChange={(e) => setBlockEndTime(e.target.value)}
                      className="bg-slate-900 border-slate-850 text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block-reason" className="text-slate-300">
                    Reason
                  </Label>
                  <Input
                    id="block-reason"
                    placeholder="e.g. Personal emergency, surgery"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="bg-slate-900 border-slate-850 text-slate-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsBlockDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBlockSlots}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  Confirm Block
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="template" className="w-full">
        <TabsList className="bg-slate-900 border-slate-800 border p-1 rounded-lg">
          <TabsTrigger
            value="template"
            className="data-[state=active]:bg-slate-850 data-[state=active]:text-white text-slate-400"
          >
            Weekly Template
          </TabsTrigger>
          <TabsTrigger
            value="slots"
            className="data-[state=active]:bg-slate-850 data-[state=active]:text-white text-slate-400"
          >
            Day Slots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="mt-6">
          <Card className="border-slate-800 bg-slate-950/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-100">
                Weekly Schedule Template
              </CardTitle>
              <CardDescription className="text-slate-400">
                Define the recurring weekly availability template. Generate operations will use this
                template.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSchedule ? (
                <div className="text-center py-8 text-slate-400">Loading weekly template...</div>
              ) : (
                <div className="divide-y divide-slate-850">
                  {schedule.map((row, index) => (
                    <div
                      key={row.dayOfWeek}
                      className="py-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                    >
                      <div className="flex items-center gap-4 w-48">
                        <Switch
                          checked={row.isActive}
                          onCheckedChange={(checked) => {
                            const newSched = [...schedule];
                            newSched[index].isActive = checked;
                            setSchedule(newSched);
                          }}
                        />
                        <span
                          className={`font-semibold text-sm ${row.isActive ? 'text-slate-100 font-bold' : 'text-slate-500'}`}
                        >
                          {row.dayName}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <Label className="text-slate-400 text-xs">Start</Label>
                          <Input
                            type="time"
                            value={row.startTime}
                            disabled={!row.isActive}
                            onChange={(e) => {
                              const newSched = [...schedule];
                              newSched[index].startTime = e.target.value;
                              setSchedule(newSched);
                            }}
                            className="bg-slate-900 border-slate-800 text-slate-100 w-28 disabled:opacity-50"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Label className="text-slate-400 text-xs">End</Label>
                          <Input
                            type="time"
                            value={row.endTime}
                            disabled={!row.isActive}
                            onChange={(e) => {
                              const newSched = [...schedule];
                              newSched[index].endTime = e.target.value;
                              setSchedule(newSched);
                            }}
                            className="bg-slate-900 border-slate-800 text-slate-100 w-28 disabled:opacity-50"
                          />
                        </div>

                        <Button
                          onClick={() => handleUpsertRow(row)}
                          variant="ghost"
                          className="text-indigo-400 hover:text-indigo-350 hover:bg-slate-900 border border-slate-800 font-semibold"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slots" className="mt-6">
          <Card className="border-slate-800 bg-slate-950/40 backdrop-blur-md">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-slate-100">
                  Daily Slots Management
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Inspect generated slots, check active bookings, and verify blocks for the selected
                  date.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <Label htmlFor="slots-date" className="text-slate-400 text-xs">
                  Date
                </Label>
                <Input
                  id="slots-date"
                  type="date"
                  value={slotsDate}
                  onChange={(e) => setSlotsDate(e.target.value)}
                  className="bg-slate-900 border-slate-850 text-slate-100 w-40"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingSlots ? (
                <div className="text-center py-8 text-slate-400">Loading slots...</div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No slots generated for {slotsDate}. Click "Generate Next 30 Days" to produce
                  slots.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-sm text-left text-slate-300">
                    <thead className="bg-slate-900 text-xs uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Start Time</th>
                        <th className="px-6 py-3 font-semibold">End Time</th>
                        <th className="px-6 py-3 font-semibold text-center">Capacity</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {slots.map((slot) => {
                        const blocked = isSlotBlocked(slot);
                        return (
                          <tr key={slot.id} className="hover:bg-slate-900/30">
                            <td className="px-6 py-4 font-mono">
                              {new Date(slot.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="px-6 py-4 font-mono">
                              {new Date(slot.endTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-slate-200">
                              {slot.capacity}
                            </td>
                            <td className="px-6 py-4">
                              {blocked ? (
                                <Badge className="bg-rose-950/40 border border-rose-800 text-rose-400">
                                  Blocked
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-950/40 border border-emerald-800 text-emerald-400">
                                  Active
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
