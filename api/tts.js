console.log("RUNPOD URL:", process.env.RUNPOD_ENDPOINT_URL);
console.log("RUNPOD KEY EXISTS:", !!process.env.RUNPOD_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required" });
    }

    const runpodUrl = process.env.RUNPOD_ENDPOINT_URL;
    const runpodKey = process.env.RUNPOD_API_KEY;

    const response = await fetch(runpodUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${runpodKey}`
      },
      body: JSON.stringify({
        input: { text }
      })
    });

    const result = await response.json();

    if (!result.output || !result.output.audio_base64) {
      return res.status(500).json({ error: "TTS failed" });
    }

    return res.status(200).json({
      audio_base64: result.output.audio_base64
    });

  } catch (err) {
    console.error("RunPod Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}




