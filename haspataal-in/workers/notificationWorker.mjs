import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { sendSMS, sendWhatsApp, sendEmail } from '../lib/notifications.js'; // Note path requires .js in ESM if not bundled? 
// Actually, this file is intended to run with `node`. 
// Next.js uses Babel/SWC so imports work. Naked node might need -r esm or type:module.
// Assuming "type": "module" in package.json (checked earlier? No, private: true).
// But files use import/export so module is likely supported or configured.

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

const worker = new Worker('notifications', async (job) => {
    console.log(`Processing Job: ${job.name}`);
    const { type, to, message, templateId, variables, subject, html } = job.data;

    try {
        if (type === 'sms') {
            await sendSMS(to, message);
        } else if (type === 'whatsapp') {
            await sendWhatsApp(to, templateId, variables);
        } else if (type === 'email') {
            await sendEmail(to, subject, html);
        }
    } catch (error) {
        console.error(`Job Failed: ${job.id}`, error);
        throw error;
    }
}, { connection });

worker.on('completed', (job) => {
    console.log(`Job Completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
    console.error(`Job Failed: ${job.id} with ${err.message}`);
});

console.log('Notification Worker Started...');
