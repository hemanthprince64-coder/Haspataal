import { prisma } from '@haspataal/db';
import { ClinicalEventType, AlertSeverity } from '@prisma/client';

export interface AlertRuleContext {
  hospitalId: string;
  patientId: string;
  admissionId?: string | null;
  source?: string;
  payload: any;
}

// Simple rule definitions for MVP. These can be moved to DB or config later.
export const ALERT_RULES = {
  acuity: (
    newAcuity: string,
  ): { severity: AlertSeverity; title: string; message: string } | null => {
    if (newAcuity === 'CRITICAL') {
      return {
        severity: 'CRITICAL',
        title: 'Patient Acuity Critical',
        message: 'Patient clinical acuity changed to CRITICAL.',
      };
    }
    return null;
  },
  albumin: (value: number): { severity: AlertSeverity; title: string; message: string } | null => {
    if (value < 2.0) {
      return {
        severity: 'HIGH',
        title: 'Critical Lab Result',
        message: `Albumin dangerously low: ${value} g/dL (Threshold < 2.0)`,
      };
    }
    return null;
  },
  bp: (
    systolic: number,
    diastolic: number,
  ): { severity: AlertSeverity; title: string; message: string } | null => {
    if (systolic >= 180 || diastolic >= 120) {
      return {
        severity: 'CRITICAL',
        title: 'Severe Hypertension',
        message: `Blood pressure critically high: ${systolic}/${diastolic} mmHg`,
      };
    }
    if (systolic <= 90 || diastolic <= 60) {
      return {
        severity: 'HIGH',
        title: 'Severe Hypotension',
        message: `Blood pressure critically low: ${systolic}/${diastolic} mmHg`,
      };
    }
    return null;
  },
  spo2: (value: number): { severity: AlertSeverity; title: string; message: string } | null => {
    if (value < 90) {
      return {
        severity: 'CRITICAL',
        title: 'Oxygen Desaturation',
        message: `SpO2 critically low: ${value}%`,
      };
    }
    return null;
  },
};

export class AlertEngine {
  /**
   * Deduplicates alerts by checking if an unresolved alert with the same title exists for the patient.
   * If it exists, updates the timestamp. If not, creates a new one.
   */
  private static async createOrUpdateAlert(
    eventId: string,
    ruleResult: { severity: AlertSeverity; title: string; message: string },
    ctx: AlertRuleContext,
  ) {
    const existingAlert = await prisma.clinicalAlert.findFirst({
      where: {
        patientId: ctx.patientId,
        title: ruleResult.title,
        resolvedAt: null, // Only check active/unresolved alerts
      },
    });

    if (existingAlert) {
      // Update existing alert instead of duplicating
      return prisma.clinicalAlert.update({
        where: { id: existingAlert.id },
        data: {
          updatedAt: new Date(),
          eventId: eventId, // Link to latest event
          message: ruleResult.message, // Update message if value changed slightly
          severity: ruleResult.severity, // Update severity if it escalated
        },
      });
    }

    // Create new alert
    return prisma.clinicalAlert.create({
      data: {
        hospitalId: ctx.hospitalId,
        patientId: ctx.patientId,
        eventId: eventId,
        severity: ruleResult.severity,
        title: ruleResult.title,
        message: ruleResult.message,
        source: ctx.source || 'SYSTEM',
      },
    });
  }

  static async processAcuityChange(ctx: AlertRuleContext, newAcuity: string) {
    const alertData = ALERT_RULES.acuity(newAcuity);

    // Always log the event, even if it doesn't trigger an alert
    const event = await prisma.clinicalEvent.create({
      data: {
        hospitalId: ctx.hospitalId,
        patientId: ctx.patientId,
        admissionId: ctx.admissionId,
        eventType: ClinicalEventType.ACUITY_CHANGE,
        payload: ctx.payload,
        source: ctx.source,
      },
    });

    if (alertData) {
      await this.createOrUpdateAlert(event.id, alertData, ctx);
    }

    // Auto-resolve Acuity alerts if acuity improves
    if (newAcuity !== 'CRITICAL') {
      await prisma.clinicalAlert.updateMany({
        where: {
          patientId: ctx.patientId,
          title: 'Patient Acuity Critical',
          resolvedAt: null,
        },
        data: {
          resolvedAt: new Date(),
          resolvedBy: ctx.source || 'SYSTEM',
        },
      });
    }
  }

  static async processLabResult(ctx: AlertRuleContext, testName: string, value: number) {
    let alertData = null;

    const normalizedTest = testName.toLowerCase();
    if (normalizedTest.includes('albumin')) {
      alertData = ALERT_RULES.albumin(value);
    }
    // other tests can be added here...

    const event = await prisma.clinicalEvent.create({
      data: {
        hospitalId: ctx.hospitalId,
        patientId: ctx.patientId,
        admissionId: ctx.admissionId,
        eventType: ClinicalEventType.LAB_RESULT,
        payload: ctx.payload,
        source: ctx.source,
      },
    });

    if (alertData) {
      await this.createOrUpdateAlert(event.id, alertData, ctx);
    }
  }

  static async processVitalSign(ctx: AlertRuleContext, type: string, value: number | string) {
    let alertData = null;

    const normalizedType = type.toLowerCase();

    if (normalizedType === 'bp' && typeof value === 'string') {
      const [sys, dia] = value.split('/').map(Number);
      if (!isNaN(sys) && !isNaN(dia)) {
        alertData = ALERT_RULES.bp(sys, dia);
      }
    } else if (normalizedType === 'spo2' && typeof value === 'number') {
      alertData = ALERT_RULES.spo2(value);
    }

    const event = await prisma.clinicalEvent.create({
      data: {
        hospitalId: ctx.hospitalId,
        patientId: ctx.patientId,
        admissionId: ctx.admissionId,
        eventType: ClinicalEventType.VITAL_SIGN,
        payload: ctx.payload,
        source: ctx.source,
      },
    });

    if (alertData) {
      await this.createOrUpdateAlert(event.id, alertData, ctx);
    }
  }
}
