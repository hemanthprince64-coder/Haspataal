/**
 * apps/patient-portal/lib/types/ai-docs.ts
 * Shared TypeScript types for the AI Documentation frontend integration.
 * Mirror of services/ai-docs/main.py Pydantic schemas so both backend and
 * frontend always have the same contract.
 */

// ── Enums ─────────────────────────────────────────────────────────────────────

export type AIDocumentType =
  | "OPD_NOTE"
  | "DISCHARGE_SUMMARY"
  | "PRESCRIPTION_DRAFT"
  | "FOLLOW_UP_SUMMARY"
  | "CLINICAL_SUMMARY";

// ── Request / Response types ─────────────────────────────────────────────────

export interface OPDNoteInput {
  patientId:  string;
  hospitalId: string;
  doctorId:   string;
  transcript: string;
  specialty?: string;
}

export interface OPDNoteResponse {
  id: string;
  chiefComplaint:  string;
  history:        string;
  examination:    string;
  assessment:     string;
  plan:           string;
  isAssisted:     boolean;
  isDoctorApproved: boolean;
}

export interface DischargeInput {
  patientId:     string;
  hospitalId:    string;
  doctorId:      string;
  admissionId:   string;
  clinicalNotes: string;
  diagnosisCodes?: string[];
}

export interface DischargeResponse {
  id: string;
  diagnosis:           string;
  treatmentSummary:    string;
  medications:         string;
  followUpInstructions: string;
  isAssisted:          boolean;
  isDoctorApproved:    boolean;
}

export interface PrescriptionDrug {
  drug:        string;
  dose:        string;
  frequency:   string;
  duration:    string;
  route:       string;
}

export interface PrescriptionInput {
  patientId:   string;
  hospitalId:  string;
  doctorId:    string;
  apptId?:     string;
  diagnosis:   string;
  symptoms:    string;
  allergies:   string[];
}

export interface PrescriptionResponse {
  id:                       string;
  drugs:                    PrescriptionDrug[];
  contraindicationWarnings: string[];
  isAssisted:               boolean;
  isDoctorApproved:         boolean;
}

export interface DoctorApproveRequest {
  documentId: string;
  editedText?: string;
}

// ── Service config ────────────────────────────────────────────────────────────

export interface AIDocsConfig {
  provider:    "gemini" | "openai";
  timeoutMs:   number;
  baseUrl:     string;
}

/** Read from NEXT_PUBLIC_AI_DOCS_URL / AI_DOCS_PROVIDER env vars */
export function getAIDocsConfig(): AIDocsConfig {
  const baseUrl =
    (typeof window !== "undefined" && window.location.origin + "/ai-docs") ||
    process.env.NEXT_PUBLIC_AI_DOCS_URL ||
    "http://localhost:4003";
  const provider = (process.env.AI_DOCS_PROVIDER as AIDocsConfig["provider"]) || "gemini";
  const timeoutMs = parseInt(process.env.AI_DOCS_TIMEOUT_MS || "5000", 10);
  return { provider, timeoutMs, baseUrl };
}
