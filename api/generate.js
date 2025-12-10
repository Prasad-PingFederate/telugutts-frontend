export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    const { text } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Text is required" });
    }

    const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

    if (!RUNPOD_API_KEY) {
        return res.status(500).json({ error: "Missing RUNPOD_API_KEY in Vercel" });
    }

    try {
        // 1️⃣ Submit job to RunPod
        const runResponse = await fetch(
            "https://api.runpod.ai/v2/76h1nrfetqvwu1/run",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${RUNPOD_API_KEY}`
                },
                body: JSON.stringify({
                    input: { text }
                })
            }
        );

        const runData = await runResponse.json();

        if (!runData.id) {
            return res.status(500).json({ error: "Invalid RunPod response", data: runData });
        }

        const jobId = runData.id;

        // 2️⃣ Poll RunPod until audio is ready
        const pollURL = `https://api.runpod.ai/v2/76h1nrfetqvwu1/status/${jobId}`;

        for (let attempt = 1; attempt <= 60; attempt++) {
            await new Promise(r => setTimeout(r, 2000)); // wait 2 seconds

            const statusResp = await fetch(pollURL, {
                headers: {
                    "Authorization": `Bearer ${RUNPOD_API_KEY}`
                }
            });

            const statusData = await statusResp.json();

            // When audio becomes ready
            if (statusData?.output?.audio_base64) {
                return res.status(200).json({
                    audio_base64: statusData.output.audio_base64
                });
            }
        }

        return res.status(500).json({ error: "Timeout waiting for audio" });

    } catch (err) {
        return res.status(500).json({
            error: "Server Error",
            details: err.message
        });
    }
}
