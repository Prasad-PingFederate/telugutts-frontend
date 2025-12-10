// ------------- CONFIGURE THIS -------------
// Put here your backend base URL (no trailing slash).
// Examples:
// - If you have a Runpod/RunPod-managed API: "https://api.runpod.ai/v2/76h1nrfetqvwu1"
// - If you deploy your own serverless function on Vercel: "https://your-backend-domain.com"
// Your code will POST to `${BACKEND_API}/run` and poll `${BACKEND_API}/status/{id}` if needed.
const BACKEND_API = "https://api.runpod.ai/v2/76h1nrfetqvwu1";
// -------------------------------------------

const textInput = document.getElementById("textInput");
const generateBtn = document.getElementById("generateBtn");
const statusEl = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer");
const playerArea = document.getElementById("playerArea");
const downloadBtn = document.getElementById("downloadBtn");

let lastAudioBlob = null;

function setStatus(s, color = "#333") {
  statusEl.style.color = color;
  statusEl.innerText = s;
}

function base64ToBlob(base64, mime = "audio/mpeg") {
  const byteChars = atob(base64.replace(/^data:.*;base64,/, ""));
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

async function pollStatus(id, interval = 2000, maxAttempts = 60) {
  // Poll /status/{id} until it returns audio in output.audio_base64
  const url = `${BACKEND_API}/status/${id}`;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        // server returned error; show message but continue polling a few times
        console.warn("Status poll not ok", res.status);
      } else {
        const json = await res.json();
        // If backend wraps audio under output.audio_base64 (Runpod style)
        if (json.output && json.output.audio_base64) {
          return json.output.audio_base64;
        }
        // Or if it returns { audio_base64: "..." }
        if (json.audio_base64) {
          return json.audio_base64;
        }
        // Or maybe backend returns job status "completed" with data.url for audio file
        if (json.status === "completed" && json.output && json.output.url) {
          // fetch the url and convert to blob
          const audioRes = await fetch(json.output.url);
          const blob = await audioRes.blob();
          // convert blob to base64
          return await blobToBase64(blob);
        }
      }
    } catch (err) {
      console.warn("Poll error:", err);
    }
    setStatus(`Waiting for audio... (${attempt + 1}/${maxAttempts})`, "#666");
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error("Timeout waiting for audio");
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result.split(",")[1]);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}

async function createAudioFromBase64(b64) {
  try {
    // If b64 starts with data:...;base64, strip; base64ToBlob handles both
    const blob = base64ToBlob(b64, "audio/mpeg");
    lastAudioBlob = blob;
    const url = URL.createObjectURL(blob);
    audioPlayer.src = url;
    playerArea.style.display = "block";
    setStatus("Audio ready — play or download.", "#0a7a00");
    downloadBtn.disabled = false;
  } catch (err) {
    console.error(err);
    setStatus("Failed to create audio from response.", "crimson");
  }
}

generateBtn.addEventListener("click", async () => {
  const text = textInput.value.trim();
  if (!text) {
    setStatus("Please enter some text first.", "crimson");
    return;
  }
  // UI
  generateBtn.disabled = true;
  downloadBtn.disabled = true;
  playerArea.style.display = "none";
  setStatus("Sending request…");

  try {
    // Attempt to POST directly to backend run endpoint
    const runUrl = `${BACKEND_API}/run`;
    const res = await fetch(runUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // If your backend requires an API key in header, you must configure server-side
        // and not embed secrets in frontend.
      },
      body: JSON.stringify({ input: { text } })
    });

    if (!res.ok) {
      const textResp = await res.text();
      throw new Error(`Server returned ${res.status}: ${textResp}`);
    }

    const json = await res.json();

    // Case A: backend immediately returns audio in response (common: output.audio_base64)
    if (json.output && json.output.audio_base64) {
      await createAudioFromBase64(json.output.audio_base64);
      generateBtn.disabled = false;
      return;
    }
    // Case B: backend returns audio_base64 at top level
    if (json.audio_base64) {
      await createAudioFromBase64(json.audio_base64);
      generateBtn.disabled = false;
      return;
    }
    // Case C (async): backend returns job id (Runpod style returns id)
    if (json.id) {
      setStatus("Job submitted. Polling for result...");
      try {
        const base64 = await pollStatus(json.id, 2000, 60);
        await createAudioFromBase64(base64);
      } catch (err) {
        console.error(err);
        setStatus("Timed out waiting for audio. Try again later.", "crimson");
      }
      generateBtn.disabled = false;
      return;
    }

    // Case D: backend returns a URL with audio file
    if (json.output && json.output.url) {
      // fetch the audio file and play
      const audioRes = await fetch(json.output.url);
      if (!audioRes.ok) throw new Error("Could not download audio file");
      const blob = await audioRes.blob();
      lastAudioBlob = blob;
      audioPlayer.src = URL.createObjectURL(blob);
      playerArea.style.display = "block";
      setStatus("Audio ready — play or download.", "#0a7a00");
      generateBtn.disabled = false;
      downloadBtn.disabled = false;
      return;
    }

    // Unknown response
    console.warn("Unknown backend response:", json);
    setStatus("Server returned an unexpected response. Check console.", "crimson");
    generateBtn.disabled = false;

  } catch (err) {
    console.error("Error sending request:", err);
    setStatus("Error: " + (err.message || err), "crimson");
    generateBtn.disabled = false;
  }
});

downloadBtn.addEventListener("click", () => {
  if (!lastAudioBlob) {
    setStatus("No audio available to download.", "crimson");
    return;
  }
  const url = URL.createObjectURL(lastAudioBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "speech.mp3";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
