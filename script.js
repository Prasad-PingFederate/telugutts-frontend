const RUNPOD_ENDPOINT = "https://api.runpod.ai/v2/76h1nrfetqvwu1";
const API_KEY = process.env.RUNPOD_API_KEY;

async function generateAudio() {
    const text = document.getElementById("textInput").value;
    const statusEl = document.getElementById("status");
    const audioPlayer = document.getElementById("audioPlayer");
    const downloadBtn = document.getElementById("downloadBtn");

    if (!text.trim()) {
        statusEl.innerText = "Please enter some text.";
        return;
    }

    statusEl.innerText = "Sending request...";

    try {
        // 1️⃣ Submit Job
        const runResponse = await fetch(`${RUNPOD_ENDPOINT}/run`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                input: { text }
            })
        });

        const runData = await runResponse.json();
        const jobId = runData.id;

        statusEl.innerText = "Processing...";

        // 2️⃣ Poll Job Status
        let result = null;

        while (true) {
            const statusResponse = await fetch(`${RUNPOD_ENDPOINT}/status/${jobId}`, {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`
                }
            });

            const statusData = await statusResponse.json();

            if (statusData.status === "COMPLETED") {
                result = statusData.output;
                break;
            }

            if (statusData.status === "FAILED") {
                statusEl.innerText = "Generation failed.";
                return;
            }

            // wait 1 second before checking again
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // 3️⃣ Display Audio
        const base64 = result.audio_base64;

        audioPlayer.src = "data:audio/mp3;base64," + base64;
        audioPlayer.style.display = "block";
        downloadBtn.style.display = "block";

        // Prepare download
        downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = audioPlayer.src;
            a.download = "tts_audio.mp3";
            a.click();
        };

        statusEl.innerText = "Done!";

    } catch (error) {
        statusEl.innerText = "Something went wrong: " + error.message;
    }
}
