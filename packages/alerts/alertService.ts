import { PrismaClient, AlertSeverity } from '@prisma/client';

export class AlertService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Retrieves a list of alerts with optional filtering
   */
  async getAlerts(
    hospitalId: string,
    options: {
      patientId?: string;
      status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ALL';
      severity?: AlertSeverity;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const where: any = { hospitalId };

    if (options.patientId) where.patientId = options.patientId;

    if (options.severity) where.severity = options.severity;

    if (options.status) {
      if (options.status === 'ACTIVE') {
        where.resolvedAt = null;
        where.acknowledgedAt = null;
      } else if (options.status === 'ACKNOWLEDGED') {
        where.resolvedAt = null;
        where.acknowledgedAt = { not: null };
      } else if (options.status === 'RESOLVED') {
        where.resolvedAt = { not: null };
      }
    } else {
      where.resolvedAt = null;
    }

    const alerts = await this.prisma.clinicalAlert.findMany({
      where,
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
      include: {
        patient: { select: { name: true, phone: true } },
      },
      take: options.limit,
      skip: options.offset,
    });

    const severityMap: Record<string, number> = { CRITICAL: 4, HIGH: 3, WARNING: 2, INFO: 1 };
    alerts.sort((a, b) => {
      const diff = (severityMap[b.severity] || 0) - (severityMap[a.severity] || 0);
      if (diff !== 0) return diff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return alerts;
  }

  /**
   * Retrieves a summary count of alerts
   */
  async getSummary(hospitalId: string) {
    const alerts = await this.prisma.clinicalAlert.findMany({
      where: { hospitalId, resolvedAt: null },
      select: { severity: true, acknowledgedAt: true },
    });

    const summary = {
      critical: 0,
      high: 0,
      warning: 0,
      info: 0,
      active: 0,
      acknowledged: 0,
    };

    for (const alert of alerts) {
      if (alert.acknowledgedAt) summary.acknowledged++;
      else summary.active++;

      switch (alert.severity) {
        case 'CRITICAL':
          summary.critical++;
          break;
        case 'HIGH':
          summary.high++;
          break;
        case 'WARNING':
          summary.warning++;
          break;
        case 'INFO':
          summary.info++;
          break;
      }
    }

    return summary;
  }

  /**
   * Acknowledges an alert
   */
  async acknowledge(alertId: string, hospitalId: string, userId: string, note?: string) {
    const alert = await this.prisma.clinicalAlert.findFirst({
      where: { id: alertId, hospitalId },
    });
    if (!alert) throw new Error('Alert not found');
    if (alert.resolvedAt) throw new Error('Cannot acknowledge a resolved alert');

    return this.prisma.clinicalAlert.update({
      where: { id: alertId },
      data: {
        acknowledgedAt: new Date(),
        acknowledgedBy: userId,
        ackNote: note,
      },
    });
  }

  /**
   * Resolves an alert
   */
  async resolve(alertId: string, hospitalId: string, userId: string, note: string) {
    const alert = await this.prisma.clinicalAlert.findFirst({
      where: { id: alertId, hospitalId },
    });
    if (!alert) throw new Error('Alert not found');

    if (!note || note.trim() === '') {
      throw new Error('Resolution note is required');
    }

    return this.prisma.clinicalAlert.update({
      where: { id: alertId },
      data: {
        resolvedAt: new Date(),
        resolvedBy: userId,
        ackNote: note,
      },
    });
  }

  /**
   * Retrieves the timeline of clinical events and alerts for a patient
   */
  async getTimeline(patientId: string, hospitalId: string) {
    const events = await this.prisma.clinicalEvent.findMany({
      where: { patientId, hospitalId },
      orderBy: { createdAt: 'desc' },
    });

    const alerts = await this.prisma.clinicalAlert.findMany({
      where: { patientId, hospitalId },
      orderBy: { createdAt: 'desc' },
    });

    const timeline = [
      ...events.map((e) => ({ ...e, _type: 'EVENT' })),
      ...alerts.map((a) => ({ ...a, _type: 'ALERT' })),
    ];

    timeline.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return timeline;
  }
}