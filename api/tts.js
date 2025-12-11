export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { text } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({ error: "No text provided" });
        }

        const ENDPOINT_ID = "76h1nrfetqywu1";   // make sure this is your REAL endpoint ID
        const RUNPOD_ENDPOINT = `https://api.runpod.ai/v2/${ENDPOINT_ID}/run`;
        const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

        // Call RunPod
        const runResponse = await fetch(RUNPOD_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RUNPOD_API_KEY}`
            },
            body: JSON.stringify({
                input: { text }
            })
        });

        const runData = await runResponse.json();
        const jobId = runData.id;

        if (!jobId) {
            return res.status(500).json({ error: "RunPod returned no job ID", data: runData });
        }

        // Polling
        const STATUS_URL = `https://api.runpod.ai/v2/${ENDPOINT_ID}/status/${jobId}`;
        let tries = 0;

        while (tries < 30) {
            await new Promise(r => setTimeout(r, 1000));

            const checkRes = await fetch(STATUS_URL, {
                headers: { "Authorization": `Bearer ${RUNPOD_API_KEY}` }
            });
            const checkData = await checkRes.json();

            if (checkData.status === "COMPLETED") {
                return res.status(200).json({
                    audio_base64: checkData.output.audio_base64
                });
            }

            if (checkData.status === "FAILED") {
                return res.status(500).json({ error: "RunPod job failed", details: checkData.error });
            }

            tries++;
        }

        return res.status(408).json({ error: "Timeout" });

    } catch (err) {
        return res.status(500).json({
            error: "Internal Server Error",
            details: err.message
        });
    }
}

