/***********************************************
 * TELUGU TTS FRONTEND SCRIPT
 * Author: ChatGPT (Optimized Build)
 * Flow:
 *  1) POST → /run (start TTS job)
 *  2) GET → /status/{id} (poll until ready)
 *  3) Convert Base64 → MP3
 *  4) Play + Download
 ************************************************/

// 🔥 IMPORTANT — replace with your correct RunPod endpoint
const RUNPOD_BASE = "https://api.runpod.ai/v2/76h1nrfetqvwu1";

// ---------------- HTML ELEMENTS ----------------
const textInput = document.getElementById("textInput");
const generateBtn = document.getElementById("generateBtn");
const statusEl = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer");
const playerArea = document.getElementById("playerArea");
const downloadBtn = document.getElementById("downloadBtn");

let audioBlob = null;

// ---------------- UTILITY FUNCTIONS --------------

function setStatus(msg, color = "#333") {
    statusEl.style.color = color;
    statusEl.textContent = msg;
}

function base64ToBlob(base64, mimeType = "audio/mpeg") {
    const byteString = atob(base64);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([byteArray], { type: mimeType });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------- RUNPOD JOB POLLING ----------------

async function pollForAudio(jobId) {
    const maxAttempts = 60; // try for ~2 minutes
    const pollURL = `${RUNPOD_BASE}/status/${jobId}`;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        setStatus(`Generating audio... (${attempt}/${maxAttempts})`, "#555");

        try {
            const response = await fetch(pollURL);
            const data = await response.json();

            // When RunPod returns audio
            if (data?.output?.audio_base64) {
                return data.output.audio_base64;
            }

        } catch (error) {
            console.warn("Error while polling:", error);
        }

        await sleep(2000); // wait 2 seconds before next attempt
    }

    throw new Error("Timeout: Audio generation took too long.");
}

// ---------------- PLAY AUDIO ----------------

function playAudioFromBase64(base64) {
    audioBlob = base64ToBlob(base64);

    const audioURL = URL.createObjectURL(audioBlob);
    audioPlayer.src = audioURL;

    playerArea.style.display = "block";
    setStatus("Audio ready!", "green");
}

// ---------------- DOWNLOAD MP3 ----------------

downloadBtn.addEventListener("click", () => {
    if (!audioBlob) {
        return alert("Audio not generated yet.");
    }

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "telugu-tts.mp3";
    document.body.appendChild(a);
    a.click();
    a.remove();
});

// ---------------- MAIN WORKFLOW ----------------

generateBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();

    if (!text) {
        setStatus("Please enter Telugu text.", "red");
        return;
    }

    generateBtn.disabled = true;
    playerArea.style.display = "none";
    setStatus("Submitting request…");

    try {
        // Step 1: Submit TTS job
        const response = await fetch(`${RUNPOD_BASE}/run`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // IMPORTANT:
                // If your RunPod endpoint requires Bearer token,
                // you CANNOT use it directly from frontend.
                // Instead proxy via Vercel API.
            },
            body: JSON.stringify({
                input: { text }
            })
        });

        const json = await response.json();

        if (!json.id) {
            throw new Error("Invalid RunPod response: No job id.");
        }

        const jobId = json.id;

        // Step 2: Poll until audio is ready
        const base64Audio = await pollForAudio(jobId);

        // Step 3: Play audio
        playAudioFromBase64(base64Audio);

    } catch (error) {
        console.error(error);
        setStatus("Something went wrong: " + error.message, "red");
    }

    generateBtn.disabled = false;
});
