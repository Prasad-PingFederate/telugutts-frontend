import requests
import json

API_KEY = "sk_beecc30b39f7a653a20e35af66a38d5f81df63b9bd4dcd49"

print("Fetching all available voices from your ElevenLabs account...\n")

response = requests.get(
    "https://api.elevenlabs.io/v1/voices",
    headers={"xi-api-key": API_KEY}
)

if response.status_code == 200:
    data = response.json()
    voices = data.get('voices', [])
    
    print(f"Found {len(voices)} voices\n")
    print("=" * 80)
    
    for voice in voices:
        name = voice.get('name', 'Unknown')
        voice_id = voice.get('voice_id', 'Unknown')
        labels = voice.get('labels', {})
        category = voice.get('category', 'unknown')
        
        # Get language info
        description = voice.get('description', '')
        
        print(f"\nName: {name}")
        print(f"Voice ID: {voice_id}")
        print(f"Category: {category}")
        print(f"Labels: {labels}")
        if description:
            print(f"Description: {description}")
        print("-" * 80)
        
    # Also save to file for reference
    with open('all_voices.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("\n✅ All voices saved to: all_voices.json")
    print("\nLook for voices with:")
    print("- 'multilingual' in labels")
    print("- 'indian' or 'south asian' accent")
    print("- Good for Telugu pronunciation")
    
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)
