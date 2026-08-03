'use server';

import { requireHospitalStaff } from '@haspataal/auth';
import {
  PlaceRadiologyOrderUseCase,
  ScheduleStudyUseCase,
  AccessionStudyUseCase,
  AcquireImageUseCase,
  DraftReportUseCase,
  VerifyReportUseCase,
} from '@haspataal/radiology';

export async function placeRadiologyOrder(data: {
  encounterId: string;
  patientId: string;
  modality: string;
  reason?: string;
}) {
  const user = await requireHospitalStaff('session_user');

  return PlaceRadiologyOrderUseCase.execute({
    encounterId: data.encounterId,
    patientId: data.patientId,
    hospitalId: user.hospitalId,
    modality: data.modality,
    reason: data.reason,
    requestedBy: user.id,
    actorName: user.name,
    actorRole: user.role,
  });
}

export async function scheduleStudy(data: {
  clinicalOrderId: string;
  modality: string;
  scheduledAt: Date;
}) {
  const user = await requireHospitalStaff('session_user');

  return ScheduleStudyUseCase.execute({
    clinicalOrderId: data.clinicalOrderId,
    modality: data.modality,
    scheduledAt: data.scheduledAt,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });
}

export async function accessionStudy(data: { studyId: string; studyInstanceUID: string }) {
  const user = await requireHospitalStaff('session_user');

  return AccessionStudyUseCase.execute({
    studyId: data.studyId,
    studyInstanceUID: data.studyInstanceUID,
    actorId: user.id,
  });
}

export async function acquireImage(data: {
  studyId: string;
  seriesCount: number;
  imageCount: number;
}) {
  const user = await requireHospitalStaff('session_user');

  return AcquireImageUseCase.execute({
    studyId: data.studyId,
    seriesCount: data.seriesCount,
    imageCount: data.imageCount,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });
}

export async function draftReport(data: {
  studyId: string;
  findings: string;
  impression: string;
  clinicalHistory?: string;
  recommendation?: string;
}) {
  const user = await requireHospitalStaff('session_user');

  return DraftReportUseCase.execute({
    studyId: data.studyId,
    findings: data.findings,
    impression: data.impression,
    clinicalHistory: data.clinicalHistory,
    recommendation: data.recommendation,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });
}

export async function verifyReport(data: { reportId: string }) {
  const user = await requireHospitalStaff('session_user');

  return VerifyReportUseCase.execute({
    reportId: data.reportId,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });
}
