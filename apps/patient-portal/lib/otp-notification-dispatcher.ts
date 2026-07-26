import { logger } from '@haspataal/logger';

type OtpChannel = 'SMS' | 'WHATSAPP' | 'EMAIL';

interface OtpDispatchOptions {
  mobile: string;
  code: string;
  channel?: OtpChannel;
  recipientName?: string;
}

/**
 * Dispatches OTP notifications via the configured channel.
 *
 * Production integration points:
 * - SMS: Twilio / MSG91 / Fast2SMS / TextLocal
 * - WhatsApp: Meta WhatsApp Business API
 * - Email: Resend / AWS SES
 *
 * This module is intentionally decoupled from the full notification worker
 * to avoid blocking the auth service layer. Production deployments should
 * enqueue a job to the notification worker rather than calling adapters directly.
 */
export async function dispatchOtpNotification({
  mobile,
  code,
  channel = 'SMS',
  recipientName,
}: OtpDispatchOptions): Promise<{ success: boolean; provider?: string; error?: string }> {
  const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);
  const name = recipientName || 'Doctor';

  try {
    switch (channel) {
      case 'SMS': {
        const result = await dispatchSms(normalizedMobile, code, name);
        return { success: result.success, provider: result.provider || 'sms', error: result.error };
      }
      case 'WHATSAPP': {
        const result = await dispatchWhatsApp(normalizedMobile, code, name);
        return {
          success: result.success,
          provider: result.provider || 'whatsapp',
          error: result.error,
        };
      }
      case 'EMAIL': {
        const result = await dispatchEmail(normalizedMobile, code, name);
        return {
          success: result.success,
          provider: result.provider || 'email',
          error: result.error,
        };
      }
      default:
        return { success: false, error: `Unsupported channel: ${channel}` };
    }
  } catch (error) {
    logger.error(
      {
        action: 'otp_dispatch_error',
        mobile: normalizedMobile,
        channel,
        error: error instanceof Error ? error.message : String(error),
      },
      'Failed to dispatch OTP notification',
    );
    return { success: false, error: 'Notification dispatch failed' };
  }
}

async function dispatchSms(
  mobile: string,
  code: string,
  name: string,
): Promise<{ success: boolean; provider?: string; error?: string }> {
  const provider = process.env.SMS_PROVIDER || 'console';

  switch (provider) {
    case 'twilio': {
      try {
        const twilio = await import('twilio');
        const client = twilio.default(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN,
        );

        await client.messages.create({
          body: `Hi ${name}, your OTP is ${code}. Valid for 5 minutes. - Haspataal`,
          from: process.env.TWILIO_FROM,
          to: `+91${mobile}`,
        });

        logger.info(
          { action: 'otp_sms_sent', mobile, provider: 'twilio' },
          'OTP SMS sent via Twilio',
        );
        return { success: true, provider: 'twilio' };
      } catch (error) {
        logger.error({ action: 'otp_sms_failed', mobile, error }, 'Twilio SMS failed');
        return { success: false, provider: 'twilio', error: 'SMS delivery failed' };
      }
    }

    case 'msg91': {
      try {
        const response = await fetch('https://api.msg91.com/api/v5/flow/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authkey: process.env.MSG91_AUTHKEY || '',
          },
          body: JSON.stringify({
            template_id: process.env.MSG91_OTP_TEMPLATE_ID,
            recipient: mobile,
            var1: code,
            var2: '5',
            sender: process.env.MSG91_SENDER_ID || 'HASPAA',
          }),
        });

        if (!response.ok) {
          throw new Error(`MSG91 API returned ${response.status}`);
        }

        logger.info(
          { action: 'otp_sms_sent', mobile, provider: 'msg91' },
          'OTP SMS sent via MSG91',
        );
        return { success: true, provider: 'msg91' };
      } catch (error) {
        logger.error({ action: 'otp_sms_failed', mobile, error }, 'MSG91 SMS failed');
        return { success: false, provider: 'msg91', error: 'SMS delivery failed' };
      }
    }

    case 'fast2sms': {
      try {
        const response = await fetch(
          'https://www.fast2sms.com/dev/bulkV2/history/otp?authorization=' +
            (process.env.FAST2SMS_API_KEY || '') +
            '&route=otp&numbers=' +
            mobile +
            '&variables_values=' +
            code +
            '&otp_expiry=5',
        );

        if (!response.ok) {
          throw new Error(`Fast2SMS API returned ${response.status}`);
        }

        logger.info(
          { action: 'otp_sms_sent', mobile, provider: 'fast2sms' },
          'OTP SMS sent via Fast2SMS',
        );
        return { success: true, provider: 'fast2sms' };
      } catch (error) {
        logger.error({ action: 'otp_sms_failed', mobile, error }, 'Fast2SMS SMS failed');
        return { success: false, provider: 'fast2sms', error: 'SMS delivery failed' };
      }
    }

    default: {
      // Console fallback for development
      logger.info(
        { action: 'otp_sms_console', mobile, code, provider: 'console' },
        `[DEV OTP] SMS to +91${mobile}: ${code} (valid 5 min)`,
      );
      return { success: true, provider: 'console' };
    }
  }
}

