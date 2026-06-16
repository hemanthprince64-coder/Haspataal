import { BookingStatus } from '../../types';
import logger from '../logger';
import { prisma } from '../util/prisma-singleton';
import { CareLifecycleService } from './care-lifecycle';

export class SmsUssdService {
  /**
   * Helper to register patient consent directly in DB
   */
  private static async giveBookingConsent(patientId: string) {
    await prisma.consent.upsert({
      where: {
        patientId_purpose_version: {
          patientId,
          purpose: 'APPOINTMENT_BOOKING',
          version: 1,
        },
      },
      create: {
        patientId,
        purpose: 'APPOINTMENT_BOOKING',
        version: 1,
      },
      update: {
        givenAt: new Date(),
        withdrawnAt: null,
      },
    });
  }

  /**
   * Processes incoming SMS text messages
   */
  static async handleIncomingSMS(from: string, body: string): Promise<string> {
    const trimmed = body.trim().toUpperCase();
    const phone = from.replace(/\D/g, '').slice(-10);

    logger.info({ phone, body }, 'Processing incoming SMS');

    // 1. Confirm or Cancel Appointment
    if (trimmed === 'CONFIRM' || trimmed === '1' || trimmed === 'YES') {
      const patient = await prisma.patient.findUnique({ where: { phone } });
      if (patient) {
        // Find most recent appointment awaiting payment or booked
        const appointment = await prisma.appointment.findFirst({
          where: {
            patientId: patient.id,
            status: { in: [BookingStatus.AWAITING_PAYMENT, BookingStatus.BOOKED] },
          },
          orderBy: { createdAt: 'desc' },
          include: { doctor: true },
        });

        if (appointment) {
          // Grant consent if not already present
          await this.giveBookingConsent(patient.id);

          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: BookingStatus.CONFIRMED },
          });

          return `Haspataal: Your appointment with Dr. ${appointment.doctor.fullName} is CONFIRMED. Thank you!`;
        }

        // Check if there is an active CareJourney for check-in
        const journey = await prisma.careJourney.findFirst({
          where: {
            visit: {
              appointment: {
                patientId: patient.id,
              },
            },
            status: 'ACTIVE',
          },
          orderBy: { createdAt: 'desc' },
        });

