# API Design Patterns — Haspataal
# Adapted from everything-claude-code `api-design` skill (MIT license)
# Applies to: api.haspataal.com (api-gateway)

## When to Use This Skill
Invoke before:
- Adding new routes to `api-gateway/index.js`
- Designing a new microservice endpoint
- Reviewing an existing API for consistency
- Planning a breaking API change

---

## 1. Standard Response Format (ALWAYS use this)

All routes on `api.haspataal.com` must return this format:

```typescript
// Success
{
  "success": true,
  "data": { ... },         // Actual payload
  "meta": {                // Optional — for paginated lists
    "total": 100,
    "cursor": "next_cursor_value",
    "hasMore": true
  }
}

// Error
{
  "success": false,
  "error": "Human-readable error message",
  "code": "APPOINTMENT_NOT_FOUND",  // Machine-readable code
  "statusCode": 404
}
```

```javascript
// api-gateway helpers
const ok = (res, data, meta) => res.json({ success: true, data, ...(meta && { meta }) });
const err = (res, status, error, code) => res.status(status).json({ success: false, error, code });
```

---

## 2. Route Naming Conventions

```
GET    /v1/doctors                        → List doctors (public, with search params)
GET    /v1/doctors/:id                    → Get single doctor
GET    /v1/doctors/:id/availability       → Get available slots

GET    /v1/patients/:id                   → Get patient profile (auth required)
POST   /v1/appointments                  → Book appointment (auth required)
GET    /v1/appointments/:id              → Get appointment detail
PATCH  /v1/appointments/:id/status       → Update status (confirm/cancel)

GET    /v1/hospitals/:id                 → Get hospital info
GET    /v1/hospitals/:id/patients        → List hospital patients (hospital_admin only)
GET    /v1/hospitals/:id/doctors         → List hospital doctors

GET    /health                           → Health check (public, no auth)
```

Rules:
- Always `/v1/` prefix — enables non-breaking versioning
- Use **nouns**, not verbs (`/appointments`, not `/createAppointment`)
- Use **PATCH** for partial updates, **PUT** only for full replacement
- Nested resources max 2 levels (`/hospitals/:id/patients`)

---

## 3. Input Validation (Zod Required)

```javascript
const { z } = require('zod');

const bookAppointmentSchema = z.object({
  doctorId:    z.string().uuid(),
  hospitalId:  z.string().uuid(),
  scheduledAt: z.string().datetime(),
  notes:       z.string().max(500).optional(),
});

router.post('/v1/appointments', requireAuth, async (req, res) => {
  const parsed = bookAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return err(res, 400, 'Invalid request', 'VALIDATION_ERROR');
  }
  // ... proceed with parsed.data
});
```

---

## 4. Error Codes Reference

Standard error codes for Haspataal API:

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Valid JWT but wrong role/hospital |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `SLOT_UNAVAILABLE` | 409 | Appointment slot already booked |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 5. Pagination (Cursor-Based)

```javascript
// Query params for list endpoints
// GET /v1/hospitals/:id/patients?cursor=LAST_ID&limit=20

router.get('/v1/hospitals/:id/patients', requireAuth, requireRole('hospital_admin'), async (req, res) => {
  const { cursor, limit = 20 } = req.query;
  const take = Math.min(parseInt(limit), 100); // Max 100 per page

  const patients = await prisma.patient.findMany({
    where: { hospitalId: req.params.id },
    take: take + 1,               // Fetch one extra to check hasMore
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, mrNumber: true, createdAt: true }
  });

  const hasMore = patients.length > take;
  const data = hasMore ? patients.slice(0, -1) : patients;

  return ok(res, data, {
    cursor: data.at(-1)?.id ?? null,
    hasMore
  });
});
```

---

## 6. Rate Limiting Setup

Add to `api-gateway/index.js`:

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 300,
  message: { success: false, error: 'Too many requests', code: 'RATE_LIMITED' }
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts', code: 'RATE_LIMITED' }
});

app.use('/v1/', apiLimiter);
// authLimiter applied to /oauth/token in auth-service
```

---

## 7. API Design Checklist

Before shipping a new route:
- [ ] Route follows `/v1/resource/:id` naming pattern
- [ ] Returns `{ success, data }` or `{ success, error, code }` format
- [ ] Input validated with Zod before DB operations
- [ ] Auth middleware applied (`requireAuth`, `requireRole` if needed)
- [ ] Hospital tenant guard applied if returning hospital-scoped data
- [ ] List endpoints use cursor pagination with `limit` cap (max 100)
- [ ] Error code is machine-readable (not just HTTP status)
- [ ] Route documented in CLAUDE.md commands table

---
*Adapted from everything-claude-code `api-design` skill (MIT license) — tailored for Haspataal api.haspataal.com*
