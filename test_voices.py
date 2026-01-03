import asyncio
import edge_tts

async def test_voice(voice_name, text, output_file):
    """Test a specific voice with prosody controls for natural speech"""
    try:
        # Add SSML for better prosody (pauses, intonation)
        communicate = edge_tts.Communicate(text, voice_name, rate='+0%', pitch='+0Hz')
        await communicate.save(output_file)
        print(f"✓ Generated: {output_file} with {voice_name}")
        return True
    except Exception as e:
        print(f"✗ Failed {voice_name}: {e}")
        return False

async def main():
    # Test text with punctuation for natural pauses
    test_text = """నమస్కారం! నేను తెలుగు వాయిస్ అసిస్టెంట్. 
    
    ఈ రోజు మీకు ఎలా సహాయం చేయగలను? మీరు ఏదైనా ప్రశ్న అడగవచ్చు."""
    
    print("Testing Telugu voices...\n")
    
    # Test both available Telugu voices
    voices = [
        ("te-IN-MohanNeural", "male_mohan.mp3"),
        ("te-IN-ShrutiNeural", "female_shruti.mp3")
    ]
    
    for voice, output in voices:
        await test_voice(voice, test_text, output)
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(main())
