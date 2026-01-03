import requests
import json

def generate():
    print("Reading story.txt...")
    try:
        with open('story.txt', 'r', encoding='utf-8') as f:
            text = f.read()
    except FileNotFoundError:
        print("story.txt not found")
        return

    url = 'https://telugutts-frontend-llc8gewyg-prasad-dammais-projects.vercel.app/api/openai-tts'
    print(f"Requesting OpenAI Audio from {url}...")

    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    try:
        response = requests.post(url, headers=headers, json={"text": text})
        print(f"Status Code: {response.status_code}")
        print(f"headers: {response.headers}")

        if response.status_code != 200:
            print("Error Text (first 500 chars):")
            print(response.text[:500])
            return

        data = response.json()
        if 'audio_base64' in data:
            import base64
            audio_bytes = base64.b64decode(data['audio_base64'])
            with open('story_pig.mp3', 'wb') as f:
                f.write(audio_bytes)
            print("Done: story_pig.mp3")
            print(f"File size: {len(audio_bytes)} bytes")
        else:
            print("No audio_base64 in response")
            print(data)

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    generate()
