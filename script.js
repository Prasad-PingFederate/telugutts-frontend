async function generateAudio() {
    const text = document.getElementById("textInput").value;
    const statusEl = document.getElementById("status");
    const audioPlayer = document.getElementById("audioPlayer");
    const downloadBtn = document.getElementById("downloadBtn");
    const playerArea = document.getElementById("playerArea");

    if (!text.trim()) {
        statusEl.innerText = "Please enter text.";
        return;
    }

    statusEl.innerText = "Sending to backend...";
    document.getElementById("generateBtn").disabled = true;

    try {
        // Call your backend API
        const response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error("Backend error: " + errText);
        }

        const data = await response.json();

        // IMPORTANT: Your backend returns audio_base64, NOT audio
        if (!data.audio_base64) {
            throw new Error("No audio received from backend.");
        }

        // Set audio player source
        audioPlayer.src = "data:audio/mp3;base64," + data.audio_base64;
        playerArea.style.display = "block";
        downloadBtn.style.display = "inline-block";

        // Download button
        downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = audioPlayer.src;
            a.download = "tts_audio.mp3";
            a.click();
        };

        statusEl.innerText = "Done!";
    } catch (error) {
        console.error(error);
        statusEl.innerText = "Error: " + error.message;
    } finally {
        document.getElementById("generateBtn").disabled = false;
    }
}

// IMPORTANT CODE — Without this the button will NOT work
document.getElementById("generateBtn").addEventListener("click", generateAudio);
