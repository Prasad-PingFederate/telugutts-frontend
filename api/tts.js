// /api/tts.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body ?? {};
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const RUNPOD_ENDPOINT_ID = '76h1nrfetqywu1'; // your endpoint ID
    const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
    const RUNPOD_URL = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/runsync`;

    if (!RUNPOD_API_KEY) {
      console.error("MISSING RUNPOD_API_KEY");
      return res.status(500).json({ error: "Server misconfiguration: missing RUNPOD_API_KEY" });
    }

    const rpResp = await fetch(RUNPOD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RUNPOD_API_KEY}`
      },
      body: JSON.stringify({ input: { text } })
    });

    const txt = await rpResp.text(); // read raw text first
    let result;
    try { result = JSON.parse(txt); } catch (e) {
      console.error("RunPod returned non-JSON:", txt);
      return res.status(502).json({ error: "RunPod non-JSON response", details: txt });
    }

    console.log("RunPod result:", result);

    if (!result.output) {
      console.error("RunPod output missing:", result);
      return res.status(502).json({ error: "RunPod returned no output", result });
    }

    if (!result.output.audio_base64) {
      console.error("audio_base64 missing in output:", result.output);
      return res.status(502).json({ error: "No audio in RunPod output", output: result.output });
    }

    return res.status(200).json({ audio_base64: result.output.audio_base64, message: result.message ?? "OK" });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", details: err.message ?? String(err) });
  }
}


