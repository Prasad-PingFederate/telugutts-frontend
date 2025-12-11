console.log("SCRIPT LOADED");

async function convertTextToSpeech() {
  console.log("BUTTON CLICKED");

  const text = document.getElementById("textInput").value;

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

  const audioSrc = `data:audio/mp3;base64,${data.audio_base64}`;

  const audio = document.getElementById("player");
  audio.src = audioSrc;
  audio.style.display = "block";
  audio.play();

  window.generatedAudio = data.audio_base64;

  document.getElementById("downloadBtn").style.display = "inline-block";
}

function downloadAudio(base64Audio) {
  const link = document.createElement("a");
  link.href = `data:audio/mp3;base64,${base64Audio}`;
  link.download = "tts_audio.mp3";
  link.click();
}


