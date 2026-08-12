'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MOCK_ORDERS = [
  { id: '1', patientName: 'John Doe', test: 'CBC', status: 'PENDING_COLLECTION' },
  { id: '2', patientName: 'Jane Smith', test: 'LFT', status: 'PROCESSING' },
  { id: '3', patientName: 'Mike Johnson', test: 'CBC', status: 'AWAITING_VERIFICATION' },
];

export function LaboratoryWorklist() {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Laboratory Worklist</h1>
        <Button>Scan Barcode</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending">Pending Collection</TabsTrigger>
          <TabsTrigger value="collected">Collected</TabsTrigger>
          <TabsTrigger value="accessioned">Accessioned</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="verification">Awaiting Verification</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Orders Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_ORDERS.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.patientName}</TableCell>
                      <TableCell>{order.test}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          {order.status === 'PENDING_COLLECTION' ? 'Collect Sample' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
