# Skill: MedChat AI Triage System

## Overview
Hybrid AI-powered medical triage assistant that combines deterministic clinical rules with Gemini 2.0 Flash for intelligent patient assessment.

## Architecture

### Hybrid Model
```
Patient Input → Validation → Jailbreak Detection
    ↓
LAYER 1: Deterministic Rules (ALWAYS runs)
  - Red flag detection (chest pain, seizures, etc.)
  - Boolean flag checks (fever, breathing, consciousness)
  - Symptom pattern matching
  - Seasonal/regional risk factors
  - Pediatric escalation rules
  - Duration modifiers
    ↓
LAYER 2: AI Analysis (if GEMINI_API_KEY available)
  - Gemini 2.0 Flash clinical reasoning
  - Probable differentials
  - Structured JSON output
    ↓
SAFETY OVERRIDE: Deterministic red flags ALWAYS override AI
    ↓
Output: Urgency level, speciality, advice, clinical summary
```

### Key Files
| File | Purpose |
|---|---|
| `lib/medchat/triage-engine.js` | Core triage logic (hybrid engine) |
| `lib/medchat/symptoms-db.js` | Red flags, symptom patterns, pediatric rules |
| `lib/medchat/schemas.js` | Zod input/output validation schemas |
| `lib/medchat/translations.js` | Hindi/English translations |
| `app/(patient)/medchat/page.js` | Patient-facing triage UI |
| `app/(patient)/medchat/medchat.module.css` | Premium styles |
| `app/actions.js` → `medchatTriageAction` | Server action handler |

### Safety Rules
- Never provide direct medical diagnosis
- Always include disclaimer
- Red flags → EMERGENCY (no AI override allowed)
- Infant fever → automatic urgent escalation
- Jailbreak patterns blocked at input
- Differentials hidden from patients (doctor-only field)

### Environment
- Requires `GEMINI_API_KEY` for AI features
- Falls back gracefully to deterministic-only mode
- TOON compression for EHR data transmission
