async function convertTextToSpeech() {
  const text = document.getElementById("inputText").value;

  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();

  if (!data.audio_base64) {
    alert("No audio returned.");
    return;
  }

  // Convert base64 → audio playable URL
  const audioSrc = `data:audio/mp3;base64,${data.audio_base64}`;

  // Play audio
  const audio = document.getElementById("player");
  audio.src = audioSrc;
  audio.style.display = "block";
  audio.play();

  // Save audio for downloading later (STEP 2)
  window.generatedAudio = data.audio_base64;

  // Show download button (STEP 2)
  const downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) downloadBtn.style.display = "inline-block";
}

