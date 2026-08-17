'use client';

import {
  LineChart,
  BarChart,
  TrendingDown,
  Clock,
  AlertCircle,
  IndianRupee,
  Truck,
} from 'lucide-react';

import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

export default function PharmacyAnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <LineChart className="w-6 h-6 text-teal-600" />
            Pharmacy Analytics & Governance
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Operational insights for inventory management and loss prevention.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Near-Expiry Value</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">₹4.2L</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Expiring within 90 days
                </p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <IndianRupee className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Avg Dispensing TAT</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">4m 12s</p>
                <p className="text-xs text-slate-400 mt-1">Prescription to Handover</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Daily Recon Variance</p>
                <p className="text-2xl font-bold text-red-700 mt-1">-3 Units</p>
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Paracetamol 500mg (Batch C)
                </p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <BarChart className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-indigo-500">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Stock Transfers</p>
                <p className="text-2xl font-bold text-indigo-700 mt-1">12 Pending</p>
                <p className="text-xs text-slate-400 mt-1">Cross-site logistics</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Truck className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Dead Stock Identification (90+ Days No Movement)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Locked Capital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Amoxicillin Clavulanate 625mg</TableCell>
                  <TableCell>AC-9901</TableCell>
                  <TableCell>450 Strips</TableCell>
                  <TableCell className="text-red-600 font-medium">₹67,500</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Pantoprazole 40mg IV</TableCell>
                  <TableCell>PT-112</TableCell>
                  <TableCell>200 Vials</TableCell>
                  <TableCell className="text-red-600 font-medium">₹24,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Predictive Stock-Out Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>30-Day Velocity</TableHead>
                  <TableHead>Days Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Meropenem 1g Injection</TableCell>
                  <TableCell>45 Vials</TableCell>
                  <TableCell>15 Vials/Day</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      3 Days
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ceftriaxone 1g Injection</TableCell>
                  <TableCell>120 Vials</TableCell>
                  <TableCell>20 Vials/Day</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      6 Days
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
