FROM python:3.10-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    TRANSFORMERS_CACHE=/app/.cache/transformers \
    HF_HOME=/app/.cache/huggingface \
    HF_HUB_ENABLE_HF_TRANSFER=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    git-lfs \
    build-essential \
    curl \
    ca-certificates \
    wget \
    && git lfs install \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip==24.2

# Install hf_transfer for faster downloads (optional but helps)
RUN pip install --no-cache-dir hf-transfer==0.1.8

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/

# Create directories with proper permissions
RUN mkdir -p /app/offload /app/.cache/transformers /app/.cache/huggingface && \
    chmod -R 777 /app/offload /app/.cache

EXPOSE 7860

# Longer startup period for model download
HEALTHCHECK --interval=30s --timeout=30s --start-period=600s --retries=5 \
    CMD curl -f http://localhost:7860/health || exit 1

CMD ["uvicorn", "app.api:app", \
    "--host", "0.0.0.0", \
    "--port", "7860", \
    "--timeout-keep-alive", "300", \
    "--workers", "1", \
    "--log-level", "info"]