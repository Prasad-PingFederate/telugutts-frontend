# Current TTS Integration Status

As requested, we have currently integrated **3 distinct Text-to-Speech engines** into your application. All three are active and configured.

## 1. Nova (OpenAI)
*   **Type**: Premium AI Voice
*   **Frontend Label**: `Nova (OpenAI)`
*   **Backend File**: `api/openai-tts.js`
*   **Technology**: OpenAI `tts-1-hd` model.
*   **Cost**: Paid (Usage based).
*   **Status**: ✅ **Active**

## 2. Male (Standard)
*   **Type**: Free Edge TTS
*   **Frontend Label**: `Male (Standard)`
*   **Backend File**: `api/male.py`
*   **Technology**: Microsoft Edge TTS (Voice: `te-IN-MohanNeural`).
*   **Cost**: Free.
*   **Status**: ✅ **Active** (Verified `api/requirements.txt` includes `edge-tts`).

## 3. Female (AI)
*   **Type**: RunPod Serverless
*   **Frontend Label**: `Female (AI)`
*   **Backend File**: `api/tts.js`
*   **Technology**: Custom python script on RunPod (likely gTTS).
*   **Cost**: RunPod Serverless pricing.
*   **Status**: ✅ **Active** (Connects to Endpoint `76h1nrfetqvwu1`).
*   **Note**: Speed is automically adjusted to **1.3x** in `script.js` for this voice specifically.

---
## Deployment
All three backends are configured as **Vercel Serverless Functions**.
- No extra server management is required.
- The "FastAPI" solution we discussed is **NOT** currently being used, preserving your current setup.
