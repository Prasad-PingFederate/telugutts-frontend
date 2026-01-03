
export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await request.json();
        const { text, jobId } = body;

        // Your RunPod Endpoint Config
        const ENDPOINT_ID = "qigr3nvzjfchib";
        const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RUNPOD_API_KEY}`
        };

        // --- MODE 1: CHECK STATUS (if jobId is provided) ---
        if (jobId) {
            const statusResponse = await fetch(`https://api.runpod.ai/v2/${ENDPOINT_ID}/status/${jobId}`, {
                method: 'GET',
                headers: headers
            });

            if (!statusResponse.ok) {
                const errText = await statusResponse.text();
                throw new Error = {`RunPod Status Error ${statusResponse.status}: ${errText}`);
            }

            const statusResult = await statusResponse.json();

            // Normalize response for frontend
            return new Response(JSON.stringify({
                status: statusResult.status, // IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED
                output: statusResult.output, // The audio data if completed
                error: statusResult.error
            }), { status: 200 });
        }

        // --- MODE 2: SUBMIT JOB (if text is provided) ---
        if (text) {
            console.log(`Submitting new job to RunPod GPU: ${ENDPOINT_ID}`);

            const submitResponse = await fetch(`https://api.runpod.ai/v2/${ENDPOINT_ID}/run`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    input: {
                        text: text
                    }
                })
            });

            if (!submitResponse.ok) {
                const errText = await submitResponse.text();
                throw new Error = {`RunPod Submit Error ${submitResponse.status}: ${errText}`);
            }

            const submitResult = await submitResponse.json();

            return new Response(JSON.stringify({
                status: 'SUBMITTED',
                jobId: submitResult.id
            }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: 'Invalid request. Provide "text" to generate or "jobId" to check status.' }), { status: 400 });

    } catch (error) {
        console.error('RunPod Proxy Error:', error);
        return new Response(JSON.stringify({
            error: 'Serverless Operation Failed',
            details: error.message
        }), { status: 500 });
    }
}
