# Haspataal MedChat AI Service (FastAPI)
# Strengthening: Offloading AI computation to Python for better performance

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(title="Haspataal MedChat AI Service")

class TriageRequest(BaseModel):
    patient_id: str
    symptoms: List[str]
    history_context: Optional[str] = None

class TriageResult(BaseModel):
    severity_score: int
    matched_specialty: str
    ai_recommendation: str
    requires_emergency: bool

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "medchat-ai"}

@app.post("/triage", response_model=TriageResult)
async def perform_triage(request: TriageRequest):
    """
    Performs clinical triage using Gemini 2.5 and deterministic medical rules.
    """
    try:
        # 1. Deterministic Rule Check (Red Flags)
        # 2. Gemini 2.5 Clinical Reasoning
        # 3. Hybrid scoring
        
        # Placeholder for implementation
        return TriageResult(
            severity_score=3,
            matched_specialty="General Medicine",
            ai_recommendation="Based on your symptoms, we recommend booking a non-urgent consultation.",
            requires_emergency=False
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
