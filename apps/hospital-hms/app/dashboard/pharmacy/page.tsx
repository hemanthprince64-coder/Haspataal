import { requireHospitalStaff } from '@haspataal/auth';
import { prisma } from '@haspataal/db';
import { Card, CardContent } from '@haspataal/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@haspataal/ui';

import Link from 'next/link';

export default async function PharmacyDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // Use session_user to get context. We assume requireHospitalStaff exists and returns { hospitalId, ... }
  // Since we don't have the exact auth mock here, let's just query securely.
  const user = await requireHospitalStaff('session_user');
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams.tab || 'pending';

  // Fetch all relevant executions for the pharmacist dashboard
  const executions = await prisma.pharmacyExecution.findMany({
    where: {
      hospitalId: user.hospitalId,
      status: { in: ['PENDING_VERIFICATION', 'VERIFIED', 'PARTIALLY_DISPENSED', 'FULLY_DISPENSED', 'CANCELLED'] },
    },
    include: {
      clinicalOrder: {
        include: {
          patient: true,
          doctor: true,
        },
      },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const filterByStatus = (statuses: string[]) =>
    executions.filter((e) => statuses.includes(e.status));

  const renderTable = (data: typeof executions) => {
    if (data.length === 0) {
      return <div className="text-center py-8 text-slate-500">No records found.</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((execution) => (
              <tr key={execution.id} className="border-b">
                <td className="px-4 py-3">{new Date(execution.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium">
                  {execution.clinicalOrder?.patient?.name || 'Unknown'}
                </td>
                <td className="px-4 py-3">{execution.clinicalOrder?.doctor?.fullName || 'Unknown'}</td>
                <td className="px-4 py-3">{execution.items.length} items</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                    {execution.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/pharmacy/${execution.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pharmacy Dashboard</h1>
        <p className="text-slate-500">Manage prescriptions, verification, and dispensing.</p>
      </div>

      <Tabs defaultValue={activeTab}>
        <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto flex flex-wrap">
          <TabsTrigger
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent py-3 px-4"
          >
            Pending Verification
          </TabsTrigger>
          <TabsTrigger
            value="verified"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent py-3 px-4"
          >
            Verified
          </TabsTrigger>
          <TabsTrigger
            value="partially_dispensed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent py-3 px-4"
          >
            Partially Dispensed
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent py-3 px-4"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent py-3 px-4"
          >
            Cancelled
          </TabsTrigger>
        </TabsList>

        <div className="pt-6">
          <Card>
            <CardContent className="pt-6">
              <TabsContent value="pending" className="m-0">
                {renderTable(filterByStatus(['PRESCRIBED']))}
              </TabsContent>
              <TabsContent value="verified" className="m-0">
                {renderTable(filterByStatus(['VERIFIED']))}
              </TabsContent>
              <TabsContent value="partially_dispensed" className="m-0">
                {renderTable(filterByStatus(['PARTIALLY_DISPENSED']))}
              </TabsContent>
              <TabsContent value="completed" className="m-0">
                {renderTable(filterByStatus(['DISPENSED']))}
              </TabsContent>
              <TabsContent value="cancelled" className="m-0">
                {renderTable(filterByStatus(['CANCELLED']))}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
