"""
services/ai-docs/tests/test_main.py
AI Documentation Service — smoke tests
Run: pytest tests/test_main.py -v
"""

import json, os
import pytest
from httpx import AsyncClient, ASGITransport
from main import app

# ── Helpers ────────────────────────────────────────────────────────────────────

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"
    assert r.json()["service"] == "ai-docs"


@pytest.mark.asyncio
async def test_generate_opd_note_structure(monkeypatch):
    """OPD note returns schema-valid JSON."""
    from main import generate_opd_note
    import main as m

    async def _fake_llm(prompt: str, system_prompt: str = "") -> str:
        return json.dumps({
            "chiefComplaint": "Fever and cough for 3 days",
            "history":        "Patient reports onset 3 days ago, no chronic conditions.",
            "examination":    "Temp 101°F, throat erythematous, lungs clear.",
            "assessment":     "Acute upper respiratory infection, likely viral.",
            "plan":           "Rest, hydration, paracetamol 500 mg TDS × 3 days.",
        })

    monkeypatch.setattr(m, "_call_llm", _fake_llm)

    body = {
        "patientId":  "00000000-0000-0000-0000-000000000001",
        "hospitalId": "00000000-0000-0000-0000-000000000001",
        "doctorId":   "00000000-0000-0000-0000-000000000001",
        "transcript": "Patient reports fever 101°F and cough for 3 days.",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.post("/v1/generate-opd-note", json=body)
    assert r.status_code == 200
    data = r.json()
    for key in ("chiefComplaint", "history", "examination", "assessment", "plan"):
        assert key in data, f"Missing key: {key}"
    assert data["isAssisted"] is True


@pytest.mark.asyncio
async def test_doctor_approve():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.post("/v1/doctor-approve", json={"documentId": "test-doc-123"})
    assert r.status_code == 200
    assert r.json()["status"] == "approved"
