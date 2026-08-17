import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // PHI PROTECTION: Scrub sensitive healthcare data before it leaves the server
  beforeSend(event) {
    // 1. Scrub User PII
    if (event.user) {
      delete event.user.email;
      delete event.user.phone;
    }

    // 2. Scrub Request Body (Sensitive fields in breadcrumbs or extra context)
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
    
    if (event.breadcrumbs) {
      event.breadcrumbs.forEach(breadcrumb => {
        if (breadcrumb.data) scrubObject(breadcrumb.data);
      });
    }

    return event;
  },
});
