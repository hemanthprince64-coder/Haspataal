'use client';

import { AlertTriangle } from 'lucide-react';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

export function ResultVerification({
  result,
  onVerify,
  onAmend,
}: {
  result: any;
  onVerify: () => void;
  onAmend: () => void;
}) {
  const hasCritical = result?.values?.some((v: any) => v.isCritical);

  return (
    <Card className={`w-full max-w-4xl ${hasCritical ? 'border-red-500' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Verify Results</CardTitle>
          {hasCritical && (
            <div className="flex items-center text-red-500 font-bold">
              <AlertTriangle className="w-5 h-5 mr-2" />
              CRITICAL VALUES DETECTED
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Range</TableHead>
              <TableHead>Flag</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(
              result?.values || [
                {
                  id: '1',
                  parameterName: 'Hemoglobin',
                  value: '7.4',
                  unit: 'g/dL',
                  referenceRange: '11-15',
                  flag: 'CRITICAL_LOW',
                  isCritical: true,
                },
                {
                  id: '2',
                  parameterName: 'WBC Count',
                  value: '24.0',
                  unit: 'x10^9/L',
                  referenceRange: '4-11',
                  flag: 'HIGH',
                  isCritical: false,
                },
                {
                  id: '3',
                  parameterName: 'Platelet Count',
                  value: '65',
                  unit: 'x10^9/L',
                  referenceRange: '150-450',
                  flag: 'CRITICAL_LOW',
                  isCritical: true,
                },
              ]
            ).map((val: any) => (
              <TableRow
                key={val.id}
                className={val.isCritical ? 'bg-red-50' : val.flag ? 'bg-orange-50' : ''}
              >
                <TableCell className="font-medium">{val.parameterName}</TableCell>
                <TableCell className={`text-right ${val.flag ? 'font-bold' : ''}`}>
                  {val.value}
                </TableCell>
                <TableCell className="text-muted-foreground">{val.unit}</TableCell>
                <TableCell className="text-muted-foreground">{val.referenceRange}</TableCell>
                <TableCell>
                  {val.flag && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${val.isCritical ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}
                    >
                      {val.flag}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onAmend}>
          Amend / Reject
        </Button>
        <Button
          variant="default"
          onClick={onVerify}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Verify & Finalize
        </Button>
      </CardFooter>
    </Card>
  );
}
