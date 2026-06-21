# Truecaller + WhatsApp Authentication Integration Strategy

## Overview

This document outlines the technical implementation strategy for integrating Truecaller (identity verification) and WhatsApp (OTP delivery) as authentication methods for the Haspataal patient portal.

---

## 1. Authentication Workflows

### 1.1 Truecaller-Based Authentication Flow

```
Patient → Enter Phone → Truecaller SDK → Identity Verification → JWT Issuance
```

**Steps:**
1. Patient enters mobile number in the login form
2. Client-side Truecaller SDK intercepts the request
3. If Truecaller app is installed, it auto-fills verified identity
4. Backend verifies Truecaller signature and validates phone number against `Patient.phone` field
5. On successful verification, a JWT access token is issued with patient claims

### 1.2 WhatsApp OTP Authentication Flow

```
Patient → Enter Phone → Backend → Generate OTP → WhatsApp → Verify OTP → JWT Issuance
```

**Steps:**
1. Patient enters mobile number
2. Backend generates 6-digit OTP (valid for 5 minutes)
3. OTP sent via WhatsApp using Meta Business API
4. Patient enters OTP in UI
5. Backend validates OTP against Redis store
6. JWT access token issued on successful verification

### 1.3 Hybrid Flow (Truecaller + WhatsApp)

For enhanced security, combine both:
1. Truecaller verifies identity
2. WhatsApp delivers secondary OTP for confirmation
3. Both verifications required for high-risk operations

---

## 2. Required APIs and SDKs

### 2.1 Truecaller Integration

**API/SDK Requirements:**
- **Truecaller SDK for Web**: Available via Truecaller Developer Program
- **Endpoint**: SDK-based (client-side) with backend verification
- **Key Configuration**:
  - `TC_SDK_KEY`: Provided by Truecaller for your domain
  - `TC_SDK_SECRET`: Signing secret for signature verification

**Client-Side Implementation:**
```html
<script src="https://assets.truecaller.com/sdk/v2/sdk.js"></script>
```

**Backend Verification Endpoint:**
- Method: POST
- Payload: Truecaller user object + signature
- Verification: HMAC-SHA256 signature validation using SDK secret

### 2.2 WhatsApp Integration (Meta Business API)

**API Requirements:**
- **Meta Business Verification** - Required for WhatsApp Business API access
- **WhatsApp Business Account ID**
- **Phone Number ID** for sending messages
- **Access Token** (long-lived)

**Endpoints:**
```
POST https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages
Content-Type: application/json
Authorization: Bearer {ACCESS_TOKEN}
```

**Required Environment Variables:**
```
WHATSAPP_ACCESS_TOKEN=your_long_lived_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_VERIFY_TOKEN=webhook_verification_token
```

---

## 3. Backend Architecture

### 3.1 Database Schema Changes

Add to `packages/db/prisma/schema.prisma`:

```prisma
model PatientAuthMethod {
  id          String   @id @default(uuid())
  patientId   String   @map("patient_id")
  method      AuthMethod @default(WHATSAPP)
  phone       String
  isVerified  Boolean  @default(false)
  verifiedAt  DateTime? @map("verified_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  patient     Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@unique([patientId, method, phone])
  @@index([patientId, method])
  @@map("patient_auth_methods")
}

model OtpSession {
  id          String   @id @default(uuid())
  phone       String
  otpHash     String   @map("otp_hash")
  purpose     OtpPurpose @default(LOGIN)
  expiresAt   DateTime   @map("expires_at")
  verifiedAt  DateTime?  @map("verified_at")
  attempts    Int        @default(0)
  createdAt   DateTime   @default(now()) @map("created_at")

  @@index([phone, purpose, expiresAt])
  @@map("otp_sessions")
}

enum AuthMethod {
  TRUECALLER
  WHATSAPP
}

enum OtpPurpose {
  LOGIN
  ACCOUNT_LINKING
  PASSWORD_RESET
}
```

### 3.2 Auth Service Endpoints

Add to `services/auth/index.js`:

