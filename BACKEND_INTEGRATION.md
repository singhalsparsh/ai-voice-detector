# DeepfakeGuard - Backend Integration Report

## Overview

The Python ML backend from the Midas AI project (`C:\projectt\freebuff\backend`) has been successfully integrated into the DeepfakeGuard frontend project. The backend provides voice deepfake detection using a Wav2Vec2 transformer model.

---

## What Was Done

### 1. Backend Files Copied

All necessary backend files were copied to the `backend/` directory:

```
backend/
├── main.py                    # FastAPI server with Wav2Vec2 inference (v3.1.0)
├── requirements.txt           # Python dependencies (fixed: added torch, transformers)
├── train_model.py             # Classical ML training (RF/GB/SVM/XGBoost ensemble)
├── train_wav2vec2.py          # Transformer fine-tuning script
├── models/
│   ├── voice_classifier.pkl   # Pre-trained classical ML model
│   └── logs/                  # Training metrics logs
└── data/
    ├── real/                  # Human voice recordings (empty - add your data)
    └── ai_generated/          # AI-generated voices (empty - add your data)
```

### 2. Frontend-Backend Compatibility Fixes

#### Problem 1: Route Path Mismatch
- **Frontend** sends to: `POST /api/detect` (with form field `audio`)
- **Backend** had: `POST /api/v1/detect` (with form field `file`)

**Fix:** Added dual route support in `backend/main.py`:
- `POST /api/detect` - Frontend-compatible (accepts `audio` field)
- `POST /api/v1/detect` - Original backend (accepts `file` field)
- Both routes share the same `_detect_handler()` logic

#### Problem 2: Response Field Name Mismatch
- **Frontend** expects: `isAuthentic` (boolean)
- **Backend** returned: `is_ai` (boolean, inverse)

**Fix:** Added `isAuthentic` field to `DetectionResponse` model (inverse of `is_ai`):
```python
class DetectionResponse(BaseModel):
    is_ai: bool
    isAuthentic: bool  # Frontend alias (inverse of is_ai)
    confidence: float
    metrics: DetectionMetrics
    filename: str
    duration_seconds: float
    model_used: str
```

#### Problem 3: Missing Python Dependencies
- **`torch` and `transformers`** were not in `requirements.txt` despite being required for the Wav2Vec2 model

**Fix:** Added to `requirements.txt`:
```
torch>=2.0.0
transformers>=4.30.0
```

#### Problem 4: Vite Proxy Configuration
- Frontend uses relative URL `/api/detect` (not absolute `http://localhost:8000/...`)

**Fix:** Added proxy to `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
},
```

#### Problem 5: Unicode Encoding Issues
- Print statements with emoji characters caused `UnicodeEncodeError` on Windows (cp1252 codec)

**Fix:** Replaced all Unicode emoji characters with ASCII equivalents in `main.py`.

#### Problem 6: MIME Type for Audio Files
- Browsers may send `application/octet-stream` for some audio types

**Fix:** Added `application/octet-stream` to allowed MIME types.

---

## How to Start the Backend Server

### Step 1: Install Python Dependencies (one-time)

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start the Backend Server

```bash
cd backend
python main.py
```

The server will:
1. Load the Wav2Vec2 model from HuggingFace (`garystafford/wav2vec2-deepfake-voice-detector`)
2. Start on `http://localhost:8000`
3. Print available endpoints

### Step 3: Start the Frontend (separate terminal)

```bash
npm run dev
```

The frontend will:
1. Start on `http://localhost:3000`
2. Proxy `/api/*` requests to the backend on port 8000

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server info (name, version, model status) |
| `/health` | GET | Health check with model status |
| `/api/detect` | POST | **Frontend endpoint** (accepts `audio` field) |
| `/api/v1/detect` | POST | Original backend (accepts `file` field) |

### POST /api/detect - Response Format

```json
{
  "is_ai": false,
  "isAuthentic": true,
  "confidence": 55.2,
  "metrics": {
    "pitch_anomaly": 0.0004,
    "spectral_centroid": 453.48,
    "mfcc_variance": 612.1764,
    "zero_crossing_rate": 0.0526,
    "spectral_rolloff": 454.59,
    "spectral_bandwidth": 135.72,
    "rms_energy": 0.3369
  },
  "filename": "test.wav",
  "duration_seconds": 1.0,
  "model_used": "Wav2Vec2 Deepfake Detector"
}
```

---

## How to Retrain the Model

### Option 1: Classical ML Training (Recommended for Small Datasets)

```bash
cd backend

# Place audio files in data/real/ and data/ai_generated/
# Then run training:
python train_model.py --data_dir ./data --output ./models/voice_classifier.pkl
```

**Dataset Structure:**
```
backend/data/
├── real/           # Human voice recordings (.wav, .mp3, .flac, etc.)
└── ai_generated/   # AI-generated / deepfake voice files
```

**Training Features:**
- Extracts 129 acoustic features per file (MFCCs, spectral, temporal, chroma)
- Trains 4 classifiers: RandomForest, GradientBoosting, SVM-RBF, XGBoost
- Builds ensemble of top 2 models
- Uses data augmentation for small datasets
- Outputs `.pkl` file with best model + scaler

### Option 2: Wav2Vec2 Fine-Tuning (Requires GPU)

```bash
cd backend
pip install datasets  # Additional dependency

python train_wav2vec2.py --data_dir ./data --output_dir ./models/wav2vec2_model/
```

**Note:** The Wav2Vec2 model is loaded from HuggingFace at runtime and does not require retraining for basic inference. Fine-tuning is only needed if you want to improve accuracy on your specific dataset.

---

## Model Information

| Property | Value |
|----------|-------|
| **Model ID** | `garystafford/wav2vec2-deepfake-voice-detector` |
| **Type** | Wav2Vec2 transformer for audio classification |
| **Accuracy** | 95%+ (claimed by model author) |
| **Input** | Audio files (WAV, MP3, FLAC, OGG, M4A, AAC) |
| **Output** | Binary classification (real/fake) + confidence + acoustic metrics |
| **Max File Size** | 25 MB |
| **Sample Rate** | 16,000 Hz (resampled automatically) |

---

## Testing the Integration

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

### Test Detection Endpoint
```bash
curl -X POST http://localhost:8000/api/detect \
  -F "audio=@your_audio_file.wav"
```

### Expected Response
- `isAuthentic: true` = Human voice detected
- `isAuthentic: false` = AI/deepfake voice detected
- `confidence` = 0-100% confidence score

---

## Files Modified (No Frontend Changes)

| File | Change |
|------|--------|
| `vite.config.ts` | Added proxy config for `/api` routes |
| `backend/main.py` | Added `/api/detect` route, `isAuthentic` field, ASCII-safe prints |
| `backend/requirements.txt` | Added `torch` and `transformers` dependencies |

**Frontend files were NOT modified.**

---

## Troubleshooting

### "Model not loaded" Error
- Check internet connection (model downloads from HuggingFace on first run)
- Ensure `torch` and `transformers` are installed: `pip install torch transformers`

### Port 8000 Already in Use
```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change port in backend/main.py (line: uvicorn.run(..., port=8000))
```

### CORS Errors
The backend allows all origins in development. For production, restrict `allow_origins` in `backend/main.py`.

### Encoding Errors on Windows
If you see `UnicodeEncodeError`, the `main.py` print statements may contain non-ASCII characters. The current version has been fixed for Windows compatibility.

---

*Generated by Codebuff on August 29, 2026*
