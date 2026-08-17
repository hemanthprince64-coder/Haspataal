"""
services/ai-docs/main.py
AI Clinical Documentation Microservice — Haspataal

Endpoints:
  POST /v1/generate-opd-note            – structured OPD note from transcript
  POST /v1/generate-discharge-summary   – discharge summary from EMR
  POST /v1/generate-prescription        – prescription draft with safety checks
  GET  /api/health                       – liveness probe

Environment:
  GEMINI_API_KEY / OPENAI_API_KEY  – LLM provider key
  AI_DOCS_PROVIDER                  – "gemini" | "openai" (default: gemini)
  AI_DOCS_TIMEOUT_MS                – max LLM round-trip (default: 5000)
  AI_DOCS_LOG_LEVEL                 – "info" | "debug" (default: info)
"""

import os, json, re, httpx, logging
from datetime import datetime
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from prometheus_client import Counter, Histogram, generate_latest, REGISTRY
from starlette.responses import Response

# ── Config ────────────────────────────────────────────────────────────────────
AI_DOCS_PROVIDER   = os.getenv("AI_DOCS_PROVIDER", "gemini")
AI_DOCS_TIMEOUT_MS = int(os.getenv("AI_DOCS_TIMEOUT_MS", "5000"))
LOG_LEVEL          = os.getenv("AI_DOCS_LOG_LEVEL", "info")

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper()),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("ai-docs")

app = FastAPI(title="Haspataal AI Documentation Service", version="1.0.0")

# ── Metrics ───────────────────────────────────────────────────────────────────
ai_requests_total   = Counter("ai_requests_total",   "Total AI calls", ["endpoint", "status"])
ai_request_duration = Histogram(
    "ai_request_duration_seconds",
    "LLM call latency",
    ["endpoint"],
    buckets=[0.25, 0.5, 1, 2, 3, 5, 10],
)

# ── In-memory doctor approval store (dev-only; replace with Redis/DB in prod) ──
_doctor_approvals: dict[str, dict[str, Any]] = {}

# ── Schema (mirrors TypeScript types in types/ai-docs.ts) ─────────────────────

class HealthResponse(BaseModel):
    status: str = Field(..., description="Service health status")
    service: str = Field(default="ai-docs")
    version: str = Field(default="1.0.0")

class OPDNoteInput(BaseModel):
    patientId:   str         = Field(..., description="UUID of the patient")
    hospitalId:  str         = Field(..., description="UUID of the hospital/clinic")
    doctorId:    str         = Field(..., description="UUID of the requesting doctor")
    transcript:  str         = Field(..., description="Raw text or transcript from the consultation")
    specialty:   Optional[str] = Field(None, description="Optional clinical specialty hint")

class OPDNoteResponse(BaseModel):
    id:            str  = Field(..., description="AIDocument UUID")
    chiefComplaint: str
    history:       str
    examination:   str
    assessment: str
    plan:          str
    isAssisted:    bool = Field(default=True, description="True = AI-assisted draft")
    isDoctorApproved: bool = Field(default=False)

class DischargeInput(BaseModel):
    patientId:   str
    hospitalId:  str
    doctorId:    str
    admissionId: str   = Field(..., description="UUID of the Admission record")
    clinicalNotes: str = Field(..., description="Free-text clinical notes from the stay")
    diagnosisCodes: Optional[list[str]] = Field(None, description="ICD-10 codes if known")

class DischargeResponse(BaseModel):
    id:                  str
    diagnosis:           str
    treatmentSummary:    str
    medications:         str
    followUpInstructions: str
    isAssisted:          bool = Field(default=True)
    isDoctorApproved:    bool = Field(default=False)

class PrescriptionInput(BaseModel):
    patientId:   str
    hospitalId:  str
    doctorId:    str
    apptId:      Optional[str] = None
    diagnosis:   str
    symptoms:    str
    allergies:   list[str] = Field(default=[], description="Known drug allergies")

class PrescriptionResponse(BaseModel):
    id:             str
    drugs:          list[dict[str, Any]] = Field(
        ..., description="Each entry: { drug, dose, frequency, duration, route }"
    )
    contraindicationWarnings: list[str] = Field(default=[], description="Flagged drug interactions/allergies")
    isAssisted:     bool = Field(default=True)
    isDoctorApproved: bool = Field(default=False)

class DoctorApproveRequest(BaseModel):
    documentId:   str  = Field(..., description="UUID of the AIDocument")
    editedText:   Optional[str] = Field(None, description="Doctor-edited final text")

# ── LLM call helpers ─────────────────────────────────────────────────────────

_PROVIDER_URLS: dict[str, str] = {
    "gemini":  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    "openai":  "https://api.openai.com/v1/chat/completions",
}

