'use client';

import { ClinicalOrderType, OrderPriority } from '@haspataal/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
} from '@haspataal/ui';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { ClinicalOrdersList } from './ClinicalOrdersList';
import { TimelineSidebar } from './TimelineSidebar';
import { placeClinicalOrder } from './actions';

export default function EMRWorkspaceClient({
  visit,
  encounter,
  clinicalOrders: existingOrders = [],
}: {
  visit: any;
  encounter?: any;
  clinicalOrders?: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Vitals State
  const [vitals, setVitals] = useState({
    weight: '',
    height: '',
    temperature: '',
    pulse: '',
    systolicBp: '',
    diastolicBp: '',
    spo2: '',
  });

  // Notes & Diagnosis
  const [diagnosis, setDiagnosis] = useState('');

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: '', dosage: '', duration: '', instructions: '' },
  ]);

  // Clinical Orders (Lab / Radiology)
  const [clinicalOrders, setClinicalOrders] = useState([
    {
      type: ClinicalOrderType.LAB,
      reason: '',
      priority: OrderPriority.ROUTINE,
      payload: { testName: '' },
    },
  ]);

  // Follow-up
  const [followUp, setFollowUp] = useState({ instructions: '', recommendedDays: '' });

  const handleStartConsultation = async () => {
    setLoading(true);
    await fetch(`/api/hospital/consultations/${visit.id}/start`, { method: 'POST' });
    router.refresh();
    setLoading(false);
  };

  const handleSaveVitals = async () => {
    setLoading(true);
    await fetch(`/api/hospital/consultations/${visit.id}/vitals`, {
      method: 'POST',
      body: JSON.stringify({
        weight: parseFloat(vitals.weight),
        height: parseFloat(vitals.height),
        temperature: parseFloat(vitals.temperature),
        pulse: parseInt(vitals.pulse),
        systolicBp: parseInt(vitals.systolicBp),
        diastolicBp: parseInt(vitals.diastolicBp),
        spo2: parseFloat(vitals.spo2),
      }),
    });
    alert('Vitals saved');
    setLoading(false);
  };

  const handleSaveDiagnosis = async () => {
    setLoading(true);
    await fetch(`/api/hospital/consultations/${visit.id}/diagnosis`, {
      method: 'POST',
      body: JSON.stringify({ content: diagnosis }),
    });
    alert('Diagnosis saved');
    setLoading(false);
  };

  const handlePrescribe = async () => {
    setLoading(true);
    await fetch(`/api/hospital/consultations/${visit.id}/prescribe`, {
      method: 'POST',
      body: JSON.stringify({ items: prescriptions.filter((p) => p.medicineName) }),
    });
    alert('Prescription saved');
    setLoading(false);
  };

  const handlePlaceOrders = async () => {
    if (!encounter) {
      alert('Encounter not found for this visit. Cannot place clinical orders.');
      return;
    }

    startTransition(async () => {
      try {
        for (const order of clinicalOrders) {
          if (order.reason || order.payload?.testName) {
            await placeClinicalOrder(
              encounter.id,
              visit.appointment.patientId,
              visit.hospitalId,
              order.type,
              order.priority,
              order.reason,
              order.payload,
            );
          }
        }
        alert('Clinical Orders placed successfully');
      } catch (err: any) {
        alert(err.message || 'Failed to place orders');
      }
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    const res = await fetch(`/api/hospital/consultations/${visit.id}/complete`, { method: 'POST' });
    if (res.ok) {
      alert('Consultation Completed!');
      router.push('/hospital/dashboard');
    } else {
      alert('Failed to complete');
    }
    setLoading(false);
  };

  const isStarted = visit.currentStage !== 'RECEPTION' && visit.currentStage !== 'TRIAGE';

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <h2 className="text-xl">Patient is checked in and waiting.</h2>
        <Button onClick={handleStartConsultation} disabled={loading} size="lg">
          Start Consultation
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Vitals */}
        <Card>
          <CardHeader>
            <CardTitle>Vitals & Triage</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Weight (kg)</Label>
              <Input
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
              />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input
                value={vitals.height}
                onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
              />
            </div>
            <div>
              <Label>Temp (°C)</Label>
              <Input
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
              />
            </div>
            <div>
              <Label>Pulse (bpm)</Label>
              <Input
                value={vitals.pulse}
                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
              />
            </div>
            <div>
              <Label>Systolic BP</Label>
              <Input
                value={vitals.systolicBp}
                onChange={(e) => setVitals({ ...vitals, systolicBp: e.target.value })}
              />
            </div>
            <div>
              <Label>Diastolic BP</Label>
              <Input
                value={vitals.diastolicBp}
                onChange={(e) => setVitals({ ...vitals, diastolicBp: e.target.value })}
              />
            </div>
            <div>
              <Label>SpO2 (%)</Label>
              <Input
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveVitals} variant="secondary">
                Save Vitals
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnosis & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter clinical notes and diagnosis..."
              rows={4}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
            <Button onClick={handleSaveDiagnosis} variant="secondary">
              Save Notes
            </Button>
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescriptions.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-md"
              >
                <div>
                  <Label>Medicine Name</Label>
                  <Input
                    value={p.medicineName}
                    onChange={(e) => {
                      const n = [...prescriptions];
                      n[i].medicineName = e.target.value;
                      setPrescriptions(n);
                    }}
                  />
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Input
                    placeholder="e.g. 1-0-1"
                    value={p.dosage}
                    onChange={(e) => {
                      const n = [...prescriptions];
                      n[i].dosage = e.target.value;
                      setPrescriptions(n);
                    }}
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g. 5 days"
                    value={p.duration}
                    onChange={(e) => {
                      const n = [...prescriptions];
                      n[i].duration = e.target.value;
                      setPrescriptions(n);
                    }}
                  />
                </div>
                <div>
                  <Label>Instructions</Label>
                  <Input
                    placeholder="e.g. After meals"
                    value={p.instructions}
                    onChange={(e) => {
                      const n = [...prescriptions];
                      n[i].instructions = e.target.value;
                      setPrescriptions(n);
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="flex space-x-4">
              <Button
                onClick={() =>
                  setPrescriptions([
                    ...prescriptions,
                    { medicineName: '', dosage: '', duration: '', instructions: '' },
                  ])
                }
                variant="outline"
              >
                + Add Medicine
              </Button>
              <Button onClick={handlePrescribe} variant="secondary">
                Save Prescriptions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Orders (Lab & Radiology)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clinicalOrders.map((o, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-md"
              >
                <div>
                  <Label>Order Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={o.type}
                    onChange={(e) => {
                      const n = [...clinicalOrders];
                      n[i].type = e.target.value as ClinicalOrderType;
                      setClinicalOrders(n);
                    }}
                  >
                    <option value={ClinicalOrderType.LAB}>Lab</option>
                    <option value={ClinicalOrderType.RADIOLOGY}>Radiology</option>
                  </select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={o.priority}
                    onChange={(e) => {
                      const n = [...clinicalOrders];
                      n[i].priority = e.target.value as OrderPriority;
                      setClinicalOrders(n);
                    }}
                  >
                    <option value={OrderPriority.ROUTINE}>Routine</option>
                    <option value={OrderPriority.URGENT}>Urgent</option>
                    <option value={OrderPriority.STAT}>STAT</option>
                  </select>
                </div>
                <div>
                  <Label>Test Name</Label>
                  <Input
                    placeholder="e.g. CBC, Chest X-Ray"
                    value={o.payload?.testName || ''}
                    onChange={(e) => {
                      const n = [...clinicalOrders];
                      n[i].payload = { ...n[i].payload, testName: e.target.value };
                      setClinicalOrders(n);
                    }}
                  />
                </div>
                <div>
                  <Label>Reason / Notes</Label>
                  <Input
                    placeholder="e.g. Fever for 3 days"
                    value={o.reason}
                    onChange={(e) => {
                      const n = [...clinicalOrders];
                      n[i].reason = e.target.value;
                      setClinicalOrders(n);
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="flex space-x-4">
              <Button
                onClick={() =>
                  setClinicalOrders([
                    ...clinicalOrders,
                    {
                      type: ClinicalOrderType.LAB,
                      priority: OrderPriority.ROUTINE,
                      reason: '',
                      payload: { testName: '' },
                    },
                  ])
                }
                variant="outline"
              >
                + Add Order
              </Button>
              <Button onClick={handlePlaceOrders} variant="secondary" disabled={isPending}>
                {isPending ? 'Placing Orders...' : 'Place Orders'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Clinical Orders */}
        <ClinicalOrdersList orders={existingOrders} />

        {/* Complete */}
        <div className="flex justify-end pt-8">
          <Button
            onClick={handleComplete}
            disabled={loading}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Complete Consultation
          </Button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <TimelineSidebar patientId={visit.patientId} />
      </div>
    </div>
  );
}
