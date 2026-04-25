# api.py
import re
import json
import gc
import time
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from .model_loader import load_model_and_tokenizer
from .prompt_template import PROMPT_TEMPLATE
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Medical Coding API",
    description="Extract ICD-10 and CPT codes from clinical notes using AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

class NoteRequest(BaseModel):
    note: str = Field(
        ..., 
        min_length=10,
        max_length=50000,
        description="Clinical provider note (10-50,000 characters)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "note": "Patient presents with essential hypertension. BP 160/95. Prescribed lisinopril 10mg daily. Office visit for established patient."
            }
        }

class CodingResponse(BaseModel):
    result: dict = Field(..., description="Extracted ICD-10 and CPT codes")
    raw_output: str = Field(..., description="Raw model output")
    note_length: int = Field(..., description="Length of input note in characters")
    truncated: bool = Field(..., description="Whether note was truncated")
    processing_time: float = Field(..., description="Time taken to process in seconds")

# Global variables for lazy loading
_gen_pipeline = None
_tokenizer = None
_model_load_time = None

def get_model():
    """Lazy load model on first request with error handling."""
    global _gen_pipeline, _tokenizer, _model_load_time
    
    if _gen_pipeline is None:
        logger.info("🔄 Loading model for the first time...")
        start_time = time.time()
        
        try:
            _gen_pipeline, _tokenizer = load_model_and_tokenizer()
            _model_load_time = time.time() - start_time
            logger.info(f"✅ Model loaded in {_model_load_time:.2f} seconds")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail=f"Model loading failed: {str(e)}. Please try again in a few moments."
            )
    
    return _gen_pipeline, _tokenizer

def extract_json_from_text(text: str) -> Optional[str]:
    """Extract JSON object from text using brace counting."""
    start_idx = text.find('{')
    if start_idx == -1:
        return None
    
    brace_count = 0
    for i in range(start_idx, len(text)):
        if text[i] == '{':
            brace_count += 1
        elif text[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                return text[start_idx:i+1]
    return None

def truncate_note(note: str, max_chars: int = 10000) -> str:
    """Truncate note to prevent token limit issues."""
    if len(note) <= max_chars:
        return note
    
    logger.warning(f"Note truncated from {len(note)} to {max_chars} characters")
    return note[:max_chars]

# ===== ENDPOINTS =====

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Medical Coding API",
        "version": "1.0.0",
        "description": "Extract ICD-10 and CPT codes from clinical notes",
        "model": "RayyanAhmed9477/med-coding (Phi-3 based)",
        "endpoints": {
            "/predict": "POST - Extract medical codes from clinical note",
            "/health": "GET - Check API health status",
            "/docs": "GET - Interactive API documentation",
            "/metrics": "GET - API usage metrics"
        },
        "usage": {
            "endpoint": "/predict",
            "method": "POST",
            "body": {"note": "Your clinical note here (10-50,000 chars)"},
            "max_note_length": "50,000 characters (~10,000 words)"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model": "RayyanAhmed9477/med-coding",
        "model_loaded": _gen_pipeline is not None,
        "model_load_time": f"{_model_load_time:.2f}s" if _model_load_time else "not loaded yet"
    }

@app.get("/metrics")
async def metrics():
    """Get API usage metrics."""
    return {
        "model_loaded": _gen_pipeline is not None,
        "model_load_time_seconds": _model_load_time,
        "status": "operational"
    }

@app.post("/predict", response_model=CodingResponse)
async def predict(request: NoteRequest):
    """
    Extract ICD-10 and CPT codes from clinical notes.
    
    **Input:** Clinical note (10-50,000 characters)
    
    **Output:** JSON with extracted codes:
    - icd10_codes: List of ICD-10 diagnosis codes
    - cpt_codes: List of CPT procedure codes
    
    **Note:** First request may take 30-60 seconds as model loads into memory.
    Subsequent requests will be faster (2-10 seconds).
    """
    start_time = time.time()
    
    try:
        # Validate input
        note = request.note.strip()
        if not note:
            raise HTTPException(status_code=400, detail="Empty note provided")
        
        # Load model (lazy loading)
        logger.info(f"📝 Processing note ({len(note)} characters)")
        gen_pipeline, tokenizer = get_model()
        
        # Truncate if needed
        original_length = len(note)
        note_truncated = truncate_note(note, max_chars=10000)
        
        # Build prompt
        prompt = PROMPT_TEMPLATE.format(note=note_truncated)
        logger.info(f"🔮 Generating prediction (prompt length: {len(prompt)} chars)")
        
        # Generate prediction
        outputs = gen_pipeline(
            prompt,
            max_new_tokens=600,
            do_sample=False,
            num_return_sequences=1,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
            temperature=0.1,
            top_p=0.95,
            return_full_text=False
        )
        
        # Extract generated text
        if isinstance(outputs, list) and len(outputs) > 0:
            text = outputs[0].get("generated_text", "")
        elif isinstance(outputs, dict):
            text = outputs.get("generated_text", "")
        else:
            text = str(outputs)
        
        logger.info(f"📤 Model output length: {len(text)} characters")
        
        # Remove prompt if present
        if prompt in text:
            text = text.replace(prompt, "").strip()
        
        # Extract JSON
        json_str = extract_json_from_text(text)
        
        if json_str is None:
            logger.error(f"No JSON found in output: {text[:500]}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "No valid JSON found in model output",
                    "raw_output_preview": text[:300],
                    "suggestion": "Model may need fine-tuning or prompt adjustment"
                }
            )
        
        # Parse JSON
        try:
            parsed = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": f"Invalid JSON format: {str(e)}",
                    "json_preview": json_str[:300]
                }
            )
        
        # Validate response structure
        if not isinstance(parsed, dict):
            raise HTTPException(
                status_code=500,
                detail="Model output is not a valid JSON object"
            )
        
        # Clean up memory
        gc.collect()
        
        processing_time = time.time() - start_time
        logger.info(f"✅ Prediction completed in {processing_time:.2f} seconds")
        
        return CodingResponse(
            result=parsed,
            raw_output=text,
            note_length=original_length,
            truncated=original_length > 10000,
            processing_time=round(processing_time, 2)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Prediction failed: {str(e)}", exc_info=True)
        gc.collect()
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc),
            "path": str(request.url)
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Log startup information."""
    logger.info("=" * 60)
    logger.info("🚀 Medical Coding API Starting...")
    logger.info("=" * 60)
    logger.info("⏳ Model will be loaded on first /predict request")
    logger.info("📚 API Documentation: /docs")
    logger.info("=" * 60)
