'use client';

import { Button } from '@haspataal/ui';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@haspataal/ui';
import { Input } from '@haspataal/ui';
import { Label } from '@haspataal/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@haspataal/ui';
import { CheckCircle2, IndianRupee } from 'lucide-react';

import { useState, useActionState } from 'react';

import { createVisitAction } from '@/app/actions';

const initialState = { message: '', success: false };

export default function BillingForm({ doctors }) {
  const [state, formAction, isPending] = useActionState(createVisitAction, initialState);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const doctor = doctors.find((d) => d.id === selectedDoctor);
  const fee = doctor?.fee || 0;

  if (state?.success) {
    return (
      <Card className="max-w-2xl mx-auto border-l-4 border-l-green-500 animate-fade-in-up">
        <CardContent className="pt-6 text-center">
          <div className="text-4xl mb-4"></div>
          <h2 className="text-green-600 font-bold mb-2">Visit Created!</h2>
          <p className="text-muted-foreground mb-6">{state.message}</p>

          {/* Receipt */}
          <Card className="bg-slate-50 text-left mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">💳 Receipt Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="font-semibold">₹{fee}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-extrabold text-emerald-600">₹{fee}</span>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => window.location.reload()} className="w-full">
            Create Another Visit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2">
        <Card>
          <form action={formAction} className="p-6 space-y-6">
            <h3 className="text-lg font-bold mb-4">Patient Details</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input id="patientName" name="patientName" placeholder="Full name" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientMobile">Mobile *</Label>
                  <Input
                    id="patientMobile"
                    name="patientMobile"
                    type="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" placeholder="Years" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender">
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <hr className="my-6" />

            <h3 className="text-lg font-bold mb-4">Consultation Details</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor *</Label>
                <Select
                  name="doctorId"
                  required
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} — {d.speciality} (₹{d.fee})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {state?.message && !state.success && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{state.message}</span>
                </div>
              )}

              <Button type="submit" disabled={isPending} className="w-full" size="lg">
                {isPending ? 'Creating...' : 'Create Visit & Generate Receipt'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Fee Summary Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Fee Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {selectedDoctor ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-semibold">{doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speciality</span>
                  <span>{doctor?.speciality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation Fee</span>
                  <span className="font-semibold">₹{fee}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-extrabold text-emerald-600">₹{fee}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Select a doctor to see fee details
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
