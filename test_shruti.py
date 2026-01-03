import asyncio
import edge_tts

async def main():
    voice = "te-IN-ShrutiNeural"
    text = "నమస్కారం, ఇది తెలుగు వాయిస్ టెస్ట్."
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save("test_shruti.mp3")
    print("Success")

if __name__ == "__main__":
    asyncio.run(main())
