import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@haspataal/ui';
import { Input } from '@haspataal/ui';
import { Label } from '@haspataal/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@haspataal/ui';
import { Button } from '@haspataal/ui';
import { UserPlus } from 'lucide-react';

export default async function StaffPage() {
  const session = await auth();
  if (!session || session.user.role !== 'HOSPITAL_ADMIN') redirect('/login');

  const hospitalId = session.user.hospitalId;

  const staffList = await prisma.staff.findMany({
    where: { hospitalId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Manage Staff</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Staff Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createStaff} className="space-y-4">
              <input type="hidden" name="hospitalId" value={hospitalId} />

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Staff Name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  required
                  placeholder="10-digit Mobile"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role">
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                    <SelectItem value="NURSE">Nurse</SelectItem>
                    <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full mt-4">
                Create Staff Account
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Default password will be the mobile number.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Existing Staff</CardTitle>
          </CardHeader>
          <CardContent>
            {staffList.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No staff members found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Mobile</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {staffList.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3">{s.mobile}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            {s.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
