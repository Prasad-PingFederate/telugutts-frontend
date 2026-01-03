# IndicF5 Integration Guide for telugutts.com

## 🎯 Overview

IndicF5 is a state-of-the-art voice cloning model that can generate Telugu speech using ANY voice sample. This guide shows how to integrate it into your Telugu TTS website.

---

## 🌟 Key Advantages

| Feature | IndicF5 | Your Current Solutions |
|---------|---------|----------------------|
| **Voice Cloning** | ✅ Yes (zero-shot) | ❌ No |
| **Quality** | 🔥 Near-human | ✅ Good |
| **Telugu Support** | ✅ Native | ✅ Yes |
| **Setup Complexity** | ⚠️ Medium | ✅ Easy |
| **Cost** | ✅ Free (self-hosted) | 💰 API costs |
| **Customization** | 🔥 Full voice cloning | ❌ Limited |

---

## 📦 Installation

### Step 1: Create Environment
```bash
conda create -n indicf5 python=3.10 -y
conda activate indicf5
pip install git+https://github.com/ai4bharat/IndicF5.git
```

### Step 2: Test Installation
```python
from transformers import AutoModel
model = AutoModel.from_pretrained("ai4bharat/IndicF5", trust_remote_code=True)
print("✅ IndicF5 installed successfully!")
```

---

## 🎙 How Voice Cloning Works

### The 3-Input System

1. **Text to Synthesize** (Telugu)
   ```
   "నమస్కారం! నేను తెలుగులో మాట్లాడుతున్నాను."
   ```

2. **Reference Audio** (Any language, 3-10 seconds)
   - Your voice saying anything
   - Can be in Telugu, English, or any language
   - Quality matters: clear, no background noise

3. **Reference Text** (Transcript of reference audio)
   ```
   "This is my voice sample."  (if reference is in English)
   OR
   "ఇది నా వాయిస్ శాంపిల్."  (if reference is in Telugu)
   ```

### Example Code
```python
from transformers import AutoModel
import soundfile as sf

model = AutoModel.from_pretrained("ai4bharat/IndicF5", trust_remote_code=True)

audio = model(
    "నమస్కారం! నేను తెలుగులో మాట్లాడుతున్నాను.",  # Telugu output
    ref_audio_path="user_voice.wav",                    # Your voice
    ref_text="Hello, this is my voice."                 # What you said
)

sf.write("output.wav", audio, samplerate=24000)
```

---

## 🚀 Integration Options

### Option 1: RunPod Deployment (Recommended)

**Pros:**
- GPU acceleration (faster generation)
- Scalable
- Similar to your current setup

**Steps:**
1. Create a RunPod serverless endpoint
2. Deploy IndicF5 model
3. Create API endpoint similar to your current `api/tts.js`
4. Add voice upload feature to frontend

**Estimated Cost:** ~$0.0002 per second of audio generated

### Option 2: Vercel Edge Function (Limited)

**Pros:**
- No additional infrastructure
- Easy deployment

**Cons:**
- ⚠️ Model is large (~2GB), may exceed Vercel limits
- ⚠️ CPU-only (slower)
- ⚠️ Cold starts will be slow

**Not Recommended** due to size constraints

### Option 3: Dedicated Server

**Pros:**
- Full control
- No per-request costs
- Best performance

**Cons:**
- Requires server management
- Monthly hosting costs

---

## 💡 Feature Ideas for telugutts.com

### 1. **"Clone Your Voice" Feature**
```
┌─────────────────────────────────────┐
│  🎤 Clone Your Voice                │
├─────────────────────────────────────┤
│  Step 1: Record 5-10 seconds        │
│  [🔴 Record] [⏹ Stop]               │
│                                     │
│  Step 2: Type what you said         │
│  [Text input box]                   │
│                                     │
│  Step 3: Enter Telugu text          │
│  [Telugu text box]                  │
│                                     │
│  [🎯 Generate with My Voice]        │
└─────────────────────────────────────┘
```

### 2. **Voice Library**
- Pre-recorded voice samples (male/female)
- Users can select from library OR upload their own
- Save user's voice for future use (with permission)

### 3. **Comparison Mode**
```
Generate the same text with:
☐ Mohan (Telugu) - Edge TTS
☐ Shruti (Telugu) - Edge TTS  
☐ Nova (OpenAI)
☑ Your Cloned Voice (IndicF5)
```

---

## 🔧 Implementation Plan

### Phase 1: Testing (Week 1)
- [ ] Install IndicF5 locally
- [ ] Test with sample Telugu text
- [ ] Test with your own voice
- [ ] Measure generation speed
- [ ] Evaluate quality

### Phase 2: Backend Setup (Week 2)
- [ ] Set up RunPod endpoint with IndicF5
- [ ] Create API endpoint (`api/indicf5-tts.js`)
- [ ] Implement audio upload handling
- [ ] Add voice sample storage (S3/Cloudinary)

### Phase 3: Frontend Integration (Week 3)
- [ ] Add "Clone Your Voice" UI
- [ ] Implement audio recording
- [ ] Add voice selection dropdown
- [ ] Update script.js to call new API

### Phase 4: Launch (Week 4)
- [ ] Beta testing with select users
- [ ] Gather feedback
- [ ] Optimize performance
- [ ] Public launch

---

## 📊 Expected Performance

| Metric | Value |
|--------|-------|
| **Generation Speed** | ~2-5 seconds for 10 seconds of audio (GPU) |
| **Audio Quality** | 24kHz, near-human |
| **Voice Similarity** | 85-95% (with good reference) |
| **Supported Text Length** | Up to 500 characters recommended |

---

## 🎯 Quick Start Test

Run this to test IndicF5 right now:

```bash
# 1. Install
conda create -n indicf5 python=3.10 -y
conda activate indicf5
pip install git+https://github.com/ai4bharat/IndicF5.git

# 2. Run demo
cd C:\Users\Infobell\.gemini\antigravity\scratch\telugu_tts_fix
python indicf5_telugu_demo.py
```

---

## 🤔 Should You Integrate IndicF5?

### ✅ YES, if you want:
- Voice cloning capability
- Unique selling point for your website
- Premium feature for users
- Full control over voice generation

### ❌ MAYBE NOT, if:
- You're satisfied with current quality
- Don't want to manage additional infrastructure
- Voice cloning isn't a priority feature

---

## 💰 Cost Comparison

### Current Setup (per 1000 requests)
- OpenAI TTS: ~$15
- Edge TTS: Free
- gTTS: Free

### With IndicF5 (RunPod)
- IndicF5: ~$0.20 (with GPU)
- **96% cost reduction vs OpenAI!**

---

## 📞 Next Steps

1. **Test Locally First**
   ```bash
   python indicf5_telugu_demo.py
   ```

2. **Record Your Voice Sample**
   - 5-10 seconds
   - Clear audio
   - No background noise

3. **Generate Test Audio**
   - Use your voice sample
   - Generate Telugu speech
   - Compare with current solutions

4. **Decide on Integration**
   - If quality is good → Plan deployment
   - If not satisfied → Stick with current setup

---

## 🔗 Resources

- **IndicF5 GitHub:** https://github.com/AI4Bharat/IndicF5
- **Hugging Face Model:** https://huggingface.co/ai4bharat/IndicF5
- **Demo Script:** `indicf5_telugu_demo.py`

---

**Questions? Let me know and I'll help you integrate this!** 🚀
