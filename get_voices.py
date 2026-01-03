import requests

API_KEY = "sk_beecc30b39f7a653a20e35af66a38d5f81df63b9bd4dcd49"

# Get all available voices
response = requests.get(
    "https://api.elevenlabs.io/v1/voices",
    headers={"xi-api-key": API_KEY}
)

if response.status_code == 200:
    voices = response.json()
    print("Available Voices:\n")
    for voice in voices.get('voices', []):
        name = voice.get('name', 'Unknown')
        voice_id = voice.get('voice_id', 'Unknown')
        labels = voice.get('labels', {})
        
        print(f"Name: {name}")
        print(f"Voice ID: {voice_id}")
        print(f"Labels: {labels}")
        print("-" * 50)
        
        # Find Jessica specifically
        if 'jessica' in name.lower():
            print(f"\n✅ FOUND JESSICA!")
            print(f"Voice ID: {voice_id}\n")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