```javascript
// Truecaller Verification Endpoint
app.post('/auth/truecaller/verify', async (req, res) => {
  const { phoneNumber, truecallerId, signature, name } = req.body;
  
  // Verify HMAC signature from Truecaller
  const expectedSignature = crypto
    .createHmac('sha256', process.env.TC_SDK_SECRET)
    .update(phoneNumber + truecallerId)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid Truecaller signature' });
  }
  
  // Find patient by phone (from Patient model)
  const patient = await prisma.patient.findUnique({
    where: { phone: phoneNumber }
  });
  
  if (!patient) {
    // Auto-registration flow for new patients
    return await registerViaTruecaller(req, res);
  }
  
  // Issue JWT
  const payload = { userId: patient.id, phone: patient.phone, role: 'patient' };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  
  // Log successful login
  await prisma.auditLog.create({
    data: { userId: patient.id, action: 'TRUECALLER_LOGIN', entity: 'patient', entityId: patient.id }
  });
  
  res.json({ access_token: token, user: { id: patient.id, name: patient.name } });
});

// WhatsApp OTP Request
app.post('/auth/whatsapp/request-otp', async (req, res) => {
  const { phone } = req.body;
  
  // Check rate limiting (Redis)
  const rateKey = `otp_rate:${phone}`;
  const attempts = await redis.incr(rateKey);
  if (attempts === 1) await redis.expire(rateKey, 3600); // 1 hour window
  if (attempts > 5) return res.status(429).json({ error: 'Too many OTP requests' });
  
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  
  // Store in Redis (5 min expiry)
  await redis.setex(`otp:${phone}:login`, 300, otpHash);
  
  // Send via WhatsApp
  await sendWhatsAppOtp(phone, otp);
  
  res.json({ message: 'OTP sent successfully' });
});

// WhatsApp OTP Verification
app.post('/auth/whatsapp/verify', async (req, res) => {
  const { phone, otp } = req.body;
  
  const storedHash = await redis.get(`otp:${phone}:login`);
  if (!storedHash) return res.status(400).json({ error: 'OTP expired or not found' });
  
  const valid = await bcrypt.compare(otp, storedHash);
  if (!valid) return res.status(401).json({ error: 'Invalid OTP' });
  
  // Clean up OTP
  await redis.del(`otp:${phone}:login`);
  
  // Find or create patient
  let patient = await prisma.patient.findUnique({ where: { phone } });
  if (!patient) {
    patient = await prisma.patient.create({
      data: { phone, name: 'Patient' } // Minimal registration
    });
  }
  
  const payload = { userId: patient.id, phone: patient.phone, role: 'patient' };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  
  res.json({ access_token: token, user: { id: patient.id, name: patient.name } });
});
```

### 3.3 Helper Functions

```javascript
async function sendWhatsAppOtp(phone, otp) {
  const message = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: 'authentication_otp',
      language: { code: 'en' },
      components: [{
        type: 'body',
        parameters: [{ type: 'text', text: otp }]
      }]
    }
  };
  
  await fetch(
    `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    }
  );
}
```

---

## 4. Security Best Practices

### 4.1 Data Protection

| Requirement | Implementation |
|-------------|----------------|
| **OTP Encryption** | Never store plaintext OTP; use bcrypt hashing |
| **PII Handling** | Encrypt phone numbers at rest; use TLS 1.3 for transit |
| **Token Signing** | Use RS256 or HS256 with 256-bit secrets |
| **Session Management** | Redis-backed token blacklist for logout |

### 4.2 Rate Limiting

```javascript
// Implemented via Redis
const rateLimits = {
  otp_requests: '5/hour per phone',
  login_attempts: '10/hour per phone',
  verify_attempts: '5/15min per OTP'
};
```

### 4.3 Audit Trail

Log all authentication events to `AuditLog` table:
- Successful/failed login attempts
- OTP sent/verification events
- Truecaller verification results
- Auto-registration events

### 4.4 Compliance Considerations (HIPAA/GDPR/APPI)

- Phone numbers classified as PII under HIPAA
- Maintain audit logs for 6 years minimum
- Implement data retention policies
- Enable encryption at rest for all PII
- Use short-lived JWTs (max 24 hours)

---

## 5. Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Generate Meta Business verification
- [ ] Apply for Truecaller Developer access
- [ ] Set up webhook endpoints for WhatsApp
- [ ] Create migration for `PatientAuthMethod` and `OtpSession` tables

### Phase 2: Backend Implementation
- [ ] Implement `/auth/whatsapp/request-otp` endpoint
- [ ] Implement `/auth/whatsapp/verify` endpoint
- [ ] Implement `/auth/truecaller/verify` endpoint
- [ ] Add rate limiting middleware
- [ ] Set up Redis caching for OTP storage

### Phase 3: Frontend Integration
- [ ] Add Truecaller SDK to patient portal
- [ ] Create login UI with phone input
- [ ] Build OTP input component
- [ ] Add QR code fallback for WhatsApp Web

### Phase 4: Security Hardening
- [ ] Implement IP-based anomaly detection
- [ ] Add device fingerprinting
- [ ] Set up alerting for suspicious logins
- [ ] Configure WAF rules for auth endpoints

---

## 6. Environment Variables Required

Add to `.env.example`:

```bash
# Truecaller SDK
TC_SDK_KEY=your_truecaller_sdk_key
TC_SDK_SECRET=your_truecaller_sdk_secret
TC_SDK_KEY_HASH=sha256_hash_of_sdk_key

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_long_lived_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_id=your_business_account_id
WHATSAPP_VERIFY_TOKEN=webhook_verification_token
WHATSAPP_WEBHOOK_SECRET=your_webhook_secret

# Security
OTP_ENCRYPTION_KEY=your_32_char_encryption_key
```

---

## 7. Dependencies to Add

For `services/auth/package.json`:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "crypto": "^1.0.1",
    "ioredis": "^5.3.0"
  }
}
```

---

## 8. Error Handling & Edge Cases

| Scenario | Response |
|----------|----------|
| Truecaller not installed | Fallback to WhatsApp OTP |
| WhatsApp delivery failure | Retry with SMS via Twilio |
| Invalid Truecaller signature | Return 401, log attempt |
| OTP expired | Clear Redis key, prompt resend |
| Multiple failed OTP attempts | Lock for 15 minutes, notify admin |

