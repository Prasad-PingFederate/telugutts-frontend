
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
    
    # Get input
    job_input = job["input"]
    text = job_input.get("text", "")
    ref_text = job_input.get("reference_text", "")
    ref_audio_b64 = job_input.get("reference_audio", None)

    if not text:
        return {"error": "No text provided"}

    # Ensure model is loaded
    try:
        model = load_model()
    except Exception as e:
        return {"error": f"Model load failed: {str(e)}"}

    # Handle Reference Audio
    if ref_audio_b64:
        try:
            # Decode provided audio
            ref_bytes = base64.b64decode(ref_audio_b64)
            ref_audio_path = "temp_ref.wav"
            with open(ref_audio_path, "wb") as f:
                f.write(ref_bytes)
            print("Using custom reference audio")
        except Exception as e:
            return {"error": f"Invalid reference audio: {str(e)}"}
    else:
        # Use default
        ref_audio_path = "female_shruti.mp3"
        print("Using default reference audio")
        if not os.path.exists(ref_audio_path):
            print("Downloading default audio...")
            import requests # Lazy import
            # Real Telugu sample would be better, but we need a valid path
            # Let's try to generate one or assume it exists from previous steps
            # Ideally, downloading the one form GitHub if missing
            try:
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
