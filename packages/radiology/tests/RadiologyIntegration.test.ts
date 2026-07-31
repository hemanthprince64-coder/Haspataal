import { describe, it, expect, vi } from 'vitest';
import { PlaceRadiologyOrderUseCase } from '../src/use-cases/PlaceRadiologyOrderUseCase';
import { AccessionStudyUseCase } from '../src/use-cases/AccessionStudyUseCase';
import { AcquireImageUseCase } from '../src/use-cases/AcquireImageUseCase';
import { DraftReportUseCase } from '../src/use-cases/DraftReportUseCase';
import { VerifyReportUseCase } from '../src/use-cases/VerifyReportUseCase';
import { prisma } from '@haspataal/db';

vi.mock('@haspataal/orders', () => ({
  PlaceClinicalOrderUseCase: {
    execute: vi.fn().mockResolvedValue({ success: true, order: { id: 'order-123' } }),
  },
  UpdateClinicalOrderStatusUseCase: {
    execute: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock('@haspataal/db', () => ({
  prisma: {
    imagingStudy: {
      create: vi.fn().mockResolvedValue({ id: 'study-123', status: 'ORDERED', patientId: 'p1', hospitalId: 'h1', encounterId: 'e1' }),
      findUnique: vi.fn().mockResolvedValue({ id: 'study-123', status: 'ORDERED', patientId: 'p1', hospitalId: 'h1', encounterId: 'e1' }),
      update: vi.fn().mockImplementation((args) => Promise.resolve({ ...args.data, id: 'study-123', patientId: 'p1', hospitalId: 'h1', encounterId: 'e1' })),
    },
    radiologyReport: {
      create: vi.fn().mockResolvedValue({ id: 'report-123' }),
      findUnique: vi.fn().mockResolvedValue({ id: 'report-123', study: { id: 'study-123', status: 'REPORT_DRAFTED', patientId: 'p1', hospitalId: 'h1', encounterId: 'e1' } }),
      update: vi.fn().mockResolvedValue({ id: 'report-123', status: 'VERIFIED' }),
    },
  },
}));

vi.mock('@haspataal/timeline', () => ({
  getTimelinePublisher: vi.fn().mockReturnValue({
    publish: vi.fn().mockResolvedValue(true),
  }),
}));

describe('Radiology Integration', () => {
  it('should run through the full lifecycle of a radiology order', async () => {
    // 1. Place Order
    const placeRes = await PlaceRadiologyOrderUseCase.execute({
      encounterId: 'enc-1',
      patientId: 'pat-1',
      hospitalId: 'hosp-1',
      modality: 'X-RAY',
      requestedBy: 'doc-1',
    });
    expect(placeRes.success).toBe(true);

    // 2. Accession Study
    // Mock the state to ORDERED
    prisma.imagingStudy.findUnique = vi.fn().mockResolvedValue({ id: 'study-123', status: 'ORDERED', patientId: 'p1', hospitalId: 'h1', encounterId: 'e1' });
    const accRes = await AccessionStudyUseCase.execute({
      studyId: 'study-123',
      studyInstanceUID: '1.2.3.4.5',
      actorId: 'tech-1',
    });
    expect(accRes.success).toBe(true);
    expect(accRes.study.status).toBe('ACCESSIONED');

    // 3. Acquire Images
    prisma.imagingStudy.findUnique = vi.fn().mockResolvedValue({ id: 'study-123', status: 'ACCESSIONED', patientId: 'p1', hospitalId: 'h1', encounterId: 'e1' });
    const acqRes = await AcquireImageUseCase.execute({
      studyId: 'study-123',
      seriesCount: 2,
      imageCount: 50,
      actorId: 'tech-1',
    });
    expect(acqRes.success).toBe(true);
    expect(acqRes.study.status).toBe('IMAGE_ACQUIRED');

    // 4. Draft Report
    prisma.imagingStudy.findUnique = vi.fn().mockResolvedValue({ id: 'study-123', status: 'IMAGE_ACQUIRED', patientId: 'p1', hospitalId: 'h1', encounterId: 'e1' });
    const draftRes = await DraftReportUseCase.execute({
      studyId: 'study-123',
      findings: 'Bone fracture visible',
      impression: 'Fracture',
      actorId: 'rad-1',
    });
    expect(draftRes.success).toBe(true);
    expect(draftRes.study.status).toBe('REPORT_DRAFTED');

    // 5. Verify Report
    const verifyRes = await VerifyReportUseCase.execute({
      reportId: 'report-123',
      actorId: 'rad-1',
    });
    expect(verifyRes.success).toBe(true);
    expect(verifyRes.study.status).toBe('COMPLETED');
  });
});
