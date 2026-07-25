/* eslint-disable */
'use client';

import { Pill, Activity, CheckCircle2, RotateCcw, Clock, Stethoscope, Save } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { triggerHapticFeedback } from '@/lib/utils';

export default function DoctorConsultationWorkflow({
  initialAppointments,
  doctorId,
  hospitalId,
}: {
  initialAppointments: any[];
  doctorId: string;
  hospitalId: string;
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showRepeatPrescription, setShowRepeatPrescription] = useState(false);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form states
  const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', weight: '' });
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);
  const [notes, setNotes] = useState('');

  const handleSelectAppointment = (app: any) => {
    setActiveAppointment(app);
    // Reset forms
    setVitals({ bp: '', pulse: '', temp: '', weight: '' });
    setDiagnosis('');
    setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
    setNotes('');
    setShowRepeatPrescription(false);

    // Simulate checking history for repeat prescription
    if (app.patient?.id) {
      setShowRepeatPrescription(true);
      // Mock past visits history
      setPatientHistory([
        {
          id: 'V-1029',
          date: '2026-05-10',
          diagnosis: 'Hypertension (Follow-up)',
          prescriber: 'Dr. Sharma',
          medications: [
            { name: 'Telmisartan 40mg', dosage: '1 tab', frequency: 'OD', duration: '30 days' },
            { name: 'Amlodipine 5mg', dosage: '1 tab', frequency: 'OD', duration: '30 days' },
          ],
          labs: ['Lipid Profile', 'ECG'],
          allergies: ['Penicillin'],
        },
        {
          id: 'V-0891',
          date: '2026-03-15',
          diagnosis: 'Acute Bronchitis',
          prescriber: 'Dr. Sharma',
          medications: [
            { name: 'Amoxicillin 500mg', dosage: '1 tab', frequency: 'TDS', duration: '5 days' },
          ],
          labs: [],
          allergies: ['Penicillin'],
        },
      ]);
    } else {
      setPatientHistory([]);
    }
  };

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRepeatPrescription = (visit?: any) => {
    // If no active appointment is set, auto-start the consultation for this patient
    if (!activeAppointment && visit) {
      // Find the appointment in queue matching this visit's patient
      // For mock purposes, just pick the first pending one if not explicitly handling a real queue mapping
      const pendingApp = appointments.find((a) => a.status !== 'COMPLETED');
      if (pendingApp) {
        handleSelectAppointment(pendingApp);
        toast.info(`New consultation auto-started for ${pendingApp.patient?.name}`);
      }
    }

    const sourceVisit = visit || (patientHistory.length > 0 ? patientHistory[0] : null);

    if (sourceVisit) {
      setDiagnosis(sourceVisit.diagnosis);
      setMedications(sourceVisit.medications || []);
      toast.success('Previous prescription loaded');
    }
  };

  const handleComplete = async () => {
    if (!activeAppointment) return;
    setLoading(true);
    setShowConfirm(false);

    try {
      const res = await fetch('/api/hospital/consultation/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: activeAppointment.id,
          patientId: activeAppointment.patientId,
          doctorId,
          hospitalId,
          vitals,
          diagnosis,
          medications,
          notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to complete consultation');

      toast.success(`Consultation completed for ${activeAppointment.patient?.name}`);
      triggerHapticFeedback([100, 50, 100]);

      // Update UI queue
      setAppointments(
        appointments.map((a) =>
          a.id === activeAppointment.id ? { ...a, status: 'COMPLETED' } : a,
        ),
      );
      localStorage.removeItem(`consultation_draft_${activeAppointment.id}`);
      setActiveAppointment(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Load draft from localStorage on appointment select
  useEffect(() => {
    if (activeAppointment) {
      const draftKey = `consultation_draft_${activeAppointment.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setDiagnosis(parsed.diagnosis || '');
          setMedications(parsed.medications || []);
          setNotes(parsed.notes || '');
          setVitals(parsed.vitals || { bp: '', temp: '', pulse: '', weight: '' });
          toast.info('Restored unsaved draft from local storage');
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [activeAppointment?.id]);

  // Save draft to localStorage periodically or on change
  useEffect(() => {
    if (activeAppointment) {
      const draftKey = `consultation_draft_${activeAppointment.id}`;
      const draft = { diagnosis, medications, notes, vitals };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [diagnosis, medications, notes, vitals, activeAppointment?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeAppointment) {
        e.preventDefault();
        setActiveAppointment(null);
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && activeAppointment) {
        e.preventDefault();
        setShowConfirm(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAppointment, vitals, diagnosis, medications, notes]);

  const renderHistory = () => (
    <>
      {!activeAppointment && patientHistory.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm text-center min-h-[200px]">
          Select a patient to view their history
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-slate-500" />
            Patient History
          </h3>

          {/* Allergies - Pinned */}
          {patientHistory[0]?.allergies?.length > 0 && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
              <h4 className="text-xs font-bold text-red-700 uppercase mb-1">Allergies</h4>
              <div className="flex gap-2 flex-wrap">
                {patientHistory[0].allergies.map((allergy: string) => (
                  <Badge key={allergy} variant="destructive" className="bg-red-600">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {patientHistory.map((visit, idx) => (
              <Card key={visit.id} className="shadow-sm border-slate-200">
                <CardHeader className="p-3 pb-2 bg-slate-50 border-b">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800">{visit.date}</span>
                    <span className="text-xs text-slate-500">{visit.prescriber}</span>
                  </div>
                  <CardTitle className="text-sm font-semibold text-blue-700 mt-1">
                    {visit.diagnosis}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2 text-sm space-y-3">
                  {visit.medications?.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1">Medications</div>
                      <ul className="list-disc pl-4 text-xs space-y-1 text-slate-700">
                        {visit.medications.map((m: any, i: number) => (
                          <li key={i}>
                            {m.name} {m.dosage} ({m.frequency} x {m.duration})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {visit.labs?.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1">Lab Orders</div>
                      <div className="flex gap-1 flex-wrap">
                        {visit.labs.map((l: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {l}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-2 border-t bg-slate-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRepeatPrescription(visit)}
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs flex justify-center min-h-[44px]"
                  >
                    <RotateCcw className="w-3 h-3 mr-1 shrink-0" />
                    Repeat This Prescription
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-50 relative"
      style={{ minHeight: 'calc(100vh - 140px)', height: 'calc(100dvh - 140px)' }}
    >
      {/* LEFT: Queue */}
      <div className="lg:col-span-3 border-r pr-4 overflow-y-auto bg-white">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 px-4 pt-4">
          <Clock className="w-4 h-4 text-slate-500" />
          Today's Queue ({appointments.filter((a) => a.status !== 'COMPLETED').length})
        </h3>
        <div className="space-y-3 px-4 pb-4">
          {appointments.map((app) => (
            <div
              key={app.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectAppointment(app)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectAppointment(app);
                }
              }}
              className={`p-3 rounded-lg border cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                activeAppointment?.id === app.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500'
                  : app.status === 'COMPLETED'
                    ? 'border-slate-200 bg-slate-50 opacity-60'
                    : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-900 text-sm">
                  {app.patient?.name || 'Unknown Patient'}
                </span>
                {app.status === 'COMPLETED' && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" aria-label="Completed" />
                )}
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{app.patient?.phone || 'No phone'}</span>
                <span className="font-mono">{app.slot || 'WALK-IN'}</span>
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <p className="text-sm text-slate-500 text-center">No appointments today.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="min-h-[44px]"
              >
                Refresh Queue
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE: Consultation Area */}
      <div className="lg:col-span-6 flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">
        {!activeAppointment ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
            <Stethoscope className="w-16 h-16 opacity-20" />
            <p>Select a patient from the queue to start consultation</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center gap-2 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {activeAppointment.patient?.name}
                </h2>
                <div className="text-sm text-slate-500 flex gap-4 mt-1">
                  <span>📱 {activeAppointment.patient?.phone || 'N/A'}</span>
                  <span>⚧ {activeAppointment.patient?.gender || 'Unknown'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden min-h-[44px]">
                      <Clock className="w-4 h-4 mr-2 shrink-0" /> History
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[90vw] sm:w-[400px] overflow-y-auto p-6">
                    <SheetHeader className="mb-4 text-left">
                      <SheetTitle>Patient History</SheetTitle>
                    </SheetHeader>
                    {renderHistory()}
                  </SheetContent>
                </Sheet>

                {showRepeatPrescription && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRepeatPrescription()}
                    className="bg-white hover:bg-slate-100 border-slate-300 text-slate-700 min-h-[44px]"
                  >
                    <RotateCcw className="w-4 h-4 mr-2 shrink-0" /> Repeat Last Rx
                  </Button>
                )}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="prescription" className="w-full">
                <TabsList className="mb-6 w-full justify-start border-b border-slate-200 rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="prescription"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent"
                  >
                    Prescription
                  </TabsTrigger>
                  <TabsTrigger
                    value="vitals"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent"
                  >
                    Vitals & Notes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="vitals" className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vital-bp">BP (mmHg)</Label>
                      <Input
                        id="vital-bp"
                        inputMode="tel"
                        placeholder="120/80"
                        value={vitals.bp}
                        onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vital-pulse">Pulse (bpm)</Label>
                      <Input
                        id="vital-pulse"
                        inputMode="numeric"
                        placeholder="72"
                        value={vitals.pulse}
                        onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vital-temp">Temp (°F)</Label>
                      <Input
                        id="vital-temp"
                        inputMode="decimal"
                        placeholder="98.6"
                        value={vitals.temp}
                        onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vital-weight">Weight (kg)</Label>
                      <Input
                        id="vital-weight"
                        inputMode="decimal"
                        placeholder="65"
                        value={vitals.weight}
                        onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                        className="min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinical-notes">Clinical Notes</Label>
                    <Textarea
                      id="clinical-notes"
                      placeholder="Chief complaints, history, findings..."
                      className="h-32 min-h-[44px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="prescription" className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 shrink-0" /> Provisional Diagnosis
                    </Label>
                    <Input
                      placeholder="e.g. Acute Viral Pharyngitis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="font-medium text-lg border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-blue-500 min-h-[44px]"
                    />
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-end">
                      <Label className="text-base font-bold flex items-center gap-2">
                        <Pill className="w-4 h-4 shrink-0" /> Medications
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddMedication}
                        className="min-h-[44px]"
                      >
                        + Add Drug
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {medications.map((med, index) => {
                        const activeAllergies = patientHistory[0]?.allergies || [];
                        const activeMeds = patientHistory[0]?.medications || [];

                        const isAllergyConflict = activeAllergies.some(
                          (alg: string) =>
                            med.name && med.name.toLowerCase().includes(alg.toLowerCase()),
                        );

                        // Check if duplicate in current draft or active history
                        const isDuplicateCurrent =
                          medications.findIndex(
                            (m) =>
                              m.name.toLowerCase() === med.name.toLowerCase() && med.name !== '',
                          ) < index;
                        const isDuplicateHistory =
                          med.name !== '' &&
                          activeMeds.some(
                            (m: any) => m.name.toLowerCase() === med.name.toLowerCase(),
                          );
                        const hasWarning =
                          isAllergyConflict || isDuplicateCurrent || isDuplicateHistory;

                        return (
                          <div
                            key={index}
                            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 rounded-lg border items-center ${hasWarning ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}
                          >
                            <div className="relative w-full">
                              <Label htmlFor={`med-name-${index}`} className="sr-only">
                                Medicine Name
                              </Label>
                              <Input
                                id={`med-name-${index}`}
                                placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                                value={med.name}
                                onChange={(e) => {
                                  const newMeds = [...medications];
                                  newMeds[index].name = e.target.value;
                                  setMedications(newMeds);
                                }}
                                className={`w-full bg-white touch-target ${hasWarning ? 'border-amber-400 focus-visible:ring-amber-500' : ''}`}
                              />
                              {hasWarning && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 cursor-help">
                                        <AlertCircle className="w-4 h-4" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-amber-100 text-amber-900 border-amber-200">
                                      <p className="font-medium text-sm">Clinical Warning:</p>
                                      <ul className="text-xs list-disc pl-4 mt-1">
                                        {isAllergyConflict && (
                                          <li>
                                            Patient has documented allergy to this drug class.
                                          </li>
                                        )}
                                        {isDuplicateCurrent && (
                                          <li>Duplicate drug in current prescription.</li>
                                        )}
                                        {isDuplicateHistory && (
                                          <li>Patient is already on this active medication.</li>
                                        )}
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="w-full">
                              <Label htmlFor={`med-dosage-${index}`} className="sr-only">
                                Dosage
                              </Label>
                              <Input
                                id={`med-dosage-${index}`}
                                placeholder="Dosage (1 tab)"
                                value={med.dosage}
                                onChange={(e) => {
                                  const newMeds = [...medications];
                                  newMeds[index].dosage = e.target.value;
                                  setMedications(newMeds);
                                }}
                                className="w-full bg-white touch-target"
                              />
                            </div>
                            <div className="w-full">
                              <Label htmlFor={`med-frequency-${index}`} className="sr-only">
                                Frequency
                              </Label>
                              <Select
                                value={med.frequency}
                                onValueChange={(v: string) => {
                                  const newMeds = [...medications];
                                  newMeds[index].frequency = v;
                                  setMedications(newMeds);
                                }}
                              >
                                <SelectTrigger
                                  id={`med-frequency-${index}`}
                                  className="w-full bg-white touch-target"
                                >
                                  <SelectValue placeholder="Freq" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="OD">OD (1/day)</SelectItem>
                                  <SelectItem value="BD">BD (2/day)</SelectItem>
                                  <SelectItem value="TDS">TDS (3/day)</SelectItem>
                                  <SelectItem value="SOS">SOS (As needed)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-full flex items-center gap-2">
                              <Label htmlFor={`med-duration-${index}`} className="sr-only">
                                Duration
                              </Label>
                              <Input
                                id={`med-duration-${index}`}
                                placeholder="Duration (5 days)"
                                value={med.duration}
                                onChange={(e) => {
                                  const newMeds = [...medications];
                                  newMeds[index].duration = e.target.value;
                                  setMedications(newMeds);
                                }}
                                className="w-full bg-white touch-target"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setMedications(medications.filter((_, i) => i !== index));
                                }}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 touch-target flex-shrink-0"
                                aria-label="Remove Medicine"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.1)]">
              <Button
                variant="outline"
                disabled={loading}
                className="min-h-[44px] w-full sm:w-auto"
              >
                Save Draft
              </Button>
              <Button
                onClick={() => setShowConfirm(true)}
                disabled={loading || activeAppointment.status === 'COMPLETED'}
                className="bg-blue-600 hover:bg-blue-700 min-h-[44px] w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2 shrink-0" />
                {loading ? 'Saving...' : 'Complete Consultation'}
              </Button>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Complete Consultation?</DialogTitle>
                  <DialogDescription>
                    This will finalize the consultation for {activeAppointment.patient?.name}. The
                    prescription will be sent to the pharmacy, and lab orders will be sent to
                    diagnostics. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirm(false)}
                    className="min-h-[44px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 min-h-[44px]"
                  >
                    {loading ? 'Confirming...' : 'Yes, Complete Consultation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* RIGHT: Patient History Sidebar */}
      <div className="lg:col-span-3 h-full overflow-y-auto border-l pl-4 hidden lg:block pb-10">
        {renderHistory()}
      </div>
    </div>
  );
}
