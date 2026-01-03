
# RunPod FastAPI Implementation Guide

This guide explains how to use the new FastAPI implementation for your Telugu TTS service on RunPod.

## 1. Why FastAPI?
- **Automatic Documentation**: Access Swagger UI at `/docs` to test endpoints.
- **Easy Validation**: Automatically ensures `text` is present and correct.
- **High Performance**: Built on modern Python async standards.

## 2. Setup Locally (Testing)

First, install the requirements:
```bash
pip install -r requirements_runpod.txt
```

Run the server:
```bash
python runpod_fastapi.py
# OR
uvicorn runpod_fastapi:app --reload
```

## 3. Deployment to RunPod (RunPod Pod / VPS)

If you are using a standard **RunPod Pod** (the kind where you rent a GPU/CPU machine):

1.  SSH into your Pod or use the Web Terminal.
2.  Upload `runpod_fastapi.py` and `requirements_runpod.txt`.
3.  Install: `pip install -r requirements_runpod.txt`.
4.  Run: `python runpod_fastapi.py`.
5.  **Important**: Make sure you expose **Port 8000** (TCP) in your RunPod configuration settings so the outside world can access it.
    *   Your API URL will be: `https://<YOUR-POD-ID>-8000.proxy.runpod.net/api/generate` (RunPod Proxy)
    *   OR `http://<PUBLIC-IP>:8000/api/generate` (Direct IP)

## 4. API Usage

**POST** `/api/generate`

**Body:**
```json
{
  "text": "మీరు ఎలా ఉన్నారు?",
  "voice": "te-IN-MohanNeural",
  "rate": "-5%",
  "pitch": "+0Hz"
}
```

## 5. Deployment to RunPod (Serverless)

*Note: This specific `runpod_fastapi.py` is designed for a persistent Pod (server). If you specifically want RunPod Serverless (where you pay per second), we need to wrap this logic in a `runpod.serverless.start()` handler instead of `uvicorn`.*

If you want the **Serverless** version, let me know, and I will create the `handler.py` wrapper for it!
