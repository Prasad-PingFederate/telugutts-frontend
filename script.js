async function generateAudio() {
    const text = document.getElementById("textInput").value;
    const statusEl = document.getElementById("status");
    const audioPlayer = document.getElementById("audioPlayer");
    const downloadBtn = document.getElementById("downloadBtn");

    statusEl.innerText = "Sending to backend...";

    const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });

    const data = await response.json();

    audioPlayer.src = "data:audio/mp3;base64," + data.audio;
    audioPlayer.style.display = "block";
    downloadBtn.style.display = "block";

    statusEl.innerText = "Done!";
}

