from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import edge_tts
import asyncio
import base64
import os
import tempfile
import re
import logging

# Initialize FastAPI App
app = FastAPI(
    title="Telugu TTS API (RunPod)",
    description="High-quality Telugu Text-to-Speech using Edge TTS",
    version="1.0.0"
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (update this for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Data Models ---
class TTSRequest(BaseModel):
    text: str = Field(..., description="Telugu text to convert to speech", min_length=1)
    voice: str = Field("te-IN-MohanNeural", description="Voice ID (default: te-IN-MohanNeural)")
    rate: str = Field("-5%", description="Speech rate adjustment (e.g., +0%, -5%)")
    pitch: str = Field("+0Hz", description="Speech pitch adjustment (e.g., +0Hz)")

class TTSResponse(BaseModel):
    audio_base64: str
    message: str
    details: dict = {}

# --- Helper Functions ---
def improve_text_naturalness(text: str) -> str:
    """
    Improve text spacing for better natural pauses.
    No SSML tags - they get read aloud by Edge TTS!
    """
    # Ensure proper spacing after punctuation
    text = re.sub(r'([.!?।])([^\s])', r'\1 \2', text)
    
    # Ensure spacing after commas
    text = re.sub(r',([^\s])', r', \1', text)
    
    # Normalize multiple spaces
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

# --- API Endpoints ---

@app.get("/")
async def root():
    return {"status": "online", "message": "Telugu TTS API is running 🚀"}

@app.post("/api/generate", response_model=TTSResponse)
async def generate_audio(request: TTSRequest):
    """
    Generate MP3 audio from Telugu text.
    """
    try:
        logger.info(f"Received request for voice: {request.voice}")
        
        # 1. Preprocess Text
        processed_text = improve_text_naturalness(request.text)
        logger.info(f"Processed text length: {len(processed_text)} chars")

        # 2. Setup Edge TTS
        communicate = edge_tts.Communicate(
            processed_text, 
            request.voice,
            rate=request.rate,
            pitch=request.pitch
        )
        
        # 3. Generate Audio to Temp File
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
            tmp_path = tmp_file.name
        
        await communicate.save(tmp_path)
        
        # 4. Read File and Convert to Base64
        with open(tmp_path, "rb") as audio_file:
            audio_bytes = audio_file.read()
            base64_audio = base64.b64encode(audio_bytes).decode('utf-8')
            
        # 5. Cleanup
        os.remove(tmp_path)
        
        return TTSResponse(
            audio_base64=base64_audio,
            message="Audio generated successfully",
            details={
                "chars_processed": len(processed_text),
                "voice_used": request.voice
            }
        )

    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        # Cleanup if temp file exists
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)
            
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8000)
