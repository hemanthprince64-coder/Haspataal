/* eslint-disable */
'use client';

import { Network, Activity, Clock, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

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

export default function IntegrationObservabilityDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-600" />
            Integration Hub Observability
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitor webhook deliveries, event versioning, and external API health.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-emerald-500">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Global Delivery Rate</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">99.8%</p>
                <p className="text-xs text-slate-400 mt-1">2,412 Events (Last 24h)</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Avg API Latency</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">214ms</p>
                <p className="text-xs text-slate-400 mt-1">External endpoint response</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Retries</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">14</p>
                <p className="text-xs text-amber-600 mt-1">Exponential backoff active</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Dead-Letter Queue</p>
                <p className="text-2xl font-bold text-red-700 mt-1">2</p>
                <p className="text-xs text-red-600 mt-1">Failed after 6 attempts</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Webhook Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target System</TableHead>
                <TableHead>Events Subscribed</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">External LIS Portal</TableCell>
                <TableCell className="text-xs font-mono text-slate-500">
                  LabResultVerified, SampleCollected
                </TableCell>
                <TableCell>
                  <Badge variant="outline">v2</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                    Healthy
                  </Badge>
                </TableCell>
                <TableCell>4m ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Regional Health Registry</TableCell>
                <TableCell className="text-xs font-mono text-slate-500">
                  PatientAdmitted, PatientDischarged
                </TableCell>
                <TableCell>
                  <Badge variant="outline">v1</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                    Healthy
                  </Badge>
                </TableCell>
                <TableCell>12m ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">TPA Claims Clearinghouse</TableCell>
                <TableCell className="text-xs font-mono text-slate-500">InvoiceSettled</TableCell>
                <TableCell>
                  <Badge variant="outline">v1</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                    Timeout Errors
                  </Badge>
                </TableCell>
                <TableCell>2h ago</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
