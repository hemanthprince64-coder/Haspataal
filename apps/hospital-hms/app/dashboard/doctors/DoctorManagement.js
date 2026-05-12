'use client';

import { useState, useActionState } from 'react';
import { addDoctorAction, removeDoctorAction } from '@/app/actions';
import { Button } from '@haspataal/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@haspataal/ui';
import { Input } from '@haspataal/ui';
import { Label } from '@haspataal/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@haspataal/ui';
import { Badge } from '@haspataal/ui';
import { Avatar, AvatarFallback } from '@haspataal/ui';
import { UserPlus, Trash2, UserCheck } from 'lucide-react';

const addInitialState = { message: '', success: false };
const removeInitialState = { message: '', success: false };

export default function DoctorManagement({ doctors: initialDoctors }) {
  const [addState, addAction, isAdding] = useActionState(addDoctorAction, addInitialState);
  const [removeState, removeAction, isRemoving] = useActionState(
    removeDoctorAction,
    removeInitialState,
  );
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Add Doctor Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Doctor Management</h2>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'}>
          {showForm ? 'Close Form' : <><UserPlus className="h-4 w-4 mr-2" /> Add New Doctor</>}
        </Button>
      </div>

      {showForm && (
        <Card className="animate-slide-down">
          <CardHeader>
            <CardTitle className="text-lg">Add New Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Doctor Name *</Label>
                  <Input id="name" name="name" placeholder="Dr. Full Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile *</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speciality">Speciality *</Label>
                  <Select name="speciality" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select speciality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Physician">General Physician</SelectItem>
                      <SelectItem value="Gynecology">Gynecology</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="ENT">ENT</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                      <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (yrs)</Label>
                  <Input id="experience" name="experience" type="number" placeholder="Years" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Fee (₹)</Label>
                  <Input id="fee" name="fee" type="number" placeholder="500" defaultValue="500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Default: 123"
                />
              </div>

              {addState?.message && (
                <div className={`p-4 rounded-lg border ${addState.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {addState.success ? '✅' : '⚠️'} {addState.message}
                </div>
              )}

              <Button type="submit" disabled={isAdding} className="w-full">
                {isAdding ? 'Adding...' : 'Add Doctor'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Doctor List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">
          Current Doctors <span className="text-muted-foreground font-normal">({initialDoctors.length})</span>
        </h3>

        {initialDoctors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <CardTitle className="mb-2">No doctors added yet</CardTitle>
              <p className="text-muted-foreground text-sm">Add your first doctor to the hospital.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialDoctors.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100">
                      <AvatarFallback className="text-lg">
                        {doc.name?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{doc.name}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {doc.speciality}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {doc.experience || 0} yrs • ₹{doc.fee}
                      </div>
                    </div>
                  </div>
                  <form action={removeAction}>
                    <input type="hidden" name="doctorId" value={doc.id} />
                    <Button
                      type="submit"
                      disabled={isRemoving}
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {removeState?.message && (
        <div className={`p-4 rounded-lg border mt-4 ${removeState.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {removeState.success ? '✅' : '⚠️'} {removeState.message}
        </div>
      )}
    </div>
  );
}
