"""
Midas AI — Voice Detection API
Production inference API. No training code here.

Run:  python main.py
Train: python train_model.py --data_dir ./data --output ./models/voice_classifier.pkl
"""

import os
import pickle
import tempfile
import warnings
from pathlib import Path

import librosa
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Suppress warnings
warnings.filterwarnings('ignore')

# ─── App ─────────────────────────────────────────────────────
app = FastAPI(title="Midas AI — Voice Detection API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODELS_DIR / "voice_classifier.pkl"


# ─── Models ──────────────────────────────────────────────────
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


# ─── Feature Extraction (must match train_model.py exactly) ──
def extract_features(audio_path: str, sr: int = 22050) -> dict:
    """Extract a fixed-length feature vector from an audio file."""
    try:
        y, sr = librosa.load(audio_path, sr=sr, duration=30, mono=True)
    except Exception as e:
        raise ValueError(f"Failed to load audio: {e}")

    # Pad short audio to at least 1 second
    if len(y) < sr:
        y = np.pad(y, (0, sr - len(y)))

    # MFCCs — 20 coefficients × 2 (mean + std)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    mfcc_mean = np.mean(mfccs, axis=1)
    mfcc_std = np.std(mfccs, axis=1)
    mfcc_delta_mean = np.mean(librosa.feature.delta(mfccs), axis=1)
    mfcc_delta_std = np.std(librosa.feature.delta(mfccs), axis=1)

    # Spectral features
    spec_cent = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spec_roll = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    spec_bw = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
    spec_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    spec_flatness = librosa.feature.spectral_flatness(y=y)[0]

    # Temporal features
    zcr = librosa.feature.zero_crossing_rate(y)[0]
    rms = librosa.feature.rms(y=y)[0]

    # Pitch
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    mag_mask = magnitudes > np.median(magnitudes[magnitudes > 0]) if np.any(magnitudes > 0) else magnitudes > 0
    pitch_values = pitches[mag_mask]
    pitch_mean = float(np.mean(pitch_values)) if len(pitch_values) > 0 else 0.0
    pitch_std = float(np.std(pitch_values)) if len(pitch_values) > 0 else 0.0

    # Chroma
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)
    chroma_std = np.std(chroma, axis=1)

    # Onset strength
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onset_mean = float(np.mean(onset_env))
    onset_std = float(np.std(onset_env))

    # Assemble feature vector (must match train_model.py order)
    features = np.concatenate([
        mfcc_mean,              # 20
        mfcc_std,               # 20
        mfcc_delta_mean,        # 20
        mfcc_delta_std,         # 20
        [np.mean(spec_cent), np.std(spec_cent)],
        [np.mean(spec_roll), np.std(spec_roll)],
        [np.mean(spec_bw), np.std(spec_bw)],
        [np.mean(spec_contrast), np.std(spec_contrast)],
        [np.mean(spec_flatness), np.std(spec_flatness)],
        [np.mean(zcr), np.std(zcr)],
        [np.mean(rms), np.std(rms)],
        [pitch_mean, pitch_std],
        chroma_mean,            # 12
        chroma_std,             # 12
        [onset_mean, onset_std],
    ])

    # Human-readable metrics for the response
    metrics = {
        "pitch_anomaly": round(float(np.clip(pitch_std / (abs(pitch_mean) + 1e-6), 0, 5)), 4),
        "spectral_centroid": round(float(np.mean(spec_cent)), 2),
        "mfcc_variance": round(float(np.mean(mfcc_std)), 4),
        "zero_crossing_rate": round(float(np.mean(zcr)), 4),
        "spectral_rolloff": round(float(np.mean(spec_roll)), 2),
        "spectral_bandwidth": round(float(np.mean(spec_bw)), 2),
        "rms_energy": round(float(np.mean(rms)), 4),
    }

    return {
        "features": features,
        "metrics": metrics,
        "duration": float(librosa.get_duration(y=y, sr=sr)),
    }


# ─── Model Loading ───────────────────────────────────────────
_model_cache = None

def get_model():
    """Load and cache the trained model."""
    global _model_cache
    if _model_cache is not None:
        return _model_cache

    if not MODEL_PATH.exists():
        return None

    try:
        with open(MODEL_PATH, "rb") as f:
            _model_cache = pickle.load(f)
        return _model_cache
    except Exception as e:
        print(f"Error loading model: {e}")
        return None


# ─── Routes ──────────────────────────────────────────────────
@app.get("/")
async def root():
    model = get_model()
    return {
        "name": "Midas AI — Voice Detection API",
        "version": "2.0.0",
        "status": "running",
        "model_loaded": model is not None,
        "model_name": model.get("model_name", "unknown") if model else None,
        "model_accuracy": model.get("accuracy", 0) if model else None,
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": get_model() is not None}


@app.post("/api/v1/detect", response_model=DetectionResponse)
async def detect_audio(file: UploadFile = File(...)):
    """
    Analyze an audio file for AI-generated / deepfake voice detection.

    Returns: is_ai, confidence, acoustic metrics, filename, duration.
    If no trained model exists, returns 404 with instructions.
    """
    # Validate file type
    allowed = {
        "audio/mpeg", "audio/wav", "audio/flac", "audio/mp3",
        "audio/x-wav", "audio/x-flac", "audio/ogg", "audio/x-m4a",
        "audio/mp4", "audio/aac",
    }
    ext = Path(file.filename or "").suffix.lower().lstrip(".")
    ext_allowed = ext in {"mp3", "wav", "flac", "ogg", "m4a", "aac"}

    if file.content_type not in allowed and not ext_allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {file.content_type} (.{ext}). "
                   f"Accepted: MP3, WAV, FLAC, OGG, M4A",
        )

    # Validate size (25 MB)
    contents = await file.read()
    if len(contents) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum is 25 MB.")

    if len(contents) < 100:
        raise HTTPException(status_code=400, detail="File is empty or too small.")

    # Check model
    model_data = get_model()
    if model_data is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Model binary not loaded. Please copy a trained model to "
                "models/voice_classifier.pkl. Train with:\n"
                "  python train_model.py --data_dir ./data --output ./models/voice_classifier.pkl"
            ),
        )

    # Save to temp
    suffix = Path(file.filename or "audio.wav").suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        # Extract features
        result = extract_features(tmp_path)
        features = result["features"].reshape(1, -1)

        # Scale + predict
        model = model_data["model"]
        scaler = model_data.get("scaler")
        if scaler is not None:
            features = scaler.transform(features)

        # Make prediction
        prediction = model.predict(features)[0]
        
        # Get probabilities (handle models without predict_proba)
        try:
            probabilities = model.predict_proba(features)[0]
            confidence = float(max(probabilities) * 100)
        except (AttributeError, NotImplementedError):
            # Fallback for models without predict_proba
            confidence = 100.0 if prediction == 1 else 0.0

        is_ai = bool(prediction == 1)

        return DetectionResponse(
            is_ai=is_ai,
            confidence=round(confidence, 1),
            metrics=DetectionMetrics(**result["metrics"]),
            filename=file.filename or "unknown",
            duration_seconds=round(result["duration"], 2),
            model_used=model_data.get("model_name", "unknown"),
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid audio file: {e}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {type(e).__name__}: {e}")
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


if __name__ == "__main__":
    import uvicorn
    print("🎙️  Midas AI — Voice Detection API")
    print(f"   Model: {'loaded' if get_model() else 'NOT FOUND (run train_model.py)'}")
    print(f"   Server: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
