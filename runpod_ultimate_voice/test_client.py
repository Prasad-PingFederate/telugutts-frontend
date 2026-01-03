
"""
Simple script to test the RunPod API endpoint locally or remotely.
"""
import requests
import base64
import os

# Create dummy audio file if not exists
if not os.path.exists("test_ref.wav"):
    # This just creates an empty file, you should replace with real audio for real test
    with open("test_ref.wav", "wb") as f:
        f.write(b"dummy_wav_content")

url = "http://localhost:8000/generate"
# url = "https://your-runpod-id.proxy.runpod.net/generate"

files = {
    'reference_audio': ('test_ref.wav', open('test_ref.wav', 'rb'), 'audio/wav')
}

data = {
    'text': "నమస్కారం! ఇది టెస్ట్ వాయిస్.",
    'reference_text': "This is a reference text matching the audio."
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, data=data, files=files)
    
    if response.status_code == 200:
        result = response.json()
        audio_b64 = result.get('audio_base64')
        if audio_b64:
            # Decode and save
            with open("output_test.mp3", "wb") as f:
                f.write(base64.b64decode(audio_b64))
            print("✅ Success! Saved output_test.mp3")
        else:
            print("❌ No audio data in response")
    else:
        print(f"❌ Error: {response.text}")
        
except Exception as e:
    print(f"❌ Connection Failed: {e}")
