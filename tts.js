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

        // Configuration
        const ENDPOINT_ID = '76h1nrfetqvwu1';
        const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

        // 1. Validation
        if (!RUNPOD_API_KEY) {
            return res.status(500).json({
                error: 'Configuration Error',
                details: 'RUNPOD_API_KEY is missing. Please add it in Vercel Settings.'
            });
        }
        if (RUNPOD_API_KEY.startsWith('http')) {
            return res.status(500).json({
                error: 'Invalid API Key',
                details: 'You pasted the Endpoint URL into the RUNPOD_API_KEY variable. Please paste the actual Secret Key.'
            });
        }

        // 2. Try Runsync (Fastest) - but fallback if it fails/timeouts
        let RUNPOD_ENDPOINT = `https://api.runpod.ai/v2/${ENDPOINT_ID}/runsync`;
        let useAsyncFallback = false;

        console.log(`Calling RunPod runsync endpoint: ${ENDPOINT_ID}`);

        let runpodResponse = await fetch(RUNPOD_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RUNPOD_API_KEY}` },
            body: JSON.stringify({ input: { text: text } })
        });

        // ⚠️ FALLBACK LOGIC: If Runsync fails (500, 502, 504), try standard 'run' endpoint
        if (runpodResponse.status >= 500) {
            console.warn(`Runsync failed with status ${runpodResponse.status}. Falling back to Async Run...`);
            useAsyncFallback = true;
        } else if (!runpodResponse.ok) {
            const errorText = await runpodResponse.text();
            // Some runpod errors are actual logic errors, not server crashes.
            // If it's a 4xx error (validation), we shouldn't retry.
            return res.status(500).json({ error: 'RunPod API error', details: errorText.substring(0, 200) });
        }

        // 3. Fallback Execution (Async Run)
        if (useAsyncFallback) {
            RUNPOD_ENDPOINT = `https://api.runpod.ai/v2/${ENDPOINT_ID}/run`;

            runpodResponse = await fetch(RUNPOD_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RUNPOD_API_KEY}` },
                body: JSON.stringify({ input: { text: text } })
            });

            if (!runpodResponse.ok) {
                const errorText = await runpodResponse.text();
                return res.status(500).json({ error: 'RunPod Async API error', details: errorText });
            }
        }

        const runpodData = await runpodResponse.json();

        // 4. Handle Response

        // CASE A: Runsync returned completion immediately
        if (runpodData.status === 'COMPLETED') {
            return sendSuccessResponse(res, runpodData.output);
        }

        // CASE B: Job ID received (Async mode or Runsync timeout)
        if (runpodData.id) {
            console.log('Job queued/running. Polling for results...', runpodData.id);
            return await pollForCompletion(res, runpodData.id, ENDPOINT_ID, RUNPOD_API_KEY);
        }

        // CASE C: Immediate Failure
        return res.status(500).json({
            error: 'Job failed immediately',
            details: runpodData.error || `Status: ${runpodData.status}`
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Server Error', details: error.message });
    }
}

// Helper: Poll for completion
async function pollForCompletion(res, jobId, endpointId, apiKey) {
    const STATUS_URL = `https://api.runpod.ai/v2/${endpointId}/status/${jobId}`;
    let attempts = 0;
    const maxAttributes = 90; // Wait up to 90 seconds

    while (attempts < maxAttributes) {
        await new Promise(r => setTimeout(r, 1000));

        try {
            const resp = await fetch(STATUS_URL, { headers: { 'Authorization': `Bearer ${apiKey}` } });
            const data = await resp.json();

            console.log(`Poll ${attempts}: ${data.status}`);

            if (data.status === 'COMPLETED') return sendSuccessResponse(res, data.output);
            if (data.status === 'FAILED') return res.status(500).json({ error: 'Job Failed', details: data.error });
        } catch (e) {
            console.error('Polling error:', e);
        }

        attempts++;
    }
    return res.status(408).json({ error: 'Timeout', details: 'Job took too long to complete.' });
}

// Helper: Extract audio and send response
function sendSuccessResponse(res, output) {
    let audioData = output;

    // Recursive safety check for nested "output" (common RunPod pattern)
    // RunPod sometimes wraps result in { output: { output: ... } }
    if (typeof audioData === 'object' && audioData !== null) {
        if (audioData.output && audioData.output.audio_base64) audioData = audioData.output.audio_base64;
        else if (audioData.output && audioData.output.audio) audioData = audioData.output.audio; // Handle alternate key
        else if (audioData.audio) audioData = audioData.audio;
        else if (audioData.audio_base64) audioData = audioData.audio_base64;
        else if (audioData.b64) audioData = audioData.b64;
    }

    if (typeof audioData !== 'string') {
        return res.status(500).json({ error: 'Invalid Output', details: 'Expected string, got object: ' + JSON.stringify(output) });
    }

    return res.status(200).json({ audio_base64: audioData, message: 'Audio generated successfully' });
}