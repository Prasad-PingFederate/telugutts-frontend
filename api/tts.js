// Vercel Serverless Function to proxy requests to RunPod
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'No text provided' });
        }

        // Your RunPod endpoint URL
        const RUNPOD_ENDPOINT = 'https://api.runpod.ai/v2/76h1nrfetqywu1/run';
        const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

        console.log('Calling RunPod endpoint...');

        // Call RunPod serverless endpoint
        const runpodResponse = await fetch(RUNPOD_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RUNPOD_API_KEY}`
            },
            body: JSON.stringify({
                input: {
                    text: text
                }
            })
        });

        if (!runpodResponse.ok) {
            const errorText = await runpodResponse.text();
            console.error('RunPod error:', errorText);
            return res.status(500).json({
                error: 'RunPod API error',
                details: errorText
            });
        }

        const runpodData = await runpodResponse.json();
        console.log('RunPod response:', runpodData);

        const jobId = runpodData.id;

        if (!jobId) {
            return res.status(500).json({
                error: 'No job ID received from RunPod',
                data: runpodData
            });
        }

        // Poll for job completion
        const STATUS_ENDPOINT = `https://api.runpod.ai/v2/76h1nrfetqywu1/status/${jobId}`;
        let attempts = 0;
        const MAX_ATTEMPTS = 30;

        while (attempts < MAX_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const statusResponse = await fetch(STATUS_ENDPOINT, {
                headers: {
                    'Authorization': `Bearer ${RUNPOD_API_KEY}`
                }
            });

            const statusData = await statusResponse.json();
            console.log(`Attempt ${attempts + 1}:`, statusData.status);

            if (statusData.status === 'COMPLETED') {
                return res.status(200).json({
                    audio_base64: statusData.output,
                    message: 'Audio generated successfully'
                });
            } else if (statusData.status === 'FAILED') {
                return res.status(500).json({
                    error: 'Job failed',
                    details: statusData.error
                });
            }

            attempts++;
        }

        return res.status(408).json({ error: 'Request timeout - job took too long' });

    } catch (error) {
        console.error('Error in API route:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
