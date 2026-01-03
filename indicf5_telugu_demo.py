"""
IndicF5 Telugu Voice Cloning Demo
==================================
This script demonstrates how to use IndicF5 for Telugu text-to-speech with voice cloning.

Requirements:
1. Python 3.10
2. IndicF5 installed: pip install git+https://github.com/ai4bharat/IndicF5.git
3. A reference audio file (your voice sample, 3-10 seconds recommended)
"""

from transformers import AutoModel
import numpy as np
import soundfile as sf
import os

def generate_telugu_speech(
    text_to_speak,
    reference_audio_path,
    reference_text,
    output_filename="telugu_output.wav"
):
    """
    Generate Telugu speech using IndicF5 with voice cloning.
    
    Args:
        text_to_speak (str): Telugu text you want to convert to speech
        reference_audio_path (str): Path to your voice sample audio file
        reference_text (str): Transcript of what's said in the reference audio
        output_filename (str): Name of the output audio file
    
    Returns:
        str: Path to the generated audio file
    """
    
    print("🚀 Loading IndicF5 model...")
    print("(This may take a few minutes on first run)")
    
    # Load IndicF5 from Hugging Face
    repo_id = "ai4bharat/IndicF5"
    model = AutoModel.from_pretrained(repo_id, trust_remote_code=True)
    
    print("✅ Model loaded successfully!")
    print(f"\n📝 Generating speech for: {text_to_speak[:50]}...")
    print(f"🎤 Using reference audio: {reference_audio_path}")
    
    # Generate speech
    audio = model(
        text_to_speak,
        ref_audio_path=reference_audio_path,
        ref_text=reference_text
    )
    
    # Normalize audio if needed
    if audio.dtype == np.int16:
        audio = audio.astype(np.float32) / 32768.0
    
    # Save the output
    sf.write(output_filename, np.array(audio, dtype=np.float32), samplerate=24000)
    
    print(f"✅ Audio saved successfully to: {output_filename}")
    return output_filename


# Example 1: Simple Telugu greeting
def example_1_simple_greeting():
    """Example with a simple Telugu greeting"""
    print("\n" + "="*60)
    print("EXAMPLE 1: Simple Telugu Greeting")
    print("="*60)
    
    telugu_text = "నమస్కారం! నేను తెలుగులో మాట్లాడుతున్నాను."
    
    # NOTE: You need to provide your own reference audio
    # For this example, we'll use a placeholder path
    ref_audio = "my_voice_sample.wav"  # Replace with your audio file
    ref_text = "ఇది నా వాయిస్ శాంపిల్."  # What you said in the recording
    
    print(f"\n📝 Text: {telugu_text}")
    print(f"🎤 Reference: {ref_audio}")
    print(f"📄 Reference text: {ref_text}")
    
    # Uncomment below to run (after providing your reference audio)
    # generate_telugu_speech(telugu_text, ref_audio, ref_text, "example1_greeting.wav")


# Example 2: Longer Telugu text
def example_2_story():
    """Example with a longer Telugu text"""
    print("\n" + "="*60)
    print("EXAMPLE 2: Telugu Story Snippet")
    print("="*60)
    
    telugu_text = """
    ఒకప్పుడు ఒక చిన్న గ్రామంలో ఒక తెలివైన బాలుడు ఉండేవాడు. 
    అతను ప్రతిరోజు పుస్తకాలు చదివేవాడు మరియు కొత్త విషయాలు నేర్చుకునేవాడు.
    """
    
    ref_audio = "my_voice_sample.wav"  # Replace with your audio file
    ref_text = "ఇది నా వాయిస్ శాంపిల్."
    
    print(f"\n📝 Text: {telugu_text[:100]}...")
    
    # Uncomment below to run (after providing your reference audio)
    # generate_telugu_speech(telugu_text, ref_audio, ref_text, "example2_story.wav")


# Example 3: Using existing audio from your project
def example_3_with_existing_audio():
    """Example using audio files that might already exist in your project"""
    print("\n" + "="*60)
    print("EXAMPLE 3: Using Existing Project Audio")
    print("="*60)
    
    # Check if you have any existing audio files
    audio_files = [f for f in os.listdir('.') if f.endswith(('.wav', '.mp3'))]
    
    if audio_files:
        print(f"\n📁 Found {len(audio_files)} audio files in current directory:")
        for i, file in enumerate(audio_files[:5], 1):
            print(f"   {i}. {file}")
    else:
        print("\n⚠️  No audio files found in current directory")
    
    print("\n💡 TIP: You can use any of these as reference audio!")


# Main demo function
def main():
    """Run the demo"""
    print("\n" + "🎯"*30)
    print("   IndicF5 Telugu Voice Cloning Demo")
    print("🎯"*30)
    
    print("\n📋 How to use IndicF5 for Telugu Voice Cloning:")
    print("   1. Record a 3-10 second audio clip of your voice")
    print("   2. Transcribe what you said in that clip")
    print("   3. Provide the Telugu text you want to generate")
    print("   4. IndicF5 will clone your voice and speak the new text!")
    
    print("\n🔑 Key Features:")
    print("   ✅ Zero-shot voice cloning (no training needed)")
    print("   ✅ Cross-lingual support (reference can be in any language)")
    print("   ✅ High-quality 24kHz audio output")
    print("   ✅ Supports 11 Indian languages including Telugu")
    
    # Run examples
    example_1_simple_greeting()
    example_2_story()
    example_3_with_existing_audio()
    
    print("\n" + "="*60)
    print("📝 NEXT STEPS:")
    print("="*60)
    print("1. Install IndicF5:")
    print("   conda create -n indicf5 python=3.10 -y")
    print("   conda activate indicf5")
    print("   pip install git+https://github.com/ai4bharat/IndicF5.git")
    print("\n2. Record your voice sample (save as 'my_voice_sample.wav')")
    print("\n3. Update the reference audio paths in this script")
    print("\n4. Run: python indicf5_telugu_demo.py")
    print("="*60)


if __name__ == "__main__":
    main()
