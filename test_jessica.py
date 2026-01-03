import requests
import json
import base64

# Test the ElevenLabs API directly
API_KEY = "sk_beecc30b39f7a653a20e35af66a38d5f81df63b9bd4dcd49"
VOICE_ID = "cgSgspJ2msm6clMCkdW9"  # Jessica voice

# Test text
text = "నమస్కారం! నేను జెస్సికా."

print("Testing ElevenLabs API...")
print(f"Text: {text}\n")

# Call ElevenLabs API
response = requests.post(
    f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
    headers={
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": API_KEY
    },
    json={
        "text": text,
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.0,
            "use_speaker_boost": True
        }
    }
)

if response.status_code == 200:
    print("✅ SUCCESS! ElevenLabs API is working!")
    print(f"Audio size: {len(response.content)} bytes")
    
    # Save test audio
    with open("test_jessica.mp3", "wb") as f:
        f.write(response.content)
    print("✅ Saved test audio to: test_jessica.mp3")
    print("\n🎉 Jessica voice is ready on your website!")
else:
    print(f"❌ ERROR: {response.status_code}")
    print(response.text)
