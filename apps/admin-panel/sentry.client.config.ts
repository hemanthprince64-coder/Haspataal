import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // PHI PROTECTION: Scrub sensitive healthcare data on the client before upload
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.phone;
    }

    const scrubList = ['password', 'token', 'dateOfBirth', 'medicalHistory', 'abhaAddress', 'secret', 'authorization'];
    
    const scrubObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key in obj) {
        if (scrubList.includes(key.toLowerCase())) {
          obj[key] = "[REDACTED]";
        } else if (typeof obj[key] === 'object') {
          scrubObject(obj[key]);
        }
      }
    };

    if (event.request && event.request.data) {
      scrubObject(event.request.data);
    }

    return event;
  },
});
