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

        if (!data.audio) {
            throw new Error("No audio returned from backend.");
        }

        audioPlayer.src = "data:audio/mp3;base64," + data.audio;
        playerArea.style.display = "block";
        downloadBtn.style.display = "inline-block";

        downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = audioPlayer.src;
            a.download = "tts_audio.mp3";
            a.click();
        };

        statusEl.innerText = "Done!";
    } catch (err) {
        console.error("Error:", err);
        statusEl.innerText = "Error: " + err.message;
    } finally {
        document.getElementById("generateBtn").disabled = false;
    }
}

// ⭐ VERY IMPORTANT — Without this line the button will NOT work
document.getElementById("generateBtn").addEventListener("click", generateAudio);
