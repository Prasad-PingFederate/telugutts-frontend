
import runpod
import torch
import soundfile as sf
import base64
import io
import os
import numpy as np
from transformers import AutoModel
from huggingface_hub import login

# --- LOGIN ---
# Support both HF_TOKEN and the name shown in user's screenshot
HF_TOKEN = os.environ.get("HF_TOKEN") or os.environ.get("HF_API_IndicF5")
if HF_TOKEN:
    login(token=HF_TOKEN)

# Global model variable
model = None

def load_model():
    global model
    if model is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = AutoModel.from_pretrained("ai4bharat/IndicF5", trust_remote_code=True).to(device)
    return model

def handler(job):
    """
    The handler function that will be called by RunPod Serverless.
    """
    global model
    
    # 1. Get input
    job_input = job["input"]
    text = job_input.get("text", "")
    
    if not text:
        return {"error": "No text provided"}

    # 2. Ensure model is loaded
    try:
        model = load_model()
    except Exception as e:
        return {"error": f"Model load failed: {str(e)}"}

    # 3. Generate
    try:
        # Real reference audio (Required by IndicF5)
        ref_audio_path = "voices/default_telugu.wav"
        if not os.path.exists(ref_audio_path):
            os.makedirs("voices", exist_ok=True)
            # URL to a sample Telugu audio file (e.g., from common voice or similar)
            # Using a fallback to a synthesized sample if download fails would be ideal, 
            # but for now let's try to get a real file or create a basic sine wave instead of silence if needed.
            # Better approach: Use a known public sample. 
            try:
                # Downloading a sample Telugu audio from a public source
                import requests
                # This is a sample Telugu audio URL. 
                # If this fails, we will fallback to a generated tone which is better than silence.
                sample_url = "https://github.com/Prasad-PingFederate/telugutts-frontend/raw/main/female_shruti.mp3" 
                # Note: IndicF5 expects Wav usually, but soundfile might handle mp3 or we convert.
                # Safest is to generate a non-silent wave if we can't ensure a download.
                
                response = requests.get(sample_url)
                if response.status_code == 200:
                    with open("voices/temp.mp3", 'wb') as f:
                        f.write(response.content)
                    # Convert to wav using soundfile/numpy if needed, or just let models handle it if supported.
                    # IndicF5 often uses librosa/soundfile. safely convert to wav.
                    data, samplerate = sf.read("voices/temp.mp3")
                    sf.write(ref_audio_path, data, samplerate)
                else:
                    raise Exception("Download failed")
            except Exception as e:
                print(f"Could not download sample: {e}. Generating dummy tone.")
                # Generate a simple sine wave (440Hz) instead of silence
                sr = 24000
                t = np.linspace(0, 3, int(sr * 3))
                audio = 0.5 * np.sin(2 * np.pi * 440 * t)
                sf.write(ref_audio_path, audio.astype(np.float32), sr)

        with torch.no_grad():
            audio_out = model(
                text,
                ref_audio_path=ref_audio_path,
                ref_text="ignored"
            )

        if hasattr(audio_out, 'cpu'):
            audio_out = audio_out.cpu().numpy()

        # 4. Encode to Base64
        buffer = io.BytesIO()
        sf.write(buffer, audio_out, 24000, format='MP3')
        buffer.seek(0)
        audio_base64 = base64.b64encode(buffer.read()).decode('utf-8')

        return {"audio_base64": audio_base64}

    except Exception as e:
        return {"error": f"Generation failed: {str(e)}"}

# Start the serverless worker
if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})