        if (journey) {
          const visitDate = new Date(journey.createdAt);
          const now = new Date();
          const currentDay = Math.min(
            Math.max(
              Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
              1,
            ),
            14,
          );

          // Interpret '1' or 'YES' as 'BETTER'
          await CareLifecycleService.submitCheckIn(journey.id, currentDay, 'BETTER');
          return `Haspataal: Thank you. We have recorded your day ${currentDay} status as BETTER. Keep resting!`;
        }
      }
    }

    if (trimmed === 'CANCEL' || trimmed === '2' || trimmed === 'NO') {
      const patient = await prisma.patient.findUnique({ where: { phone } });
      if (patient) {
        const appointment = await prisma.appointment.findFirst({
          where: {
            patientId: patient.id,
            status: {
              in: [BookingStatus.AWAITING_PAYMENT, BookingStatus.BOOKED, BookingStatus.CONFIRMED],
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (appointment) {
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: BookingStatus.CANCELLED },
          });
          return `Haspataal: Your appointment has been cancelled successfully.`;
        }

        // Check if active CareJourney for check-in (interpreting '2' as SAME)
        const journey = await prisma.careJourney.findFirst({
          where: {
            visit: {
              appointment: {
                patientId: patient.id,
              },
            },
            status: 'ACTIVE',
          },
          orderBy: { createdAt: 'desc' },
        });

        if (journey) {
          const visitDate = new Date(journey.createdAt);
          const now = new Date();
          const currentDay = Math.min(
            Math.max(
              Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
              1,
            ),
            14,
          );

          await CareLifecycleService.submitCheckIn(journey.id, currentDay, 'SAME');
          return `Haspataal: Recorded day ${currentDay} check-in as SAME. If symptoms worsen, contact the clinic.`;
        }
      }
    }

    if (trimmed === '3' || trimmed === 'WORSE') {
      const patient = await prisma.patient.findUnique({ where: { phone } });
      if (patient) {
        const journey = await prisma.careJourney.findFirst({
          where: {
            visit: {
              appointment: {
                patientId: patient.id,
              },
            },
            status: 'ACTIVE',
          },
          orderBy: { createdAt: 'desc' },
        });

        if (journey) {
          const visitDate = new Date(journey.createdAt);
          const now = new Date();
          const currentDay = Math.min(
            Math.max(
              Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
              1,
            ),
            14,
          );

          await CareLifecycleService.submitCheckIn(journey.id, currentDay, 'WORSE');
          return `Haspataal Alert: Check-in recorded as WORSE. An escalation notice has been sent to your doctor. Please visit the OPD immediately.`;
        }
      }
    }

    // 2. Structured booking SMS: "BOOK [DoctorName/Speciality] [Today/Tomorrow] [Slot]"
    if (trimmed.startsWith('BOOK')) {
      const parts = body.trim().split(/\s+/);
      if (parts.length < 2) {
        return `To book, reply with: BOOK [DoctorName] [Today/Tomorrow/Date] [Slot (e.g. 10:00)]`;
      }

      const queryName = parts[1];
      const doctor = (await prisma.doctorMaster.findFirst({
        where: {
          fullName: { contains: queryName },
        },
        include: {
          affiliations: {
            where: { isCurrent: true, verificationStatus: 'VERIFIED' },
          },
        },
      })) as any;

      if (!doctor || doctor.affiliations.length === 0) {
        return `Sorry, we could not find doctor "${queryName}" affiliated with Haspataal.`;
      }

      const hospitalId = doctor.affiliations[0].hospitalId;
      let date = new Date();
      if (parts[2]?.toUpperCase() === 'TOMORROW') {
        date.setDate(date.getDate() + 1);
      } else if (parts[2] && parts[2].includes('-')) {
        date = new Date(parts[2]);
      }
      date.setHours(0, 0, 0, 0);

      const slot = parts[3] || '09:00';

      try {
        let patient = await prisma.patient.findUnique({ where: { phone } });
        if (!patient) {
          const tempPassword = Math.random().toString(36).substring(2, 10);
          patient = await prisma.patient.create({
            data: {
              phone,
              name: 'SMS Patient',
              password: tempPassword,
            },
          });
        }

        // Grant consent
        await this.giveBookingConsent(patient.id);

        // Book the appointment
        const appt = await prisma.appointment.create({
          data: {
            patientId: patient.id,
            doctorId: doctor.id,
            hospitalId,
            date,
            slot,
            status: BookingStatus.CONFIRMED,
          },
        });

        return `Haspataal: Booking SUCCESS! Dr. ${doctor.fullName} on ${date.toDateString()} at ${slot}. Token: SMS-${appt.id.substring(0, 4)}`;
      } catch (err: any) {
        logger.error({ err }, 'SMS Booking failed');
        return `Booking failed: ${err.message || 'Slot taken or unavailable.'}`;
      }
    }

    // 3. Triage SMS: "TRIAGE [symptoms...]"
    if (trimmed.startsWith('TRIAGE')) {
      const symptoms = body.substring(6).toLowerCase();
      let classification = 'Mild symptoms.';
      let urgency = 'Routine';

      if (
        symptoms.includes('cough') &&
        (symptoms.includes('week') || symptoms.includes('blood') || symptoms.includes('chest'))
      ) {
        classification = 'Suspected Tuberculosis. Chronic cough.';
        urgency = 'Urgent';
      } else if (
        symptoms.includes('fever') &&
        (symptoms.includes('chill') || symptoms.includes('shiver'))
      ) {
        classification = 'Suspected Malaria. High fever with chills.';
        urgency = 'Urgent';
      } else if (
        symptoms.includes('fever') &&
        (symptoms.includes('week') || symptoms.includes('dark') || symptoms.includes('weight'))
      ) {
        classification = 'Suspected Kala-azar. Prolonged fever.';
        urgency = 'Critical';
      }

      return `Haspataal Triage: [Classification] ${classification} [Urgency] ${urgency}. Recommendation: Please visit Haspataal OPD immediately for diagnostic tests.`;
    }

    // Default reply
    return `Welcome to Haspataal SMS. Options:\n- Reply 1 to CONFIRM your latest appointment.\n- Reply 2 to CANCEL.\n- Send: BOOK [DoctorName] [Today/Tomorrow] [Time] to book.\n- Send: TRIAGE [symptoms] to check symptoms.`;
  }

  /**
   * Processes incoming USSD Session events
   */
  static async handleUSSDRequest(
    sessionId: string,
    phoneNumber: string,
    text: string,
    serviceCode = '*321#',
  ): Promise<string> {
    const phone = phoneNumber.replace(/\D/g, '').slice(-10);
    const path = text ? text.split('*') : [];

    logger.info({ sessionId, phone, path }, 'Processing incoming USSD request');

    // Root Menu
    if (path.length === 0) {
      return `CON Welcome to Haspataal.
1. Book Appointment
2. Triage & Symptoms
3. Recovery Check-in
4. Set Language to Hindi`;
    }

    // 1. Book Appointment Flow
    if (path[0] === '1') {
      const doctors = await prisma.doctorMaster.findMany({
        take: 3,
        include: { affiliations: { where: { isCurrent: true, verificationStatus: 'VERIFIED' } } },
      });

      if (doctors.length === 0) {
        return `END Sorry, there are no doctors available in the system.`;
      }

      if (path.length === 1) {
        let response = `CON Select Doctor:\n`;
        doctors.forEach((d, idx) => {
          response += `${idx + 1}. Dr. ${d.fullName}\n`;
        });
        return response.trim();
      }

      const doctorIdx = parseInt(path[1]) - 1;
      const doctor = doctors[doctorIdx];
      if (!doctor) {
        return `END Invalid doctor selection.`;
      }

      if (path.length === 2) {
        return `CON Select Date for Dr. ${doctor.fullName}:\n1. Today\n2. Tomorrow`;
      }

      const date = new Date();
      if (path[2] === '2') {
        date.setDate(date.getDate() + 1);
      }
      date.setHours(0, 0, 0, 0);

      if (path.length === 3) {
        // Show some hardcoded slots for USSD simplicity
        return `CON Select Slot:\n1. 09:00 AM\n2. 10:00 AM\n3. 11:00 AM\n4. 02:00 PM`;
      }

      const slots = ['09:00', '10:00', '11:00', '14:00'];
      const slotIdx = parseInt(path[3]) - 1;
      const slot = slots[slotIdx] || '09:00';

      if (path.length === 4) {
        return `CON Confirm booking with Dr. ${doctor.fullName} on ${date.toDateString()} at ${slot}?\n1. Confirm\n2. Cancel`;
      }

      if (path[4] === '1') {
        try {
          let patient = await prisma.patient.findUnique({ where: { phone } });
          if (!patient) {
            patient = await prisma.patient.create({
              data: {
                phone,
                name: 'USSD Patient',
                password: Math.random().toString(36).substring(2, 10),
              },
            });
          }

          // Consent
          await this.giveBookingConsent(patient.id);

          const hospitalId = doctor.affiliations[0]?.hospitalId || 'local-hospital-id';

          const appt = await prisma.appointment.create({
            data: {
              patientId: patient.id,
              doctorId: doctor.id,
              hospitalId,
              date,
              slot,
              status: BookingStatus.CONFIRMED,
            },
          });

          return `END Success! Appt booked with Dr. ${doctor.fullName} on ${date.toLocaleDateString()} at ${slot}. Token: USD-${appt.id.substring(0, 4)}`;
        } catch (err: any) {
          return `END Booking failed: ${err.message || 'Slot taken'}`;
        }
      } else {
        return `END Booking cancelled.`;
      }
    }

    // 2. Triage & Symptoms Flow
    if (path[0] === '2') {
      if (path.length === 1) {
        return `CON Do you have a fever?\n1. Yes\n2. No`;
      }

      const hasFever = path[1] === '1';

      if (path.length === 2) {
        return `CON Do you have a persistent cough (> 2 weeks)?\n1. Yes\n2. No`;
      }

      const hasCough = path[2] === '1';

      if (path.length === 3) {
        if (hasFever && hasCough) {
          return `END Alert: Suspected Tuberculosis or Respiratory Infection. Please visit the OPD immediately for a free sputum test.`;
        } else if (hasFever && !hasCough) {
          return `END Alert: Suspected Malaria or Kala-azar. Get blood screening at our clinic.`;
        } else if (!hasFever && hasCough) {
          return `END Recommendation: Mild cough. If persistent for > 2 weeks, get tested.`;
        } else {
          return `END No high-risk symptoms. Stay hydrated and rest.`;
        }
      }
    }

    // 3. Recovery Check-in Flow
    if (path[0] === '3') {
      const patient = await prisma.patient.findUnique({ where: { phone } });
      if (!patient) {
        return `END Patient profile not found for this number.`;
      }

      const journey = await prisma.careJourney.findFirst({
        where: {
          visit: {
            appointment: {
              patientId: patient.id,
            },
          },
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!journey) {
        return `END You have no active recovery plans at this time.`;
      }

      const visitDate = new Date(journey.createdAt);
      const now = new Date();
      const currentDay = Math.min(
        Math.max(Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)) + 1, 1),
        14,
      );

      if (path.length === 1) {
        return `CON Recovery Plan (Day ${currentDay}):\n1. Feeling Better\n2. Feeling Same\n3. Feeling Worse`;
      }

      const statusMap: Record<string, 'BETTER' | 'SAME' | 'WORSE'> = {
        '1': 'BETTER',
        '2': 'SAME',
        '3': 'WORSE',
      };
      const checkInStatus = statusMap[path[1]];
      if (!checkInStatus) {
        return `END Invalid selection.`;
      }

      await CareLifecycleService.submitCheckIn(journey.id, currentDay, checkInStatus);

      if (checkInStatus === 'BETTER') {
        return `END Good to hear! Continue following your recovery plan.`;
      } else if (checkInStatus === 'SAME') {
        return `END Understood. If you don't feel better in 24 hours, contact the doctor.`;
      } else {
        return `END Alert: Escalation notice sent to doctor. Please visit Haspataal OPD immediately.`;
      }
    }

    // 4. Hindi Language Select Flow
    if (path[0] === '4') {
      return `END Haspataal key sevayein Hindi bhasha mein set ho chuki hain. Thank you.`;
    }

    return `END Unknown option.`;
  }
}
