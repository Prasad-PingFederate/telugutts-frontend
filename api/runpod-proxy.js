
export const config = {
    runtime: 'edge',
    maxDuration: 300, // 5 minutes max
};

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await request.json();
        const text = body.text || "";

        // Your NEW GPU Serverless Endpoint ID
        const ENDPOINT_ID = "qigr3nvzjfchib";
        const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

        console.log(`Sending job to RunPod GPU Serverless: ${ENDPOINT_ID}`);

        // Step 1: Submit job asynchronously (no timeout)
        const submitResponse = await fetch(`https://api.runpod.ai/v2/${ENDPOINT_ID}/run`, {
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

        if (!submitResponse.ok) {
            const errText = await submitResponse.text();
            throw new Error(`RunPod Submit Error ${submitResponse.status}: ${errText}`);
        }

        const submitResult = await submitResponse.json();
        const jobId = submitResult.id;

        console.log(`Job submitted: ${jobId}, polling for result...`);

        // Step 2: Poll for result (max 4 minutes)
        const maxAttempts = 120; // 120 * 2 seconds = 4 minutes
        let attempts = 0;

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

            const statusResponse = await fetch(`https://api.runpod.ai/v2/${ENDPOINT_ID}/status/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${RUNPOD_API_KEY}`
                }
            });

            if (!statusResponse.ok) {
                throw new Error(`Status check failed: ${statusResponse.status}`);
            }

            const statusResult = await statusResponse.json();
            console.log(`Job ${jobId} status: ${statusResult.status}`);

            if (statusResult.status === 'COMPLETED') {
                return new Response(JSON.stringify(statusResult.output), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else if (statusResult.status === 'FAILED') {
                throw new Error(`Job failed: ${JSON.stringify(statusResult.error)}`);
            }

            attempts++;
        }

        throw new Error('Job timed out after 4 minutes');

    } catch (error) {
        console.error('RunPod Serverless Proxy Error:', error);
        return new Response(JSON.stringify({
            error: 'Serverless Generation Failed',
            details: error.message
        }), { status: 500 });
    }
}
