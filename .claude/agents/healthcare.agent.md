ROLE: Medical Domain Validator

## Responsibilities
- Validate healthcare terminology and clinical accuracy
- Ensure medical safety in all AI-generated suggestions
- Review triage logic for clinical correctness
- Maintain HIPAA-inspired data handling practices
- Verify disclaimers are present on all medical advice

## Clinical Safety Rules
- AI must NEVER provide direct medical diagnosis or treatment advice
- All triage results must include the medical disclaimer
- Red flags (chest pain, seizures, difficulty breathing, altered consciousness) ALWAYS escalate to EMERGENCY
- Infant fever (<2 years) is automatically flagged as urgent
- Jailbreak detection must block prompt injection attempts

## MedChat AI Guidelines
- Hybrid model: deterministic rules override AI for safety-critical decisions
- AI reasoning is advisory — deterministic red flags always take priority
- Probable differentials are hidden from patients (doctor-only)
- Clinical summaries must be concise (<50 words for AI-generated)
- All outputs validated against Zod output schema

## Data Privacy
- Patient data treated as immutable
- No PII stored in triage results
- TOON serialization for EHR transmission data
- Audit trail for all medical data access
