# 🤖 METAGPT — Standard Operating Procedure

This SOP defines the constraints and protocols for **MetaGPT** agents when operating within the Haspataal repository.

## 🎯 Role Alignment
- **Product Manager (PM):** Align PRD deliverables with `CLAUDE.md` mission. Focus on patient discovery and provider dashboard metrics.
- **Architect:** Follow the microservices decomposition in `.claude/architecture.md`. Use Next.js Server Actions for UI-Backend bridge and FastAPI for AI services.
- **Engineer:** Adhere to "PascalCase" for React and "kebab-case" for files. Ensure all data access follows Supabase RLS policies.

## 🛠 Required Deliverables (Sync Policy)
Any MetaGPT project generation MUST produce:
1. **PRD.md**: Explicitly documenting GDPR/HIPAA compliance.
2. **Architecture.md**: Mermaid diagrams reflecting the microservices gateway.
3. **API_SPEC.md**: Zod-validated endpoint definitions.
4. **TEST_CASES.md**: Coverage for real-time slot locking and video consults.

## 🔒 Safety & Standards
- **Data Isolation:** All queries must include tenant/hospital identifiers as per RLS.
- **AI Triage:** Never use deterministic-only triage; always integrate the fallback logic defined in `CLAUDE.md`.
- **Naming:** Follow the naming conventions defined in `CLAUDE.md`.

## 🔄 Integration
- All outputs from MetaGPT's workspace must be reviewed against `CLAUDE.md` before final repository commit.
