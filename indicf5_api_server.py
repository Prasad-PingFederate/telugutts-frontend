"""
IndicF5 FastAPI Server for Telugu Voice Cloning
================================================
This is a production-ready API server for IndicF5 Telugu TTS with voice cloning.
Can be deployed on RunPod or any server with GPU.

Features:
- Voice cloning with user-uploaded audio
- Pre-defined voice library
- Async processing
- Audio caching
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoModel
import soundfile as sf
import numpy as np
import os
import hashlib
import tempfile
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="IndicF5 Telugu TTS API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
model = None
CACHE_DIR = Path("./audio_cache")
CACHE_DIR.mkdir(exist_ok=True)

# Pre-defined voice library
VOICE_LIBRARY = {
    "male_1": {
        "audio": "voices/male_1.wav",
        "text": "నమస్కారం, నేను తెలుగులో మాట్లాడుతున్నాను.",
        "description": "Clear male voice"
    },
    "female_1": {
        "audio": "voices/female_1.wav",
        "text": "హలో, నేను తెలుగు మాట్లాడగలను.",
        "description": "Soft female voice"
    }
}


@app.on_event("startup")
async def load_model():
    """Load IndicF5 model on startup"""
    global model
    logger.info("🚀 Loading IndicF5 model...")
    
    try:
        repo_id = "ai4bharat/IndicF5"
        model = AutoModel.from_pretrained(repo_id, trust_remote_code=True)
        logger.info("✅ IndicF5 model loaded successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "IndicF5 Telugu TTS",
        "model_loaded": model is not None,
        "available_voices": list(VOICE_LIBRARY.keys())
    }


@app.get("/voices")
async def list_voices():
    """List available pre-defined voices"""
    return {
        "voices": [
            {
                "id": voice_id,
                "description": voice_data["description"]
            }
            for voice_id, voice_data in VOICE_LIBRARY.items()
        ]
    }


def generate_cache_key(text: str, ref_audio_hash: str) -> str:
    """Generate cache key for audio"""
    combined = f"{text}_{ref_audio_hash}"
    return hashlib.md5(combined.encode()).hexdigest()


def save_audio(audio_data: np.ndarray, filename: str) -> str:
    """Save audio to file"""
    if audio_data.dtype == np.int16:
        audio_data = audio_data.astype(np.float32) / 32768.0
    
    sf.write(filename, np.array(audio_data, dtype=np.float32), samplerate=24000)
    return filename


@app.post("/generate")
async def generate_speech(
    text: str = Form(..., description="Telugu text to synthesize"),
    voice_id: str = Form(None, description="Pre-defined voice ID from library"),
    reference_audio: UploadFile = File(None, description="Custom voice audio file"),
    reference_text: str = Form(None, description="Transcript of reference audio"),
    use_cache: bool = Form(True, description="Use cached audio if available")
):
    """
    Generate Telugu speech with voice cloning
    
    Two modes:
    1. Use pre-defined voice: Provide only 'text' and 'voice_id'
    2. Custom voice: Provide 'text', 'reference_audio', and 'reference_text'
    """
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Determine which voice to use
        if voice_id:
            # Use pre-defined voice
            if voice_id not in VOICE_LIBRARY:
                raise HTTPException(
                    status_code=400,
                    detail=f"Voice ID '{voice_id}' not found. Available: {list(VOICE_LIBRARY.keys())}"
                )
            
            voice_data = VOICE_LIBRARY[voice_id]
            ref_audio_path = voice_data["audio"]
            ref_text = voice_data["text"]
            ref_audio_hash = voice_id
            
        elif reference_audio and reference_text:
            # Use custom uploaded voice
            # Save uploaded audio temporarily
            temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            content = await reference_audio.read()
            temp_audio.write(content)
            temp_audio.close()
            
            ref_audio_path = temp_audio.name
            ref_text = reference_text
            ref_audio_hash = hashlib.md5(content).hexdigest()
            
        else:
            raise HTTPException(
                status_code=400,
                detail="Either provide 'voice_id' OR both 'reference_audio' and 'reference_text'"
            )
        
        # Check cache
        cache_key = generate_cache_key(text, ref_audio_hash)
        cached_file = CACHE_DIR / f"{cache_key}.wav"
        
        if use_cache and cached_file.exists():
            logger.info(f"✅ Returning cached audio for: {text[:50]}...")
            return FileResponse(
                cached_file,
                media_type="audio/wav",
                headers={"X-Cache": "HIT"}
            )
        
        # Generate speech
        logger.info(f"🎙 Generating speech for: {text[:50]}...")
        logger.info(f"🎤 Using reference: {ref_audio_path}")
        
        audio = model(
            text,
            ref_audio_path=ref_audio_path,
            ref_text=ref_text
        )
        
        # Save to cache
        output_file = save_audio(audio, str(cached_file))
        
        logger.info(f"✅ Speech generated successfully!")
        
        # Cleanup temporary file if custom voice was used
        if not voice_id and reference_audio:
            os.unlink(ref_audio_path)
        
        return FileResponse(
            output_file,
            media_type="audio/wav",
            headers={"X-Cache": "MISS"}
        )
        
    except Exception as e:
        logger.error(f"❌ Error generating speech: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-batch")
async def generate_batch(
    texts: list[str] = Form(..., description="List of Telugu texts"),
    voice_id: str = Form(..., description="Voice ID to use for all texts")
):
    """Generate multiple audio files with the same voice"""
    
    if voice_id not in VOICE_LIBRARY:
        raise HTTPException(
            status_code=400,
            detail=f"Voice ID '{voice_id}' not found"
        )
    
    results = []
    
    for i, text in enumerate(texts):
        try:
            voice_data = VOICE_LIBRARY[voice_id]
            
            audio = model(
                text,
                ref_audio_path=voice_data["audio"],
                ref_text=voice_data["text"]
            )
            
            output_file = CACHE_DIR / f"batch_{i}_{hashlib.md5(text.encode()).hexdigest()}.wav"
            save_audio(audio, str(output_file))
            
            results.append({
                "index": i,
                "text": text,
                "audio_url": f"/download/{output_file.name}",
                "status": "success"
            })
            
        except Exception as e:
            results.append({
                "index": i,
                "text": text,
                "status": "error",
                "error": str(e)
            })
    
    return {"results": results}


@app.get("/download/{filename}")
async def download_audio(filename: str):
    """Download generated audio file"""
    file_path = CACHE_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(file_path, media_type="audio/wav")


@app.delete("/cache")
async def clear_cache():
    """Clear audio cache"""
    try:
        count = 0
        for file in CACHE_DIR.glob("*.wav"):
            file.unlink()
            count += 1
        
        return {"message": f"Cleared {count} cached files"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    # Run server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
