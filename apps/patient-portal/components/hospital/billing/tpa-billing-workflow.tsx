'use client';

import { Clock, CheckCircle2, AlertCircle, XCircle, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

type ClaimState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PRE_AUTH_PENDING'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'CLAIM_SUBMITTED'
  | 'SETTLED'
  | 'REJECTED'
  | 'PATIENT_PAYABLE';

interface InsuranceClaim {
  id: string;
  patientName: string;
  tpaName: string;
  amountRequested: number;
  amountApproved?: number;
  patientCoPay?: number;
  state: ClaimState;
  createdAt: string;
}

export default function TPABillingWorkflow() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([
    {
      id: 'CLM-1001',
      patientName: 'Rahul Verma',
      tpaName: 'Star Health',
      amountRequested: 45000,
      state: 'PRE_AUTH_PENDING',
      createdAt: '2026-07-19T08:30:00Z',
    },
    {
      id: 'CLM-1002',
      patientName: 'Priya Sharma',
      tpaName: 'HDFC ERGO',
      amountRequested: 12000,
      amountApproved: 10000,
      patientCoPay: 2000,
      state: 'PARTIALLY_APPROVED',
      createdAt: '2026-07-18T14:20:00Z',
    },
    {
      id: 'CLM-1003',
      patientName: 'Amit Singh',
      tpaName: 'Bajaj Allianz',
      amountRequested: 35000,
      state: 'REJECTED',
      createdAt: '2026-07-18T09:15:00Z',
    },
    {
      id: 'CLM-1004',
      patientName: 'Sneha Patel',
      tpaName: 'ICICI Lombard',
      amountRequested: 28000,
      amountApproved: 28000,
      patientCoPay: 0,
      state: 'SETTLED',
      createdAt: '2026-07-15T11:00:00Z',
    },
  ]);

  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [approvedAmount, setApprovedAmount] = useState<string>('');

  const getStateBadge = (state: ClaimState) => {
    switch (state) {
      case 'PRE_AUTH_PENDING':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Pre-Auth Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case 'PARTIALLY_APPROVED':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Partial Approval
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      case 'PATIENT_PAYABLE':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Patient Payable
          </Badge>
        );
      case 'SETTLED':
        return (
          <Badge variant="secondary">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Settled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{state}</Badge>;
    }
  };

  const handleUpdateClaim = (claimId: string, newState: ClaimState, approvedAmt?: number) => {
    setClaims(
      claims.map((c) => {
        if (c.id === claimId) {
          const coPay =
            approvedAmt !== undefined ? c.amountRequested - approvedAmt : c.patientCoPay;
          return { ...c, state: newState, amountApproved: approvedAmt, patientCoPay: coPay };
        }
        return c;
      }),
    );
    toast.success(`Claim ${claimId} updated to ${newState.replace('_', ' ')}`);
    setSelectedClaim(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            TPA & Insurance Claims Desk
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Manage asynchronous billing workflows without blocking clinical care.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>TPA / Insurer</TableHead>
              <TableHead className="text-right">Requested</TableHead>
              <TableHead className="text-right">Approved</TableHead>
              <TableHead className="text-right">Co-Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell className="font-medium text-slate-700">{claim.id}</TableCell>
                <TableCell>{claim.patientName}</TableCell>
                <TableCell>{claim.tpaName}</TableCell>
                <TableCell className="text-right font-mono">
                  ₹{claim.amountRequested.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-emerald-600">
                  {claim.amountApproved !== undefined
                    ? `₹${claim.amountApproved.toLocaleString()}`
                    : '-'}
                </TableCell>
                <TableCell className="text-right font-mono text-orange-600">
                  {claim.patientCoPay !== undefined && claim.patientCoPay > 0
                    ? `₹${claim.patientCoPay.toLocaleString()}`
                    : '-'}
                </TableCell>
                <TableCell>{getStateBadge(claim.state)}</TableCell>
                <TableCell className="text-right">
                  <Dialog
                    open={selectedClaim?.id === claim.id}
                    onOpenChange={(open) => !open && setSelectedClaim(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClaim(claim);
                          setApprovedAmount(claim.amountRequested.toString());
                        }}
                      >
                        Review <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </DialogTrigger>
                    {selectedClaim?.id === claim.id && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Pre-Authorization: {claim.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex justify-between text-sm bg-slate-50 p-3 rounded border">
                            <span className="text-slate-500">Requested Amount:</span>
                            <span className="font-bold">
                              ₹{claim.amountRequested.toLocaleString()}
                            </span>
                          </div>

                          {claim.state === 'PRE_AUTH_PENDING' && (
                            <div className="space-y-2">
                              <Label>TPA Approved Amount (₹)</Label>
                              <Input
                                type="number"
                                value={approvedAmount}
                                onChange={(e) => setApprovedAmount(e.target.value)}
                              />
                              {Number(approvedAmount) < claim.amountRequested && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Patient will be liable for a Co-Pay of ₹
                                  {(
                                    claim.amountRequested - Number(approvedAmount)
                                  ).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2 justify-end mt-6">
                            {claim.state === 'PRE_AUTH_PENDING' && (
                              <>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleUpdateClaim(claim.id, 'REJECTED')}
                                >
                                  Reject Claim
                                </Button>
                                <Button
                                  onClick={() => {
                                    const amt = Number(approvedAmount);
                                    const state =
                                      amt === claim.amountRequested
                                        ? 'APPROVED'
                                        : 'PARTIALLY_APPROVED';
                                    handleUpdateClaim(claim.id, state, amt);
                                  }}
                                >
                                  Save Pre-Auth
                                </Button>
                              </>
                            )}
                            {(claim.state === 'APPROVED' ||
                              claim.state === 'PARTIALLY_APPROVED') && (
                              <Button
                                onClick={() => handleUpdateClaim(claim.id, 'CLAIM_SUBMITTED')}
                              >
                                Mark Claim Submitted
                              </Button>
                            )}
                            {claim.state === 'CLAIM_SUBMITTED' && (
                              <Button onClick={() => handleUpdateClaim(claim.id, 'SETTLED')}>
                                Mark Settled (Payment Rcvd)
                              </Button>
                            )}
                            {claim.state === 'REJECTED' && (
                              <Button
                                onClick={() => handleUpdateClaim(claim.id, 'PATIENT_PAYABLE')}
                              >
                                Convert to Cash Bill
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
