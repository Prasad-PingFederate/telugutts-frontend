import asyncio
import edge_tts

VOICE = "te-IN-MohanNeural"
INPUT_FILE = "story.txt"
OUTPUT_FILE = "story_pig_edge.mp3"

async def main():
    print(f"Reading {INPUT_FILE}...")
    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            text = f.read()
    except FileNotFoundError:
        print("Error: story.txt not found. Please ensure the file exists.")
        return

    if not text.strip():
        print("Error: Story text is empty.")
        return

    print(f"Generating audio using {VOICE} (Free Edge TTS)...")
    communicate = edge_tts.Communicate(text, VOICE)
    
    await communicate.save(OUTPUT_FILE)
    print(f"Done! Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
