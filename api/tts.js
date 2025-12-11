// Vercel serverless function (API route)
export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    // Validate text
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text provided" });
    }

    // --- RunPod SYNC endpoint ---
    const RUNPOD_ENDPOINT = "https://api.runpod.ai/v2/76h1nrfetqywu1/runsync";
    const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

    console.log("➡ Sending request to RunPod...");

    const response = await fetch(RUNPOD_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RUNPOD_API_KEY}`
      },
      body: JSON.stringify({
        input: { text }
      })
    });

    const result = await response.json();
    console.log("⬅ RunPod Result:", result);

    // --- Validate RunPod Output ---
    if (!result.output) {
      console.error("❌ RunPod returned no output:", result);
      return res.status(500).json({ error: "RunPod returned no output", result });
    }

    if (!result.output.audio_base64) {
      console.error("❌ No audio returned:", result.output);
      return res.status(500).json({ error: "Audio missing in RunPod output", output: result.output });
    }

    // SUCCESS — Send audio back to frontend
    return res.status(200).json({
      audio_base64: result.output.audio_base64,
      message: "Audio generated successfully"
    });

  } catch (error) {
    console.error("🔥 BACKEND ERROR:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
