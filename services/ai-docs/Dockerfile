# services/ai-docs/Dockerfile
# AI Clinical Documentation Service — FastAPI

FROM python:3.12-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py ./
ENV PYTHONUNBUFFERED=1
ENV AI_DOCS_LOG_LEVEL=info
ENV AI_DOCS_TIMEOUT_MS=5000
EXPOSE 4003
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:4003/api/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4003", "--workers", "2"]
