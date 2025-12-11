export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body ?? {};
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const RUNPOD_ENDPOINT = `https://api.runpod.ai/v2/76h1nrfetqywu1/runsync`;
    const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

    const rpResp = await fetch(RUNPOD_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RUNPOD_API_KEY}`
      },
      body: JSON.stringify({ input: { text } })
    });

    const result = await rpResp.json();
    console.log("RunPod result:", result);

    // RunPod returns AUDIO here (2-level output sometimes)
    const audio =
      result?.output?.audio_base64 ||
      result?.output?.output?.audio_base64;

    if (!audio) {
      console.error("No audio in RunPod output:", result);
      return res.status(502).json({
        error: "No audio in RunPod output",
        result
      });
    }

    return res.status(200).json({
      audio_base64: audio,
      message: "Audio generated successfully"
    });

  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}