---

## 9. Monitoring & Metrics

Track these Prometheus metrics in auth service:
- `haspataal_auth_truecaller_success_total`
- `haspataal_auth_whatsapp_otp_sent_total`
- `haspataal_auth_whatsapp_otp_verified_total`
- `haspataal_auth_failed_attempts_total` (by method)

---

## 10. References

- [Truecaller SDK Documentation](https://developer.truecaller.com)
- [Meta WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Supabase Auth](https://supabase.com/docs/guides/auth) - Open-source Firebase alternative with free unlimited users

---

## 11. Cost Analysis & Free Alternatives

### 11.1 Truecaller Pricing

**Truecaller does NOT offer a free tier for SDK integration:**
- Requires Truecaller Developer Program enrollment
- Custom enterprise pricing based on volume
- Estimated cost: $500-2000/month for high-volume healthcare apps
- **No free GitHub repos** provide Truecaller SDK functionality

### 11.2 WhatsApp Business API Pricing (India, 2026)

| Category | Cost per Message | Notes |
|----------|-----------------|-------|
| Authentication | ₹0.115 (~$0.0014 USD) | OTP messages only |
| Utility | ₹0.115 (~$0.0014 USD) | Appointment reminders, etc. |
| Marketing | ₹0.86 (~$0.01 USD) | Higher - avoid for OTP |
| Service | FREE | User-initiated within 24h window |

**For 10,000 logins/month:** ₹1,150 (~$14 USD)

### 11.3 Free/Open-Source Alternatives

| Solution | Cost | Pros | Cons | GitHub |
|----------|------|------|------|--------|
| **Supabase Auth** | Free (self-host) | Open-source, unlimited users, built-in OTP | Self-hosting required | [supabase/supabase](https://github.com/supabase/supabase) |
| **Appwrite Auth** | Free (self-host) | OTP, JWT, Magic Links | Requires infrastructure | [appwrite/appwrite](https://github.com/appwrite/appwrite) |
| **Keycloak** | Free (self-host) | Enterprise SSO, MFA | Complex setup | [keycloak/keycloak](https://github.com/keycloak/keycloak) |
| **Authgear** | Free tier available | WhatsApp OTP built-in, passkeys | Newer ecosystem | [authgear/authgear-server](https://github.com/authgear/authgear-server) |
| **Msg91/Gupshup** | Pay-as-you-go | India-focused, competitive rates | Not open-source | N/A |

### 11.4 Recommended Cost-Effective Approach

**For Haspataal, consider this tier:**

```
Phase 1: Firebase Auth (Spark Plan - Free)
- 50,000 MAU free tier
- Email/password free
- Phone auth: $0.06/verify for testing

Phase 2: Supabase Auth (Self-host)
- Unlimited auth users
- Built-in OTP
- Postgres integration (matches your stack)

Phase 3: TrueLayer/Truecaller
- Only after proving business need
- For enhanced trust/safety
```

**Estimated Monthly Costs (10K patients):**
- Firebase SMS: ~$600 (10K × $0.06)
- Supabase self-hosted: ~$30 (server costs)
- WhatsApp OTP: ~$14 (10K × ₹0.115)
- Truecaller SDK: $500-2000+ (**no free tier**)

---

## 12. GitHub Repositories for Free OTP Login

### 12.1 Production-Ready Solutions

| Repo | Description | Stars | Notes |
|------|-------------|-------|-------|
| [supabase/supabase](https://github.com/supabase/supabase) | Full auth backend with OTP | 65k+ | Drop-in replacement for Firebase |
| [appwrite/appwrite](https://github.com/appwrite/appwrite) | Backend-as-a-service with OTP | 45k+ | Great for Node.js/React apps |
| [logto-io/logto](https://github.com/logto-io/logto) | Identity infrastructure | 12k+ | Modern Auth0 alternative |
| [authgear/authgear-server](https://github.com/authgear/authgear-server) | Auth-as-a-service, self-host | 3k+ | Built-in WhatsApp OTP support |
| [keycloak/keycloak](https://github.com/keycloak/keycloak) | Enterprise SSO | 22k+ | Complex but feature-rich |

### 12.2 Quick Implementation with Free Tier

```bash
# Supabase (recommended - matches your Postgres stack)
npm install @supabase/supabase-js

# Minimal OTP flow (serverless)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Send OTP
await supabase.auth.signInWithOtp({ phone: '+91XXXXXXXXXX' });

// Verify OTP  
await supabase.auth.verifyOtp({ phone: '+91XXXXXXXXXX', token: otp, type: 'sms' });
```

### 12.3 Hybrid Strategy (Recommended)

Use **Firebase Auth free tier** (50K MAU) + **WhatsApp via Meta** (₹0.115/msg) for cost optimization:

1. Start with Firebase phone auth (free tier for 50K MAU)
2. Switch to Supabase for unlimited scaling
3. Add Truecaller only for fraud prevention in high-risk regions
4. Consider Authgear for built-in WhatsApp OTP at infrastructure level