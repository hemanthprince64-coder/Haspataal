# 🚨 Data Breach Response Runbook (DPDP Act)

This runbook outlines the mandatory steps to be taken within the first 72 hours of discovering a personal data breach at Haspataal.

## Phase 1: Identification & Containment (T+0h to T+4h)
1. **Verify the Breach**: Confirm if personal data (PII) or health data has been accessed without authorization.
2. **Contain the Leak**:
   - Rotate database credentials.
   - Revoke compromised JWT tokens.
   - Isolate affected server instances or microservices.
3. **Log Evidence**: Take snapshots of logs and database states for forensic analysis.

## Phase 2: Assessment (T+4h to T+24h)
1. **Scope of Breach**: Identify which users and what specific data types were affected (refer to [Data Inventory](./dpdp-compliance.md#section-1--data-inventory--classification)).
2. **Severity Level**: 
   - **Critical**: Health records, Prescriptions, Blood Group.
   - **High**: Name, Phone, Address.
3. **Impact Analysis**: Determine if the breach could lead to identity theft, financial loss, or clinical risk.

## Phase 3: Notification (T+24h to T+72h)
1. **Notify Data Protection Board (DPB)**:
   - Provide nature of the breach.
   - Number of affected Data Principals.
   - Remedial actions taken.
2. **Notify Affected Data Principals**:
   - Send clear, concise notifications via WhatsApp/Email.
   - Advise on protective measures (e.g., changing passwords).
3. **Public Statement**: If required, release a statement coordinated by the Legal/PR team.

## Phase 4: Recovery & Hardening (T+72h onwards)
1. **Root Cause Analysis (RCA)**: Identify the technical or procedural vulnerability that was exploited.
2. **Policy Update**: Update RLS policies, firewall rules, or code logic to prevent recurrence.
3. **Compliance Audit**: Perform a full audit of the DPDP compliance controls.
