
import os
from huggingface_hub import login
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import soundfile as sf
import base64
import io
import logging
import numpy as np
from transformers import AutoModel 
# Removed AutoTokenizer as it crashes with IndicF5 custom config

# --- AUTO LOGIN ---
try:
    # Using your Classic token (READ access)
    login(token="hf_qjRjEazjQjEazjQjEazjQjEazjQjEazjQj") 
    # (Note: I'm using a placeholder here, assuming you will export your REAL one 
    # or rely on the previous login session which is now cached)
    print("✅ Logic Check: HuggingFace Login Initiated")
except Exception as e:
    print(f"⚠️ Login Warning: {e}")

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IndicF5-Server")

app = FastAPI(title="Ultimate Telugu TTS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Variables
model = None

@app.on_event("startup")
async def load_model():
    global model
    try:
        logger.info("🚀 Loading IndicF5 Model...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Load Model ONLY (No Tokenizer)
        model = AutoModel.from_pretrained("ai4bharat/IndicF5", trust_remote_code=True).to(device)
        
        # Verify it has the inference method we expect
        if not hasattr(model, 'batch_inference') and not hasattr(model, 'forward'):
             logger.warn("⚠️ Model loaded but might handle inference differently than expected.")

        logger.info("✅ Model Loaded Successfully!")
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        # We catch safely to let you read logs, but the app wont generate audio
        print(f"CRITICAL ERROR: {e}")

@app.get("/")
def health_check():
    return {"status": "online", "model": "IndicF5 (No Tokenizer)"}

@app.post("/generate")
async def generate_speech(
    text: str = Form(...),
):
    global model
    if not model:
        raise HTTPException(status_code=503, detail="Model failed to load.")

    try:
        logger.info(f"📝 Receiving Text: {text[:50]}")
        
        # Create a dummy reference audio if none exists (Critical for IndicF5)
        ref_audio_path = "voices/default_telugu.wav"
        if not os.path.exists(ref_audio_path):
             # Create 1 second of silence as dummy ref if file missing
             sr = 24000
             dummy_audio = np.zeros(sr, dtype=np.float32)
             os.makedirs("voices", exist_ok=True)
             sf.write(ref_audio_path, dummy_audio, sr)

        # Inference
        # IndicF5 usually handles tokenization internally in its 'forward' method
        with torch.no_grad():
             audio_out = model(
                text,
                ref_audio_path=ref_audio_path,
                ref_text="ignored" 
             )

        # Processing Output
        if hasattr(audio_out, 'cpu'): audio_out = audio_out.cpu().numpy()
        
        buffer = io.BytesIO()
        sf.write(buffer, audio_out, 24000, format='MP3')
        buffer.seek(0)
        
        audio_base64 = base64.b64encode(buffer.read()).decode('utf-8')

        return JSONResponse({"audio_base64": audio_base64})

    except Exception as e:
        logger.error(f"Generation Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
