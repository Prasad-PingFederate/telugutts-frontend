
import requests
import base64
import time

API_URL = "http://localhost:8000/api/generate"

def test_fastapi():
    print(f"Testing FastAPI at {API_URL}...")
    
    payload = {
        "text": "నమస్కారం, ఇది ఫాస్ట్ ఏపిఐ (FastAPI) టెస్ట్.",
        "voice": "te-IN-MohanNeural",
        "rate": "-5%",
        "pitch": "+0Hz"
    }
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json=payload)
        duration = time.time() - start_time
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"Message: {data['message']}")
            print(f"Time taken: {duration:.2f}s")
            
            # Save audio
            if 'audio_base64' in data:
                audio_bytes = base64.b64decode(data['audio_base64'])
                filename = "fastapi_output.mp3"
                with open(filename, "wb") as f:
                    f.write(audio_bytes)
                print(f"💾 Audio saved to {filename}")
        else:
            print("❌ Failed")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server.")
        print("Make sure you are running 'uvicorn runpod_fastapi:app --reload' in a separate terminal!")

if __name__ == "__main__":
    test_fastapi()
