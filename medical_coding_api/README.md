---
title: Medical Coding API
emoji: 🏥
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
app_port: 7860
tags:
  - medical
  - healthcare
  - icd-10
  - cpt
  - phi-3
  - fastapi
---

# 🏥 Medical Coding API

AI-powered API for extracting **ICD-10** and **CPT codes** from clinical provider notes using Microsoft Phi-3.

## 🚀 Features

- ✅ Extract ICD-10 diagnosis codes
- ✅ Extract CPT procedure codes
- ✅ Supports notes up to 10,000 characters (~2,500 words)
- ✅ JSON output format
- ✅ GPU-accelerated inference (when available)
- ✅ Automatic text truncation
- ✅ Production-ready with error handling

## 📡 API Endpoints

### POST `/predict`

Extract medical codes from clinical note.

**Request:**

```json
{
  "note": "Your clinical note here..."
}
```

**Response:**

```json
{
  "result": {
    "icd10_codes": ["I10", "E11.9"],
    "cpt_codes": ["99213"]
  },
  "raw_output": "...",
  "note_length": 250,
  "truncated": false,
  "processing_time": 3.45
}
```

### GET `/health`

Check API health status.

### GET `/docs`

Interactive API documentation (Swagger UI).

## 🧪 Usage Examples

### cURL

```bash
curl -X POST "https://YOUR-SPACE.hf.space/predict" \
  -H "Content-Type: application/json" \
  -d '{"note": "Patient with HTN, BP 160/95. Prescribed lisinopril."}'
```

### Python

```python
import requests

response = requests.post(
    "https://YOUR-SPACE.hf.space/predict",
    json={"note": "Patient with diabetes, HbA1c 8.2. Started metformin."}
)
print(response.json())
```

### JavaScript

```javascript
fetch("https://YOUR-SPACE.hf.space/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ note: "Clinical note here..." }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

## ⚙️ Technical Details

- **Model:** RayyanAhmed9477/med-coding (Phi-3 based)
- **Framework:** FastAPI + Transformers
- **Deployment:** HuggingFace Spaces (Docker)
- **First Request:** 30-60 seconds (model loading)
- **Subsequent Requests:** 2-10 seconds

## 📝 License

MIT License
