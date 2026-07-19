'use client';

import { Globe, Building2, UserPlus, Shield, Clock, Search, History } from 'lucide-react';
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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

interface GlobalIdentity {
  userId: string;
  name: string;
  email: string;
  phone: string;
  assignments: RoleAssignment[];
}

interface RoleAssignment {
  id: string;
  hospitalId: string;
  hospitalName: string;
  role: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export default function NetworkControlPlane() {
  const [identities, setIdentities] = useState<GlobalIdentity[]>([
    {
      userId: 'USR-901',
      name: 'Dr. Ramesh Sharma',
      email: 'r.sharma@haspataal.local',
      phone: '+91 98765 43210',
      assignments: [
        {
          id: 'ASG-1',
          hospitalId: 'HOSP-A',
          hospitalName: 'Muzaffarpur City Hospital',
          role: 'Senior Consultant (Cardiology)',
          grantedBy: 'Admin',
          grantedAt: '2025-01-10T10:00:00Z',
          status: 'ACTIVE',
        },
        {
          id: 'ASG-2',
          hospitalId: 'HOSP-B',
          hospitalName: 'Patna Central Clinic',
          role: 'Visiting Consultant',
          grantedBy: 'Network Admin',
          grantedAt: '2026-06-01T09:00:00Z',
          status: 'ACTIVE',
        },
        {
          id: 'ASG-3',
          hospitalId: 'HOSP-C',
          hospitalName: 'Darbhanga Rural Annex',
          role: 'Telemedicine Reviewer',
          grantedBy: 'Network Admin',
          grantedAt: '2026-07-01T09:00:00Z',
          expiresAt: '2026-12-31T23:59:59Z',
          status: 'ACTIVE',
        },
      ],
    },
    {
      userId: 'USR-902',
      name: 'Anita Desai',
      email: 'a.desai@haspataal.local',
      phone: '+91 99887 76655',
      assignments: [
        {
          id: 'ASG-4',
          hospitalId: 'HOSP-A',
          hospitalName: 'Muzaffarpur City Hospital',
          role: 'Pharmacy Manager',
          grantedBy: 'Admin',
          grantedAt: '2025-03-15T10:00:00Z',
          status: 'ACTIVE',
        },
      ],
    },
  ]);

  const [selectedUser, setSelectedUser] = useState<GlobalIdentity | null>(null);

  const revokeRole = (userId: string, assignmentId: string) => {
    setIdentities(
      identities.map((user) => {
        if (user.userId === userId) {
          return {
            ...user,
            assignments: user.assignments.map((a) =>
              a.id === assignmentId ? { ...a, status: 'REVOKED' } : a,
            ),
          };
        }
        return user;
      }),
    );
    toast.success(`Role revoked. Audit log updated.`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            Network Control Plane: Global Identity Management
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Manage single user identities across multiple tenant hospitals.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Global Users..."
              className="pl-9 pr-4 py-2 border rounded-md text-sm"
            />
          </div>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" /> Invite Global User
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Global User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Active Assignments</TableHead>
              <TableHead className="text-right">Manage Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {identities.map((user) => {
              const activeCount = user.assignments.filter((a) => a.status === 'ACTIVE').length;
              return (
                <TableRow key={user.userId}>
                  <TableCell>
                    <p className="font-medium text-slate-700">{user.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{user.userId}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{user.email}</p>
                    <p className="text-xs text-slate-500">{user.phone}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                      {activeCount} Hospital{activeCount !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={selectedUser?.userId === user.userId}
                      onOpenChange={(open) => !open && setSelectedUser(null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                          View Tenant Roles
                        </Button>
                      </DialogTrigger>
                      {selectedUser?.userId === user.userId && (
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Shield className="w-5 h-5 text-indigo-600" />
                              Tenant Access Matrix: {user.name}
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            <p className="text-sm text-slate-500">
                              Identity remains global. Permissions remain strictly tenant-scoped
                              (RLS enforced).
                            </p>

                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader className="bg-slate-50">
                                  <TableRow>
                                    <TableHead>Hospital</TableHead>
                                    <TableHead>Assigned Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {user.assignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Building2 className="w-4 h-4 text-slate-400" />
                                          <span className="font-medium text-sm">
                                            {assignment.hospitalName}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <p className="text-sm">{assignment.role}</p>
                                        {assignment.expiresAt && (
                                          <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" /> Expires:{' '}
                                            {new Date(assignment.expiresAt).toLocaleDateString()}
                                          </p>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {assignment.status === 'ACTIVE' ? (
                                          <Badge
                                            variant="outline"
                                            className="bg-emerald-50 text-emerald-700"
                                          >
                                            Active
                                          </Badge>
                                        ) : (
                                          <Badge variant="secondary">Revoked</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {assignment.status === 'ACTIVE' && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 h-8"
                                            onClick={() => revokeRole(user.userId, assignment.id)}
                                          >
                                            Revoke
                                          </Button>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            <div className="bg-slate-50 p-3 rounded text-xs text-slate-500 flex items-start gap-2">
                              <History className="w-4 h-4 mt-0.5" />
                              <p>
                                <strong>Audit Governance:</strong> Every role assignment and
                                revocation is immutably logged with the Identity of the Network
                                Admin, Timestamp, and Justification (Not shown in this view).
                              </p>
                            </div>

                            <Button className="w-full mt-2">
                              <Building2 className="w-4 h-4 mr-2" /> Grant Access to Another
                              Hospital
                            </Button>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
