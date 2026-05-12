import { services } from '@/lib/services';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@haspataal/ui';
import ReportActions from './ReportActions';
import { FileText } from 'lucide-react';

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('session_user');

  if (!userCookie) redirect('/login');
  const user = JSON.parse(userCookie.value);

  const visits = services.hospital.getVisits(user.hospitalId);

  return (
    <div className="animate-fade-in">
      <div
        className="flex justify-between items-center flex-wrap gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold mb-1">Visit Reports</h1>
          <p className="text-muted-foreground text-sm">{visits.length} total visits</p>
        </div>
      </div>

      {visits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <CardTitle className="mb-2">No visits recorded</CardTitle>
            <p className="text-muted-foreground text-sm">Create your first OPD visit from the Billing page.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Visit ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date & Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visits.map((v) => {
                  const doctor = services.platform.getDoctorById(v.doctorId);
                  const patient = services.hospital.getPatientById(user.hospitalId, v.patientId);
                  const statusColor =
                    v.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : v.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700';
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">{v.id}</code>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(v.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {new Date(v.date).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <strong>{patient?.name || 'Unknown'}</strong>
                        <br />
                        <span className="text-xs text-muted-foreground">📱 {patient?.mobile || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <strong>{doctor?.name || v.doctorId}</strong>
                        <br />
                        <span className="text-xs text-muted-foreground">{doctor?.speciality || ''}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ReportActions visitId={v.id} status={v.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
