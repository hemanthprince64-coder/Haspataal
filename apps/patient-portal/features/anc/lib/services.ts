import { prisma } from '@/lib/util/prisma-singleton';
import { calculateGestationalAge, calculateEdd } from './gestational-age';
import { evaluateHighRisk } from './high-risk';
import { predictDropoutRisk } from './retention';

/* ------------------------------------------------------------------ */
/*  ANC Service Layer – Phase 0                                       */
/* ------------------------------------------------------------------ */

export const ancService = {
  /* ── Pregnancy Profile ─────────────────────────────────────────── */

  async getProfile(patientId: string) {
    return await prisma.pregnancyProfile.findUnique({
      where: { patientId },
      include: {
        visits: { orderBy: { visitDate: 'asc' } },
        supplements: true,
        obstetricHistory: true,
        mcpCard: true,
        retentionAlerts: { where: { status: 'pending' } },
      },
    });
  },

  async upsertProfile(patientId: string, data: any) {
    const profile = await prisma.pregnancyProfile.upsert({
      where: { patientId },
      update: { ...data, updatedAt: new Date() },
      create: { patientId, ...data },
    });

    // Auto-recalc GA and EDD when LMP changes
    if (data.lmp) {
      const ga = calculateGestationalAge(new Date(data.lmp));
      const edd = calculateEdd(new Date(data.lmp));
      await prisma.pregnancyProfile.update({
        where: { id: profile.id },
        data: { gestationalAge: ga, edd },
      });
    }

    return profile;
  },

  /* ── ANC Visit ─────────────────────────────────────────────────── */

  async createVisit(data: {
    pregnancyId: string;
    visitNumber: number;
    visitDate: Date;
    gestationalAge?: number;
    bpSystolic?: number;
    bpDiastolic?: number;
    weightKg?: number;
    fundalHeightCm?: number;
    fetalHeartRate?: number;
    edema?: string;
    presentation?: string;
    hemoglobin?: number;
    urineAlbumin?: string;
    bloodSugar?: number;
    nextVisitDate?: Date;
    highRiskNotes?: string;
    conductedBy?: string;
    conductedByRole?: string;
    hospitalId?: string;
  }) {
    const visit = await prisma.ancVisit.create({ data });

    // Update high-risk status and retention score after each visit
    await this.refreshRiskAndRetention(data.pregnancyId);

    return visit;
  },

  async getVisits(pregnancyId: string) {
    return await prisma.ancVisit.findMany({
      where: { pregnancyId },
      orderBy: { visitDate: 'asc' },
    });
  },

  /* ── Supplement / IFA / TT Tracker ──────────────────────────────── */

  async initSupplements(pregnancyId: string) {
    const defaults = [
      { supplementType: 'IFA', targetDose: 180, doseUnit: 'tablet', startDate: new Date() },
      { supplementType: 'Calcium', targetDose: 90, doseUnit: 'tablet', startDate: new Date() },
      { supplementType: 'Folic Acid', targetDose: 90, doseUnit: 'tablet', startDate: new Date() },
    ];

    return await prisma.$transaction(
      defaults.map((s) =>
        prisma.ancSupplementLog.create({
          data: { pregnancyId, ...s },
        }),
      ),
    );
  },

  async logSupplementDose(pregnancyId: string, supplementType: string, count: number = 1) {
    const log = await prisma.ancSupplementLog.findUnique({
      where: { id: `${pregnancyId}_${supplementType}` },
    });

    if (!log) return null;

    return await prisma.ancSupplementLog.update({
      where: { id: `${pregnancyId}_${supplementType}` },
      data: { dosesTaken: { increment: count } },
    });
  },

  async getSupplements(pregnancyId: string) {
    return await prisma.ancSupplementLog.findMany({
      where: { pregnancyId },
    });
  },

  /* ── MCP Card ──────────────────────────────────────────────────── */

  async generateMcpCard(pregnancyId: string, cardData: any) {
    // Simple QR code generation placeholder – real implementation
    // would use a QR library like `qrcode` to generate a data URL.
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      JSON.stringify({ pregnancyId, cardData }),
    )}&size=200x200`;

    return await prisma.mcpCard.upsert({
      where: { pregnancyId },
      update: { cardData, qrCodeUrl },
      create: { pregnancyId, cardData, qrCodeUrl },
    });
  },

  /* ── Risk & Retention Refresh ─────────────────────────────────── */

  async refreshRiskAndRetention(pregnancyId: string) {
    const profile = await prisma.pregnancyProfile.findUnique({
      where: { id: pregnancyId },
      include: { visits: true, supplements: true },
    });

    if (!profile) return;

    // High-risk evaluation
    const riskResult = evaluateHighRisk(profile);
    if (riskResult.isHighRisk) {
      await prisma.pregnancyProfile.update({
        where: { id: pregnancyId },
        data: {
          highRisk: true,
          highRiskReasons: riskResult.reasons,
        },
      });
    }

    // Dropout risk scoring
    const dropoutScore = predictDropoutRisk(profile);
    await prisma.pregnancyProfile.update({
      where: { id: pregnancyId },
      data: { dropoutRiskScore: dropoutScore },
    });
  },

  /* ── Retention Alerts ──────────────────────────────────────────── */

  async scheduleRetentionAlert(pregnancyId: string, alertType: string, scheduledAt: Date, message: string) {
    return await prisma.ancRetentionAlert.create({
      data: {
        pregnancyId,
        alertType,
        triggerEvent: alertType,
        scheduledAt,
        message,
        status: 'pending',
      },
    });
  },

  async getPendingAlerts(pregnancyId: string) {
    return await prisma.ancRetentionAlert.findMany({
      where: { pregnancyId, status: 'pending' },
      orderBy: { scheduledAt: 'asc' },
    });
  },
};
