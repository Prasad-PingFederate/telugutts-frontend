async function convertToSpeech() {
    const text = document.getElementById("text-input").value.trim();
    const status = document.getElementById("status");
    const audioPlayer = document.getElementById("audio-player");
    const downloadBtn = document.getElementById("download-btn");

    // Reset UI
    audioPlayer.style.display = "none";
    downloadBtn.style.display = "none";
    status.innerText = "";

    // Validation
    if (!text) {
        status.innerText = "⚠️ Please enter some Telugu text.";
        status.style.color = "red";
        return;
    }

    status.innerText = "⏳ Generating audio, please wait...";
    status.style.color = "#444";

    try {
        const response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!data.audio_base64) {
            status.innerText = "❌ Error generating speech.";
            status.style.color = "red";
            return;
        }

        // Convert Base64 → MP3 URL
        const audioSrc = "data:audio/mp3;base64," + data.audio_base64;

        // Show audio player
        audioPlayer.src = audioSrc;
        audioPlayer.style.display = "block";
        audioPlayer.play();

        // Enable download button
        downloadBtn.href = audioSrc;
        downloadBtn.style.display = "block";
        downloadBtn.innerText = "Download MP3";

        status.innerText = "✅ Audio ready!";
        status.style.color = "green";

    } catch (err) {
        status.innerText = "❌ Error communicating with server.";
        status.style.color = "red";
        console.error(err);
    }
}
