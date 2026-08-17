/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { getHospitalFacilities, updateHospitalFacilities } from '@/app/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@haspataal/ui';
import { Input } from '@haspataal/ui';
import { Button } from '@haspataal/ui';
import { Checkbox } from '@haspataal/ui';
import { Label } from '@haspataal/ui/label';
import { Building2, Save } from 'lucide-react';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    const res = await getHospitalFacilities();
    if (res.success) setFacilities(res.data || {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await updateHospitalFacilities(null, formData);
    if (res.success) alert('Saved!');
  };

  const facilityFlags = [
    { name: 'icuAvailable', label: 'ICU Available' },
    { name: 'nicuAvailable', label: 'NICU Available' },
    { name: 'emergency24x7', label: '24x7 Emergency' },
    { name: 'ambulanceAvailable', label: 'Ambulance Service' },
    { name: 'pharmacyAvailable', label: 'Pharmacy' },
    { name: 'labAvailable', label: 'In-house Lab' },
  ];

  return (
    <div className="animate-fade-in p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Building2 className="h-6 w-6" />
        Facility Management
      </h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-6">
            {facilityFlags.map((flag) => (
              <div key={flag.name} className="flex items-center gap-3">
                <Checkbox
                  id={flag.name}
                  name={flag.name}
                  defaultChecked={facilities?.[flag.name]}
                />
                <Label htmlFor={flag.name} className="font-medium cursor-pointer">
                  {flag.label}
                </Label>
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="otCount">Operating Theatres (OT) Count</Label>
              <Input
                id="otCount"
                name="otCount"
                type="number"
                defaultValue={facilities?.otCount || 0}
              />
            </div>

            <Button type="submit" className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
