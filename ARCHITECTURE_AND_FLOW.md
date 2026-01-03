# 🏗️ Telugu TTS Application Architecture & Workflow

This document outlines the complete technical architecture and data flow of the **Telugu Text-to-Speech (TTS) Application**. It explains how the Frontend, Backend (Vercel), AI Infrastructure (RunPod), and DNS all work together to deliver the final audio product.

---

## 🗺️ High-Level Architecture Diagram

```mermaid
graph TD
    User[👤 User / Browser] -->|1. Enters Text & Clicks Generate| Website[🌐 telugutts.com (Frontend)]
    Website -->|2. Secure POST Request| VercelAPI[⚙️ Vercel Serverless Function (/api/tts)]
    
    subgraph Vercel Cloud
        VercelAPI -->|3. Validates Key & Forward| RunPodAPI[🚀 RunPod Serverless Endpoint]
    end
    
    subgraph RunPod Cloud (GPU)
        RunPodAPI -->|4. Process Text-to-Speech| Model[🤖 AI Model (GPU Worker)]
        Model -->|5. Return Audio (Base64)| RunPodAPI
    end
    
    RunPodAPI -->|6. JSON Response| VercelAPI
    VercelAPI -->|7. JSON Response| Website
    Website -->|8. Decodes & Plays| Audio[🔊 Audio Output]
```

---

## 🧩 Component Breakdown

### 1. **The Frontend (User Interface)**
*   **Technologies**: HTML5, CSS3 (Modern Gradient UI), Vanilla JavaScript.
*   **Hosting**: Vercel (Edge Network).
*   **Role**:
    *   Displays the input box and "Generate" button.
    *   Captures user input (Telugu text).
    *   **Crucially**: It does *not* talk to RunPod directly. This prevents exposing your secret API keys to the public. Instead, it talks to *your* own backend (`/api/tts`).

### 2. **The Backend (Middleware API)**
*   **Technologies**: Node.js (Vercel Serverless Function).
*   **File**: `api/tts.js`.
*   **Role**:
    *   Acts as a **Secure Proxy**.
    *   It holds the secret `RUNPOD_API_KEY` in environment variables (server-side only).
    *   Receives text from the frontend.
    *   Authenticates with RunPod.
    *   Handles the communication strategy (checking for errors, parsing the complex nested JSON response from RunPod).

### 3. **The AI Engine (RunPod)**
*   **Infrastructure**: Serverless GPU Workers.
*   **Role**:
    *   Receives the text payload.
    *   Loads the heavy AI Text-to-Speech model.
    *   converts text -> spectrogram -> audio waveform.
    *   Returns the raw audio data encoded as a **Base64 String** (a text representation of the audio file).

### 4. **DNS & Networking**
*   **Domain**: `telugutts.com`.
*   **Provider**: Your Registrar (GoDaddy/Namecheap).
*   **Configuration**:
    *   **A Record** (`76.76.21.21`) points directly to Vercel's load balancers.
    *   **CNAME** (`cname.vercel-dns.com`) handles the `www` subdomain.
    *   This ensures that when a user types your domain, they are routed instantly to the Vercel deployment closest to them.

---

## 🔄 Step-by-Step Data Flow

Here is exactly what happens when you click "Generate Speech":

1.  **Input**: You type "నమస్కారం" and click the button.
2.  **Frontend Request**:
    *   `script.js` sends a `POST` request to `https://telugutts.com/api/tts`.
    *   Payload: `{ "text": "నమస్కారం" }`.
3.  **Vercel Processing**:
    *   The `api/tts.js` function wakes up.
    *   It checks for the `RUNPOD_API_KEY` (stored securely in Vercel Dashboard).
    *   It formats a new request to `https://api.runpod.ai/v2/76h1nrfetqvwu1/runsync`.
4.  **AI Execution**:
    *   RunPod receives the authorized request.
    *   The GPU generates the audio in milliseconds.
    *   RunPod sends back a JSON object containing the audio in `output.output.audio_base64`.
5.  **Response Handling**:
    *   Vercel receives the big JSON object.
    *   It extracts *only* the audio string to verify it exists.
    *   It sends a clean success message back to the browser.
6.  **Playback**:
    *   `script.js` receives the Base64 string.
    *   It cleans it (removes spaces/headers).
    *   It converts Base64 -> Binary Data -> Blob -> Audio URL.
    *   The `<audio>` player src is updated, and the browser plays the sound.

---

## 🔒 Security Features

*   **Hidden API Keys**: The `RUNPOD_API_KEY` is never sent to the user's browser. It exists only on the Vercel server. If we called RunPod directly from `script.js`, anyone could steal your key and use your credits.
*   **Input Validation**: The API rejects empty requests before they even reach RunPod, saving you money.
*   **Error Masking**: Detailed server errors are logged for you, but user-friendly messages are shown to the visitors.

---

## 🚀 Deployment Summary

*   **Source Code**: Managed in your local folder / GitHub.
*   **Deployment Tool**: `Vercel CLI`.
*   **Sync**: When you run `vercel --prod`, code is pushed to Vercel's cloud, built, and distributed globally in seconds.
