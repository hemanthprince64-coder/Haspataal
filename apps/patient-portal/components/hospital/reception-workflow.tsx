/* eslint-disable */
'use client';

import { ShieldAlert, UserPlus, Clock, Printer, Keyboard, Activity } from 'lucide-react';
import { toast } from 'sonner';

import { useState, useEffect, FormEvent } from 'react';

import SyncStatusIndicator from '@/components/hospital/sync-status-indicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { syncQueue } from '@/lib/offline/sync-queue';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  fee: number;
}

export default function ReceptionWorkflow() {
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [generatedUhid, setGeneratedUhid] = useState('');

  const [formData, setFormData] = useState({
    patientName: '',
    patientMobile: '',
    age: '',
    gender: 'M',
    doctorId: '',
  });

  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    // Generate a temporary pseudo-UHID just for the UI
    setGeneratedUhid(`UHID-${Math.floor(100000 + Math.random() * 900000)}`);

    // Fetch available doctors
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/hospital/doctors');
        if (res.ok) {
          const data = await res.json();
          const mappedDoctors = (data.doctors || []).map((d: any) => ({
            ...d,
            fee: d.consultationFee || 0,
          }));
          setDoctors(mappedDoctors);
        }
      } catch (e) {
        console.error('Failed to fetch doctors', e);
      }
    };
    fetchDoctors();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsEmergency(false);
        setFormData({ patientName: '', patientMobile: '', age: '', gender: 'M', doctorId: '' });
        setReceipt(null);
        document.getElementById('patientName')?.focus();
        toast.info('New Patient mode activated (Alt+N)');
      }
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsEmergency(true);
        setFormData({ ...formData, patientName: 'Unknown Emergency', patientMobile: '' });
        document.getElementById('age')?.focus();
        toast.error('Emergency mode activated (Alt+E)');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmergency && (!formData.patientName || !formData.patientMobile || !formData.doctorId)) {
      toast.error('Please fill all mandatory fields');
      return;
    }
    if (isEmergency && !formData.doctorId) {
      toast.error('Doctor must be selected for emergency assignment');
      return;
    }

    setLoading(true);
    const payload = { ...formData, isEmergency, uhid: generatedUhid };
    try {
      const res = await fetch('/api/hospital/reception/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Registration failed');

      const data = await res.json();
      toast.success(
        isEmergency ? 'Emergency Registration Successful!' : 'Patient Registered Successfully!',
      );
      setReceipt({
        visitId: data.visit.id,
        uhid: generatedUhid,
        patientName: data.patient.name,
        doctor: doctors.find((d) => d.id === formData.doctorId)?.name || 'N/A',
        amount: data.visit.amount,
        isEmergency,
      });
    } catch (err: any) {
      if (!navigator.onLine || err instanceof TypeError) {
        await syncQueue.enqueue({
          url: '/api/hospital/reception/register',
          method: 'POST',
          payload,
        });
        toast.info('Offline mode: Registration saved locally and will sync when online.');
        setFormData({ patientName: '', patientMobile: '', age: '', gender: 'M', doctorId: '' });
        setIsEmergency(false);
      } else {
        toast.error(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
    // After printing, reset form for next patient
    setIsEmergency(false);
    setFormData({ patientName: '', patientMobile: '', age: '', gender: 'M', doctorId: '' });
    setReceipt(null);
    setGeneratedUhid(`UHID-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  if (receipt) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card
          className={`border-t-4 ${receipt.isEmergency ? 'border-t-red-500' : 'border-t-teal-500'}`}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Registration Complete</CardTitle>
            <p className="text-sm text-slate-500">Visit # {receipt.visitId.slice(0, 8)}</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Patient</span>
                <span className="font-bold text-slate-900">{receipt.patientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">UHID</span>
                <span className="font-mono font-semibold">{receipt.uhid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Doctor</span>
                <span className="font-medium">{receipt.doctor}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total Fee</span>
                <span className="text-emerald-600">₹{receipt.amount}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button onClick={handlePrint} className="flex-1 bg-teal-600 hover:bg-teal-700">
              <Printer className="w-4 h-4 mr-2" /> Print & Next
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <SyncStatusIndicator />
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-teal-600" />
            Fast Patient Registration
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3" /> Alt+N : New
            </span>
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3" /> Alt+E : Emergency
            </span>
          </p>
        </div>
      </div>

      {!isEmergency && (
        <Button
          variant="destructive"
          className="w-full h-14 text-lg font-bold shadow-md bg-red-600 hover:bg-red-700 animate-in fade-in slide-in-from-top-4"
          onClick={() => {
            setIsEmergency(true);
            setFormData({ ...formData, patientName: 'Unknown Emergency', patientMobile: '' });
            setTimeout(() => document.getElementById('age')?.focus(), 50);
          }}
        >
          <ShieldAlert className="w-6 h-6 mr-3" />
          ACTIVATE EMERGENCY MODE
        </Button>
      )}

      <Card
        className={`overflow-hidden transition-all duration-300 ${isEmergency ? 'border-red-400 ring-4 ring-red-100 bg-red-50/30' : 'border-slate-200'}`}
      >
        {isEmergency && (
          <div className="bg-red-600 text-white p-4 flex justify-between items-center shadow-inner">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6" />
              <div>
                <h2 className="font-bold text-lg leading-none uppercase tracking-wider">
                  Emergency Mode Active
                </h2>
                <p className="text-red-100 text-xs mt-1">
                  Bypassing non-essential demographics. Assign doctor immediately.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => {
                setIsEmergency(false);
                setFormData({
                  patientName: '',
                  patientMobile: '',
                  age: '',
                  gender: 'M',
                  doctorId: '',
                });
              }}
            >
              Cancel Emergency
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Demographics</h2>
              <Badge
                variant="outline"
                className="font-mono bg-slate-50 text-slate-600 border-slate-200"
              >
                UHID: {generatedUhid}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isEmergency && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="patientName">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="patientName"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      required={!isEmergency}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientMobile">
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="patientMobile"
                      type="tel"
                      placeholder="10 digit number"
                      maxLength={10}
                      value={formData.patientMobile}
                      onChange={(e) => setFormData({ ...formData, patientMobile: e.target.value })}
                      required={!isEmergency}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="gender">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v: string) => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger className={isEmergency ? 'border-red-200 bg-red-50' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                    <SelectItem value="U">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">
                  Age (approx) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Years"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  className={isEmergency ? 'border-red-200 bg-red-50' : ''}
                />
              </div>
            </div>

            <h2 className="font-bold text-slate-800 mt-8 mb-6 pb-4 border-b border-slate-100">
              Consultation Assignment
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="doctorId">
                  Assign Doctor / Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(v: string) => setFormData({ ...formData, doctorId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} — {d.speciality} (₹{d.fee})
                      </SelectItem>
                    ))}
                    {doctors.length === 0 && (
                      <SelectItem value="none" disabled>
                        No doctors configured
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setFormData({
                  patientName: '',
                  patientMobile: '',
                  age: '',
                  gender: 'M',
                  doctorId: '',
                });
                setIsEmergency(false);
              }}
            >
              Clear
            </Button>
            <Button
              type="submit"
              className={
                isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'
              }
              disabled={loading || !formData.doctorId}
            >
              <Clock className="w-4 h-4 mr-2" />
              {loading
                ? 'Processing...'
                : isEmergency
                  ? 'Quick Register (Emergency)'
                  : 'Register & Generate Bill'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
