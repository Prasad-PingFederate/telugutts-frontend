from gtts import gTTS
import os

with open("comparison_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

print("Generating gTTS (RunPod Equivalent)...")
tts = gTTS(text=text, lang="te", slow=False)
tts.save("sample_gtts.mp3")
print("Done: sample_gtts.mp3")
