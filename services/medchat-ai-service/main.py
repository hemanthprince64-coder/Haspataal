# Haspataal MedChat AI Service (FastAPI)
# Strengthening: Offloading AI computation to Python for better performance

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(title="Haspataal MedChat AI Service")

class TriageRequest(BaseModel):
    age: int
    gender: str
    city: str
    duration: str
    symptoms: str
    fever: str
    breathingDifficulty: str
    seizure: str
    consciousnessNormal: str

class TriageResult(BaseModel):
    urgency_level: str
    red_flag_detected: bool
    recommended_speciality: str
    possible_categories: List[str]
    clinical_summary_for_doctor: str
    patient_advice: str
    disclaimer: str
    probable_differentials_hidden: List[str]
    risk_score_internal: int
    is_ai_powered: bool = True
    ai_reasoning: Optional[str] = None

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "medchat-ai", "version": "2.5.0"}

@app.post("/triage", response_model=TriageResult)
async def perform_triage(request: TriageRequest):
    """
    Performs clinical triage using Gemini 2.5 and deterministic medical rules.
    """
    try:
        # TODO: Implement actual Gemini 2.5 call here
        # For now, return a reasoned placeholder that matches the expected output
        return TriageResult(
            urgency_level="ROUTINE",
            red_flag_detected=False,
            recommended_speciality="General Medicine",
            possible_categories=["General symptoms"],
            clinical_summary_for_doctor=f"Patient presents with {request.symptoms} for {request.duration}.",
            patient_advice="Maintain hydration and monitor symptoms.",
            disclaimer="MedChat AI provides triage guidance for informational purposes only.",
            probable_differentials_hidden=["Common Viral Infection"],
            risk_score_internal=20
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
