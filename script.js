async function convertTextToSpeech() {
  const text = document.getElementById("inputText").value;

  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();

  if (!data.audio_base64) {
    alert("No audio returned");
    return;
  }

  const audioSrc = `data:audio/mp3;base64,${data.audio_base64}`;
  const audio = document.getElementById("player");
  audio.src = audioSrc;
  audio.style.display = "block";
  audio.play();
}