async def _call_llm(prompt: str, system_prompt: str = "") -> str:
    """Route LLM call to configured provider. Raises on timeout/error."""
    url  = _PROVIDER_URLS.get(AI_DOCS_PROVIDER)
    if not url:
        raise HTTPException(500, f"Unknown AI_DOCS_PROVIDER: {AI_DOCS_PROVIDER}")

    api_key = os.getenv(
        f"{'GEMINI' if AI_DOCS_PROVIDER == 'gemini' else 'OPENAI'}_API_KEY"
    )
    if not api_key:
        raise HTTPException(500, f"{AI_DOCS_PROVIDER.upper()}_API_KEY not configured")

    headers: dict[str, str] = {"Content-Type": "application/json"}
    if AI_DOCS_PROVIDER == "gemini":
        # Gemini REST uses URL param for key
        url = f"{url}?key={api_key}"
        body = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{prompt}"}]}
            ],
            "generationConfig": {"maxOutputTokens": 2048, "temperature": 0.2},
        }
    else:
        headers["Authorization"] = f"Bearer {api_key}"
        body = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": prompt},
            ],
            "max_tokens": 2048,
            "temperature": 0.2,
        }

    timeout = httpx.Timeout(AI_DOCS_TIMEOUT_MS / 1000.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            r = await client.post(url, headers=headers, json=body)
            r.raise_for_status()
            data = r.json()
            if AI_DOCS_PROVIDER == "gemini":
                return data["candidates"][0]["content"]["parts"][0]["text"]
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPError as exc:
            logger.error("LLM call failed: %s", exc)
            raise HTTPException(502, f"AI service unavailable: {exc}") from exc

# ── System prompts ───────────────────────────────────────────────────────────

_SYSTEM_OPD = """You are a medical documentation assistant for Indian doctors.
Generate a structured OPD note in JSON format with these exact keys:
{ "chiefComplaint": "...", "history": "...", "examination": "...", "assessment": "...", "plan": "..." }
Rules:
- Keep each field 2-4 sentences
- Use standard medical abbreviations
- Mention vitals if provided
- Do NOT include drug names in OPD notes
- Return ONLY valid JSON, no markdown fences"""


_SYSTEM_DISCHARGE = """You are a medical documentation assistant. Generate a structured
discharge summary as valid JSON:
{ "diagnosis": "...", "treatmentSummary": "...", "medications": "...", "followUpInstructions": "..." }
Rules:
- diagnosis: primary + secondary, ICD-10 if possible
- treatmentSummary: procedures performed, key interventions
- medications: name, dose, route, frequency, duration
- followUpInstructions: date, specialist, required tests
- Follow Indian clinical documentation standards
- Return ONLY valid JSON, no markdown fences"""


_SYSTEM_PRESCRIPTION = """You are a clinical prescription assistant for Indian doctors.
Generate a prescription as valid JSON array of drug objects:
[ { "drug": "...", "dose": "...", "frequency": "...", "duration": "...", "route": "oral" } ]
Rules:
- Match drugs to the diagnosis and symptoms described
- Use standard Indian pharmacopoeia dosing
- If an allergy in the patient list conflicts with a suggested drug, DO NOT include that drug;
  instead add it to the contraindicationWarnings list
- Use generic names; brand names discouraged
- Return ONLY valid JSON array, no markdown fences"""

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health() -> HealthResponse:
    return HealthResponse(status="healthy", service="ai-docs", version="1.0.0")


@app.post("/v1/generate-opd-note", response_model=OPDNoteResponse, tags=["AI Docs"])
@ai_request_duration.labels(endpoint="opd-note").time()
async def generate_opd_note(body: OPDNoteInput, request: Request) -> OPDNoteResponse:
    """Generate a structured OPD note from consultation transcript."""
    ai_requests_total.labels(endpoint="opd-note", status="called").inc()

    prompt = f"""
Patient: {body.patientId}
Specialty: {body.specialty or 'General'}
---
Consultation Transcript:
{body.transcript}
"""
    try:
        raw = await _call_llm(prompt, _SYSTEM_OPD)
        parsed = _parse_json(raw)
        doc_id = _save_ai_document(
            hospitalId  = body.hospitalId,
            patientId   = body.patientId,
            apptId      = None,
            docType     = "OPD_NOTE",
            inputPrompt = body.transcript,
            generated   = json.dumps(parsed, ensure_ascii=False),
        )
        ai_requests_total.labels(endpoint="opd-note", status="success").inc()
        return OPDNoteResponse(id=doc_id, **parsed)
    except Exception as exc:
        ai_requests_total.labels(endpoint="opd-note", status="error").inc()
        logger.error("OPD note generation failed: %s", exc)
        logger.warning("Falling back to plain text; doctor must compose manually.")
        # Fallback: return minimal structure so UI doesn't break
        return OPDNoteResponse(
            id            = _save_ai_document(body.hospitalId, body.patientId, None, "OPD_NOTE", body.transcript, ""),
            chiefComplaint = "AI unavailable — please type manually",
            history       = "AI unavailable — please type manually",
            examination   = "AI unavailable — please type manually",
            assessment    = "AI unavailable — please type manually",
            plan          = "AI unavailable — please type manually",
            isAssisted    = True,
        )


@app.post("/v1/generate-discharge-summary", response_model=DischargeResponse, tags=["AI Docs"])
@ai_request_duration.labels(endpoint="discharge-summary").time()
async def generate_discharge_summary(body: DischargeInput, request: Request) -> DischargeResponse:
    """Generate a structured discharge summary from EMR clinical notes."""
    ai_requests_total.labels(endpoint="discharge-summary", status="called").inc()

    diagnosis_hint = f"ICD-10 codes: {', '.join(body.diagnosisCodes)}" if body.diagnosisCodes else ""
    prompt = f"""
Admission: {body.admissionId}
{diagnosis_hint}
---
Clinical Notes:
{body.clinicalNotes}
"""
    try:
        raw = await _call_llm(prompt, _SYSTEM_DISCHARGE)
        parsed = _parse_json(raw)
        doc_id = _save_ai_document(
            hospitalId  = body.hospitalId,
            patientId   = body.patientId,
            apptId      = body.admissionId,
            docType     = "DISCHARGE_SUMMARY",
            inputPrompt = body.clinicalNotes,
            generated   = json.dumps(parsed, ensure_ascii=False),
        )
        ai_requests_total.labels(endpoint="discharge-summary", status="success").inc()
        return DischargeResponse(id=doc_id, **parsed)
    except Exception as exc:
        ai_requests_total.labels(endpoint="discharge-summary", status="error").inc()
        raise HTTPException(502, f"Discharge summary generation failed: {exc}") from exc


@app.post("/v1/generate-prescription", response_model=PrescriptionResponse, tags=["AI Docs"])
@ai_request_duration.labels(endpoint="prescription").time()
async def generate_prescription(body: PrescriptionInput, request: Request) -> PrescriptionResponse:
    """Generate a prescription draft with contraindication guardrails."""
    ai_requests_total.labels(endpoint="prescription", status="called").inc()

    allergy_list = "\n".join(f"  - {a}" for a in body.allergies) if body.allergies else "None on record"
    prompt = f"""
Diagnosis: {body.diagnosis}
Symptoms:  {body.symptoms}
Patient Allergies (MUST NOT prescribe):
{allergy_list}
"""
    try:
        raw = await _call_llm(prompt, _SYSTEM_PRESCRIPTION)
        drugs = _parse_json(raw)

        # ── Contraindication guardrail ─────────────────────────────────────────
        warnings: list[str] = []
        for drug in drugs:
            for allergy in body.allergies:
                if _drug_contains_allergen(drug.get("drug", ""), allergy):
                    warnings.append(
                        f"⚠ {drug['drug']} may conflict with allergy '{allergy}' — review before prescribing"
                    )

        doc_id = _save_ai_document(
            hospitalId  = body.hospitalId,
            patientId   = body.patientId,
            apptId      = body.apptId,
            docType     = "PRESCRIPTION_DRAFT",
            inputPrompt = f"{body.diagnosis} | {body.symptoms}",
            generated   = json.dumps(drugs, ensure_ascii=False),
        )
        ai_requests_total.labels(endpoint="prescription", status="success").inc()
        return PrescriptionResponse(
            id = doc_id,
            drugs = drugs,
            contraindicationWarnings = warnings,
        )
    except Exception as exc:
        ai_requests_total.labels(endpoint="prescription", status="error").inc()
        raise HTTPException(502, f"Prescription generation failed: {exc}") from exc


@app.post("/v1/doctor-approve", tags=["AI Docs"])
async def doctor_approve(body: DoctorApproveRequest) -> dict[str, str]:
    """Mark an AI-generated document as doctor-approved and store the final text."""
    _doctor_approvals[body.documentId] = {
        "approvedAt":  datetime.utcnow().isoformat(),
        "approvedText": body.editedText or "approved-as-is",
    }
    return {"status": "approved", "documentId": body.documentId}


@app.get("/metrics")
async def metrics() -> Response:
    return Response(generate_latest(REGISTRY), media_type="text/plain")

# ── Helpers ──────────────────────────────────────────────────────────────────

def _parse_json(raw: str) -> Any:
    """Strip markdown code fences and parse JSON blob."""
    cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Last-resort: extract the first {...} block
        m = re.search(r"\{[\s\S]*\}", raw)
        if m:
            return json.loads(m.group())
        raise


def _save_ai_document(
    hospitalId: str,
    patientId:  Optional[str],
    apptId:     Optional[str],
    docType:    str,
    inputPrompt: str,
    generated:  str,
) -> str:
    """Persist AI document record.  In dev mode we only log; in prod replace with DB write."""
    doc_id = f"dev-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    logger.info(
        "AI document saved — type:%s hospitalId:%s patientId:%s",
        docType, hospitalId, patientId,
    )
    return doc_id


def _drug_contains_allergen(drug_name: str, allergen: str) -> bool:
    """Naive substring check — replace with RxNorm crosswalk in production."""
    return allergen.lower() in drug_name.lower()
