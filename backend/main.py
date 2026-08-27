# main.py - Complete working backend with Wav2Vec2 model
import os
import tempfile
import torch
import librosa
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
from pathlib import Path
import uvicorn

# ─── App Initialization ─────────────────────────────────────
app = FastAPI(
    title="Midas AI — Voice Deepfake Detection API",
    description="Detects AI-generated voice deepfakes using Wav2Vec2",
    version="3.0.0"
)

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Response Models ──────────────────────────────────────
class DetectionMetrics(BaseModel):
    pitch_anomaly: float
    spectral_centroid: float
    mfcc_variance: float
    zero_crossing_rate: float
    spectral_rolloff: float
    spectral_bandwidth: float
    rms_energy: float

class DetectionResponse(BaseModel):
    is_ai: bool
    confidence: float
    metrics: DetectionMetrics
    filename: str
    duration_seconds: float
    model_used: str

# ─── Load Model on Startup ────────────────────────────────
print("=" * 60)
print("🎙️  Midas AI — Voice Deepfake Detection API")
print("=" * 60)

MODEL_ID = "garystafford/wav2vec2-deepfake-voice-detector"
print(f"📥 Loading model: {MODEL_ID}")

try:
    model = AutoModelForAudioClassification.from_pretrained(MODEL_ID)
    feature_extractor = AutoFeatureExtractor.from_pretrained(MODEL_ID)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None
    feature_extractor = None

# ─── Helper Functions ──────────────────────────────────────
def calculate_metrics(audio, sr, ai_probability):
    """Calculate acoustic metrics from audio"""
    try:
        # Spectral features
        spectral_centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr)[0]
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=audio, sr=sr)[0]
        zero_crossing_rate = librosa.feature.zero_crossing_rate(audio)[0]
        rms_energy = librosa.feature.rms(y=audio)[0]
        
        # MFCC features
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
        mfcc_var = float(np.var(mfccs.T, axis=0).mean())
        
        # Pitch analysis
        pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
        pitch_vals = pitches[pitches > 0]
        pitch_anomaly = float(np.std(pitch_vals) / 100) if len(pitch_vals) > 0 else 0.0
        
        return DetectionMetrics(
            pitch_anomaly=round(pitch_anomaly, 4),
            spectral_centroid=round(float(np.mean(spectral_centroid)), 2),
            mfcc_variance=round(mfcc_var, 4),
            zero_crossing_rate=round(float(np.mean(zero_crossing_rate)), 4),
            spectral_rolloff=round(float(np.mean(spectral_rolloff)), 2),
            spectral_bandwidth=round(float(np.mean(spectral_bandwidth)), 2),
            rms_energy=round(float(np.mean(rms_energy)), 4)
        )
    except Exception as e:
        print(f"Metrics error: {e}")
        return DetectionMetrics(
            pitch_anomaly=0.0,
            spectral_centroid=0.0,
            mfcc_variance=0.0,
            zero_crossing_rate=0.0,
            spectral_rolloff=0.0,
            spectral_bandwidth=0.0,
            rms_energy=0.0
        )

# ─── API Endpoints ─────────────────────────────────────────

@app.get("/")
async def root():
    """Root endpoint with server info"""
    return {
        "name": "Midas AI — Voice Detection API",
        "version": "3.0.0",
        "status": "running",
        "model_loaded": model is not None,
        "model_name": MODEL_ID if model else None
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_name": MODEL_ID if model else None,
        "model_accuracy": "95%+" if model else None
    }

@app.post("/api/v1/detect", response_model=DetectionResponse)
async def detect_audio(file: UploadFile = File(...)):
    """
    Analyze an audio file for AI-generated voice detection.
    Returns: is_ai, confidence, acoustic metrics, filename, duration.
    """
    # ─── Validation ──────────────────────────────────────────
    if model is None or feature_extractor is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please check the model repository."
        )

    # Check file type
    ext = Path(file.filename or "").suffix.lower().lstrip(".")
    allowed_exts = {"mp3", "wav", "flac", "ogg", "m4a", "aac"}
    allowed_mimes = {
        "audio/mpeg", "audio/wav", "audio/flac", "audio/mp3",
        "audio/x-wav", "audio/x-flac", "audio/ogg", "audio/x-m4a",
        "audio/mp4", "audio/aac"
    }
    
    if file.content_type not in allowed_mimes and ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {file.content_type} (.{ext}). "
                   f"Accepted: MP3, WAV, FLAC, OGG, M4A, AAC"
        )

    # Check file size (25 MB max)
    contents = await file.read()
    if len(contents) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum is 25 MB.")

    if len(contents) < 100:
        raise HTTPException(status_code=400, detail="File is empty or too small.")

    # ─── Process Audio ──────────────────────────────────────
    suffix = Path(file.filename or "audio.wav").suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        # Load audio
        audio, sr = librosa.load(tmp_path, sr=16000, mono=True)
        duration = len(audio) / sr
        
        # Process for model
        inputs = feature_extractor(
            audio, 
            sampling_rate=16000, 
            return_tensors="pt", 
            padding=True
        )
        
        # Predict
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=-1)
        
        # Get results
        is_ai = bool(probs[0, 1].item() > 0.5)
        confidence = float(max(probs[0]).item() * 100)
        
        # Calculate metrics
        metrics = calculate_metrics(audio, sr, probs[0, 1].item())
        
        return DetectionResponse(
            is_ai=is_ai,
            confidence=round(confidence, 1),
            metrics=metrics,
            filename=file.filename or "unknown",
            duration_seconds=round(duration, 2),
            model_used="Wav2Vec2 Deepfake Detector"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {type(e).__name__}: {e}")
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

# ─── Main Entry Point ──────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("🎙️  Midas AI — Voice Detection API")
    print(f"   Model: {'✅ LOADED' if model else '❌ NOT LOADED'}")
    if model:
        print(f"   Model: {MODEL_ID}")
        print(f"   Accuracy: 95%+")
    print(f"   Server: http://localhost:8000")
    print("=" * 60)
    print("Press CTRL+C to stop")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)