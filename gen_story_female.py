import asyncio
import edge_tts

# Try a different voice just in case, or list them.
# Common Telugu voices: te-IN-MohanNeural (Male), te-IN-ShrutiNeural (Female)
VOICE = "te-IN-ShrutiNeural"
INPUT_FILE = "story.txt"
OUTPUT_FILE = "story_pig_edge_female.mp3"

async def main():
    print(f"Reading {INPUT_FILE}...")
    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            text = f.read()
    except FileNotFoundError:
        print("Error: story.txt not found.")
        return

    print(f"Generating audio using {VOICE}...")
    communicate = edge_tts.Communicate(text, VOICE)
    
    await communicate.save(OUTPUT_FILE)
    print(f"Done! Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
