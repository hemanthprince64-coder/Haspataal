import { prisma } from '@haspataal/db';
import { NotificationService } from '../notification.service';
import { buildAncMessage } from '../../templates/anc-notification-templates';

interface AncRetentionNotificationPayload {
  pregnancyId: string;
  patientId: string;
  hospitalId: string;
}

/**
 * ANC Retention Notification Dispatcher
 *
 * Reads pending AncRetentionAlert records and enqueues them through
 * the existing NotificationService (which handles curfew, retries, and channel fallback).
 */
export class AncRetentionNotifier {
  /**
   * Process a batch of pending retention alerts for a given pregnancy.
   * Called by a scheduled worker or webhook.
   */
  public static async dispatchPending(pregnancyId: string): Promise<void> {
    const pendingAlerts = await prisma.ancRetentionAlert.findMany({
      where: {
        pregnancyId,
        status: 'PENDING',
        scheduledAt: { lte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    });

    if (pendingAlerts.length === 0) return;

    // Load the pregnancy + patient context
    const pregnancy = await prisma.pregnancyProfile.findUnique({
      where: { id: pregnancyId },
      include: { patient: true },
    });

    if (!pregnancy) return;

    const patient = pregnancy.patient;
    const hospitalId = pregnancy.patientId; // fallback; real impl uses hospital from relations

    for (const alert of pendingAlerts) {
      try {
        await this.enqueueAlert(alert, pregnancy, patient, hospitalId);
        await prisma.ancRetentionAlert.update({
          where: { id: alert.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      } catch (err) {
        console.error(`[AncRetentionNotifier] Failed to dispatch alert ${alert.id}:`, err);
        await prisma.ancRetentionAlert.update({
          where: { id: alert.id },
          data: { status: 'FAILED' },
        });
      }
    }
  }

  /**
   * Dispatch a single retention alert as a notification.
   */
  private static async enqueueAlert(
    alert: any,
    pregnancy: any,
    patient: any,
    hospitalId: string,
  ): Promise<void> {
    const templateKey = this.mapAlertTypeToTemplate(alert.alertType);
    const variables = {
      patient_name: patient.name || 'patient',
      patient_id: patient.id,
      visit_date: new Date(alert.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      week: pregnancy.gestationalAge?.toString() || '?',
      hospital_name: 'Haspataal Hospital',
      phone: '',
      doctor_name: 'your doctor',
      doses_taken: '0',
      target_dose: '180',
      dose_number: '1',
    };

    const message = buildAncMessage(templateKey, variables);

    // Use existing NotificationService (handles curfew + retries + channel fallback)
    await NotificationService.send({
      hospital_id: hospitalId,
      patient_id: patient.id,
      template_key: templateKey,
      variables,
      channel_preference: this.mapChannel(alert.channel),
    });
  }

  private static mapAlertTypeToTemplate(alertType: string): string {
    const mapping: Record<string, string> = {
      MISSED_VISIT_1: 'missed_visit_alert',
      MISSED_VISIT_2: 'missed_visit_alert',
      MISSED_VISIT_3: 'missed_visit_alert',
      MISSED_VISIT_4: 'high_risk_alert',
      IFA_COMPLIANCE_LOW: 'ifa_reminder',
      TT_DUE: 'tt_reminder',
      HIGH_RISK_DETECTED: 'high_risk_alert',
      MCP_CARD_READY: 'mcp_ready',
    };
    return mapping[alertType] || 'anc_visit_reminder';
  }

  private static mapChannel(channel: string): 'whatsapp' | 'sms' | 'push' | 'auto' {
    switch (channel) {
      case 'ASHA_VISIT':
      case 'ANM_CALL':
        return 'sms';
      default:
        return 'auto';
    }
  }

  /**
   * Schedule a retention alert for future delivery.
   * Used by the retention engine after calculating dropout risk.
   */
  public static async scheduleAlerts(
    pregnancyId: string,
    patientId: string,
    hospitalId: string,
  ): Promise<void> {
    const pregnancy = await prisma.pregnancyProfile.findUnique({
      where: { id: pregnancyId },
      include: { visits: { orderBy: { visitDate: 'asc' } } },
    });

    if (!pregnancy) return;

    // Schedule visit reminders based on WHO protocol
    const visitSchedule = [12, 20, 28, 36];
    for (const week of visitSchedule) {
      const visitDate = new Date(pregnancy.edd || new Date());
      visitDate.setDate(visitDate.getDate() - (40 - week) * 7);

      await prisma.ancRetentionAlert.upsert({
        where: {
          id: `${pregnancyId}_visit_${week}w`,
        },
        update: {
          scheduledAt: visitDate,
          message: `ANC visit reminder for week ${week}`,
        },
        create: {
          id: `${pregnancyId}_visit_${week}w`,
          pregnancyId,
          alertType: 'ANC_VISIT_REMINDER',
          triggerEvent: `VISIT_DUE_${week}w`,
          channel: 'sms',
          scheduledAt: visitDate,
          message: `ANC visit reminder for week ${week}`,
        },
      });
    }
  }
}
