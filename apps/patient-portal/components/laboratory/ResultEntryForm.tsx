'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

export function ResultEntryForm({
  template,
  onSubmit,
}: {
  template: any;
  onSubmit: (values: any) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSave = () => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Result Entry: {template?.name || 'CBC'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Result Value</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Reference Range</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(
              template?.parameters || [
                { id: '1', name: 'Hemoglobin', unit: 'g/dL', normalMin: 13, normalMax: 17 },
                { id: '2', name: 'WBC Count', unit: 'x10^9/L', normalMin: 4, normalMax: 11 },
                {
                  id: '3',
                  name: 'Platelet Count',
                  unit: 'x10^9/L',
                  normalMin: 150,
                  normalMax: 450,
                },
              ]
            ).map((param: any) => {
              const val = values[param.id] || '';
              const numVal = parseFloat(val);
              let flagColor = '';
              if (val && !isNaN(numVal)) {
                if (numVal < param.normalMin || numVal > param.normalMax)
                  flagColor = 'text-red-500 font-bold';
              }

              return (
                <TableRow key={param.id}>
                  <TableCell className="font-medium">{param.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={val}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [param.id]: e.target.value }))
                      }
                      className={`w-32 ${flagColor}`}
                      placeholder="Enter value..."
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{param.unit}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {param.normalMin} - {param.normalMax}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline">Save Draft</Button>
        <Button onClick={handleSave}>Submit for Verification</Button>
      </CardFooter>
    </Card>
  );
}
