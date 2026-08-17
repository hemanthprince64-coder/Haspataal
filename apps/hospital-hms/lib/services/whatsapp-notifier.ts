import { prisma } from '@haspataal/db';


// -----------------------------------------------------------------------------
// WHATSAPP NOTIFIER CONNECTOR
// -----------------------------------------------------------------------------
// This service acts strictly as an EVENT LISTENER. Core business logic
// (e.g., Pharmacy, Lab) should never call this directly. They publish domain
// events to the Event Bus, and this connector reacts to them.
// -----------------------------------------------------------------------------

export class WhatsAppNotifierConnector {
  /**
   * Event Listener Entrypoint. Invoked asynchronously by the Event Bus worker.
   */
  async handleDomainEvent(event: any) {
    console.log({ eventType: event.type }, 'WhatsApp Connector received domain event');

    // MOCK: Fetch hospital's WhatsApp API configuration
    const config = await prisma.integrationConfig.findFirst({
      where: {
        hospitalId: event.hospitalId,
        provider: { in: ['WHATSAPP_META', 'WHATSAPP_TWILIO', 'WHATSAPP_WATI'] },
      },
    });

    if (!config) {
      console.debug('No WhatsApp provider configured for this hospital. Ignoring event.');
      return;
    }

    switch (event.type) {
      case 'LAB_RESULT_VERIFIED':
        await this.sendLabReadyMessage(event.payload, config);
        break;

      case 'APPOINTMENT_BOOKED':
        await this.sendAppointmentConfirmation(event.payload, config);
        break;

      default:
        // Not all events map to WhatsApp notifications
        break;
    }
  }

  // --- Message Handlers ---

  private async sendLabReadyMessage(payload: any, config: any) {
    console.log({ accessionId: payload.accessionId }, 'Sending WhatsApp: Lab Results Ready');

    // MOCK: Call the underlying HTTP API using the stored config.webhookSecret/Token
    const message = `Hello! Your lab results for accession ${payload.accessionId} are now ready. You can view them on the Patient Portal.`;

    await this.dispatchToProvider(config.provider, message, payload.patientPhone);
  }

  private async sendAppointmentConfirmation(payload: any, config: any) {
    console.log(
      { appointmentId: payload.appointmentId },
      'Sending WhatsApp: Appointment Confirmed',
    );

    const message = `Hello! Your appointment with Dr. ${payload.doctorName} is confirmed for ${payload.date}.`;

    await this.dispatchToProvider(config.provider, message, payload.patientPhone);
  }

  private async dispatchToProvider(provider: string, message: string, phone: string) {
    // Translates our internal generic request to the specific provider's API shape (Twilio vs Meta vs Wati)
    const maskedPhone = phone.length > 4 ? phone.slice(0, 3) + '******' + phone.slice(-2) : '***';
    console.log({ provider, maskedPhone }, 'Dispatched message to WhatsApp API Provider');

    // 1. HTTP POST to Provider
    // 2. Await HTTP 202 Accepted
    // 3. Log Audit Trail
  }
}

export const whatsappNotifier = new WhatsAppNotifierConnector();
