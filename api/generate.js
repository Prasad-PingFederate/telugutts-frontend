export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const { text } = req.body;

        if (!text || text.trim() === "") {
            return res.status(400).json({ error: "Text is required" });
        }

        // Call RunPod Serverless
        const response = await fetch("https://api.runpod.ai/v2/76h1nrfetqvwu1/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.RUNPOD_KEY}`
            },
            body: JSON.stringify({ input: { text } })
        });

        const result = await response.json();
        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
