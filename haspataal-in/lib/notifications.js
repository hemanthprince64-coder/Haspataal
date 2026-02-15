import { addNotificationJob } from './queue';

export async function sendSMS(to, message) {
    try {
        await addNotificationJob('notification', { type: 'sms', to, message });
        console.log(`[Queue] Added SMS job for ${to}`);
    } catch (e) {
        console.error('Queue Error', e);
        // Fallback to direct log if queue fails?
        console.log(`[SMS Fallback] To: ${to} | Message: ${message}`);
    }
    return true;
}

export async function sendWhatsApp(to, templateId, variables) {
    try {
        await addNotificationJob('notification', { type: 'whatsapp', to, templateId, variables });
        console.log(`[Queue] Added WhatsApp job for ${to}`);
    } catch (e) { console.error(e); }
    return true;
}

export async function sendEmail(to, subject, html) {
    try {
        await addNotificationJob('notification', { type: 'email', to, subject, html });
        console.log(`[Queue] Added Email job for ${to}`);
    } catch (e) { console.error(e); }
    return true;
}
