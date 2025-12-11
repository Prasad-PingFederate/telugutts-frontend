async function convertToSpeech() {
  const text = document.getElementById("text-input").value.trim();
  const status = document.getElementById("status");
  const audioPlayer = document.getElementById("audio-player");
  const downloadBtn = document.getElementById("download-btn");

  audioPlayer.style.display = "none";
  downloadBtn.style.display = "none";
  status.innerText = "";

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
    console.log("Frontend got:", data);

    if (!data.audio_base64) {
      status.innerText = "❌ Error generating speech.";
      status.style.color = "red";
      return;
    }

    const audioSrc = "data:audio/mp3;base64," + data.audio_base64;

    audioPlayer.src = audioSrc;
    audioPlayer.style.display = "block";
    audioPlayer.play().catch(()=>{});

    downloadBtn.href = audioSrc;
    downloadBtn.style.display = "inline-block";
    downloadBtn.innerText = "Download MP3";

    status.innerText = "✅ Audio ready!";
    status.style.color = "green";

  } catch (err) {
    status.innerText = "❌ Error communicating with server.";
    status.style.color = "red";
    console.error(err);
  }
}
