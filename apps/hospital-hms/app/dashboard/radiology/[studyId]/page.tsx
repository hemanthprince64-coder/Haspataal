import { requireHospitalStaff } from '@haspataal/auth';
import { prisma } from '@haspataal/db';
import { Card, CardHeader, CardTitle, CardContent } from '@haspataal/ui';

import { notFound } from 'next/navigation';

import {
  accessionStudy,
  acquireImage,
  draftReport,
  verifyReport,
} from '../../../actions/radiology';

export default async function StudyDetailsPage({ params }: { params: Promise<{ studyId: string }> }) {
  const user = await requireHospitalStaff('session_user');
  const { studyId } = await params;

  const study = await prisma.imagingStudy.findUnique({
    where: { id: studyId, hospitalId: user.hospitalId },
    include: {
      patient: true,
      clinicalOrder: true,
      reports: true,
    },
  });

  if (!study) {
    return notFound();
  }

  const report = study.reports?.[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Study: {study.accessionNumber || study.id}
        </h1>
        <p className="text-slate-500">
          Patient: {study.patient?.name} | Modality: {study.modality} | Status: {study.status}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {study.status === 'SCHEDULED' && (
            <form
              action={async (formData) => {
                'use server';
                await accessionStudy({
                  studyId: study.id,
                  studyInstanceUID: formData.get('uid') as string,
                });
              }}
              className="flex gap-4"
            >
              <input
                name="uid"
                placeholder="Study Instance UID (DICOM)"
                required
                className="border p-2 rounded"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Accession Study
              </button>
            </form>
          )}

          {study.status === 'ACCESSIONED' && (
            <form
              action={async (formData) => {
                'use server';
                await acquireImage({
                  studyId: study.id,
                  seriesCount: parseInt(formData.get('series') as string),
                  imageCount: parseInt(formData.get('images') as string),
                });
              }}
              className="flex gap-4"
            >
              <input
                name="series"
                type="number"
                placeholder="Series Count"
                required
                className="border p-2 rounded"
              />
              <input
                name="images"
                type="number"
                placeholder="Image Count"
                required
                className="border p-2 rounded"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Mark Acquired
              </button>
            </form>
          )}

          {study.status === 'IMAGE_ACQUIRED' && (
            <form
              action={async (formData) => {
                'use server';
                await draftReport({
                  studyId: study.id,
                  findings: formData.get('findings') as string,
                  impression: formData.get('impression') as string,
                });
              }}
              className="space-y-4"
            >
              <textarea
                name="findings"
                placeholder="Findings..."
                required
                className="border p-2 rounded w-full h-32"
              ></textarea>
              <textarea
                name="impression"
                placeholder="Impression..."
                required
                className="border p-2 rounded w-full h-24"
              ></textarea>
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Draft Report
              </button>
            </form>
          )}

          {study.status === 'REPORT_DRAFTED' && report && (
            <div className="space-y-4">
              <div className="p-4 border rounded bg-slate-50">
                <h3 className="font-semibold mb-2">Draft Report</h3>
                <div className="mb-4">
                  <strong>Findings:</strong>
                  <p className="whitespace-pre-wrap">{report.findings}</p>
                </div>
                <div>
                  <strong>Impression:</strong>
                  <p className="whitespace-pre-wrap">{report.impression}</p>
                </div>
              </div>
              <form
                action={async () => {
                  'use server';
                  await verifyReport({ reportId: report.id });
                }}
              >
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Verify & Complete
                </button>
              </form>
            </div>
          )}

          {study.status === 'REPORT_VERIFIED' && report && (
            <div className="p-4 border rounded bg-green-50 text-green-800">
              <h3 className="font-semibold mb-2">Verified Report</h3>
              <div className="mb-4">
                <strong>Findings:</strong>
                <p className="whitespace-pre-wrap">{report.findings}</p>
              </div>
              <div>
                <strong>Impression:</strong>
                <p className="whitespace-pre-wrap">{report.impression}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