async function dispatchWhatsApp(
  mobile: string,
  code: string,
  name: string,
): Promise<{ success: boolean; provider?: string; error?: string }> {
  const provider = process.env.WHATSAPP_PROVIDER || 'console';

  switch (provider) {
    case 'meta': {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: `+91${mobile}`,
              type: 'template',
              template: {
                name: process.env.WHATSAPP_OTP_TEMPLATE_NAME || 'otp_verification',
                language: { code: 'en_US' },
                components: [
                  {
                    type: 'body',
                    parameters: [
                      { type: 'text', text: name },
                      { type: 'text', text: code },
                      { type: 'text', text: '5' },
                    ],
                  },
                ],
              },
            }),
          },
        );

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`WhatsApp API error: ${response.status} - ${errorBody}`);
        }

        logger.info(
          { action: 'otp_whatsapp_sent', mobile, provider: 'meta' },
          'OTP WhatsApp sent via Meta',
        );
        return { success: true, provider: 'meta' };
      } catch (error) {
        logger.error({ action: 'otp_whatsapp_failed', mobile, error }, 'Meta WhatsApp failed');
        return { success: false, provider: 'meta', error: 'WhatsApp delivery failed' };
      }
    }

    default: {
      logger.info(
        { action: 'otp_whatsapp_console', mobile, code, provider: 'console' },
        `[DEV OTP] WhatsApp to +91${mobile}: ${code} (valid 5 min)`,
      );
      return { success: true, provider: 'console' };
    }
  }
}

async function dispatchEmail(
  email: string,
  code: string,
  name: string,
): Promise<{ success: boolean; provider?: string; error?: string }> {
  const provider = process.env.EMAIL_PROVIDER || 'console';

  switch (provider) {
    case 'resend': {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'Haspataal <noreply@haspataal.com>',
            to: email,
            subject: 'Your Haspataal OTP',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0f766e;">Haspataal Doctor Portal</h2>
                <p>Hi ${name},</p>
                <p>Your one-time password is:</p>
                <div style="background: #f0fdfa; border: 2px dashed #0f766e; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f766e; border-radius: 8px;">
                  ${code}
                </div>
                <p style="color: #64748b;">This OTP is valid for <strong>5 minutes</strong>.</p>
                <p style="color: #94a3b8; font-size: 12px;">If you did not request this OTP, please ignore this email.</p>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Resend API error: ${response.status} - ${errorBody}`);
        }

        logger.info(
          { action: 'otp_email_sent', email, provider: 'resend' },
          'OTP email sent via Resend',
        );
        return { success: true, provider: 'resend' };
      } catch (error) {
        logger.error({ action: 'otp_email_failed', email, error }, 'Resend email failed');
        return { success: false, provider: 'resend', error: 'Email delivery failed' };
      }
    }

    default: {
      logger.info(
        { action: 'otp_email_console', email, code, provider: 'console' },
        `[DEV OTP] Email to ${email}: ${code} (valid 5 min)`,
      );
      return { success: true, provider: 'console' };
    }
  }
}
