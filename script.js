const ENDPOINT = "https://api.runpod.ai/v2/76h1nrfetqvwu1/run";   // Your RunPod Endpoint ID
const API_KEY = "";  // Optional. Leave blank unless you add API key.

async function generateAudio() {
    const text = document.getElementById("textInput").value.trim();
    const status = document.getElementById("status");
    const audioPlayer = document.getElementById("audioPlayer");
    const downloadBtn = document.getElementById("downloadBtn");

    if (!text) {
        alert("దయచేసి తెలుగు టెక్ట్స్ ఎంటర్ చేయండి.");
        return;
    }

    status.innerText = "⏳ Generating audio, please wait...";
    audioPlayer.style.display = "none";
    downloadBtn.style.display = "none";

    try {
        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(API_KEY && { "Authorization": `Bearer ${API_KEY}` })
            },
            body: JSON.stringify({ input: { text: text } })
        });

        const json = await response.json();
        const base64 = json.output.audio_base64;

        if (!base64) {
            status.innerText = "❌ Error generating audio.";
            return;
        }

        // Convert Base64 to audio blob
        const audioBlob = base64ToBlob(base64, "audio/mpeg");
        const audioUrl = URL.createObjectURL(audioBlob);

        audioPlayer.src = audioUrl;
        audioPlayer.style.display = "block";
        audioPlayer.play();

        // Enable download button
        downloadBtn.style.display = "block";
        downloadBtn.setAttribute("data-url", audioUrl);

        status.innerText = "✔ Audio generated successfully!";
    }
    catch (err) {
        status.innerText = "❌ Something went wrong.";
        console.error(err);
    }
}

function downloadAudio() {
    const url = document.getElementById("downloadBtn").getAttribute("data-url");
    const a = document.createElement("a");
    a.href = url;
    a.download = "tts_audio.mp3";
    a.click();
}

function base64ToBlob(base64, mime) {
    const byteChars = atob(base64);
    const byteNums = new Array(byteChars.length);

    for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
    }

    return new Blob([new Uint8Array(byteNums)], { type: mime });
}
