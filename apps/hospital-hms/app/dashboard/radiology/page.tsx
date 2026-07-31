import { requireHospitalStaff } from '@haspataal/auth';
import { prisma } from '@haspataal/db';
import { Card, CardHeader, CardTitle, CardContent } from '@haspataal/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@haspataal/ui';

export default async function RadiologyDashboard() {
  const user = await requireHospitalStaff('session_user');

  // Technician Worklist: Pending imaging studies
  const pendingStudies = await prisma.imagingStudy.findMany({
    where: {
      hospitalId: user.hospitalId,
      status: { in: ['ORDERED', 'SCHEDULED', 'ACCESSIONED', 'IMAGE_ACQUIRED'] }
    },
    include: {
      patient: true,
      clinicalOrder: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Radiologist Worklist: Pending reports
  const pendingReports = await prisma.imagingStudy.findMany({
    where: {
      hospitalId: user.hospitalId,
      status: { in: ['IMAGE_ACQUIRED', 'REPORT_DRAFTED'] }
    },
    include: {
      patient: true,
      reports: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Radiology Department</h1>
        <p className="text-slate-500">Manage imaging orders, acquisitions, and reports.</p>
      </div>

      <Tabs defaultValue="technician">
        <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
          <TabsTrigger 
            value="technician" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent py-3"
          >
            Technician Worklist
          </TabsTrigger>
          <TabsTrigger 
            value="radiologist" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent py-3"
          >
            Radiologist Worklist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technician" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Imaging Studies</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingStudies.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No pending studies found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                      <tr>
                        <th className="px-4 py-3">Patient</th>
                        <th className="px-4 py-3">Modality</th>
                        <th className="px-4 py-3">Accession #</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingStudies.map(study => (
                        <tr key={study.id} className="border-b">
                          <td className="px-4 py-3 font-medium">{study.patient?.name || 'Unknown'}</td>
                          <td className="px-4 py-3">{study.modality}</td>
                          <td className="px-4 py-3">{study.accessionNumber || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                              {study.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {/* Action buttons based on status */}
                            <button className="text-indigo-600 hover:underline">Update Status</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radiologist" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reporting Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingReports.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No pending reports found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                      <tr>
                        <th className="px-4 py-3">Patient</th>
                        <th className="px-4 py-3">Modality</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingReports.map(study => (
                        <tr key={study.id} className="border-b">
                          <td className="px-4 py-3 font-medium">{study.patient?.name || 'Unknown'}</td>
                          <td className="px-4 py-3">{study.modality}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              {study.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-indigo-600 hover:underline">Draft Report</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
