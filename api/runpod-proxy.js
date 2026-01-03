
export const config = {
    runtime: 'edge',
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

        // Call RunPod Serverless API (Synchronous)
        const response = await fetch(`https://api.runpod.ai/v2/${ENDPOINT_ID}/runsync`, {
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

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`RunPod Serverless Error ${response.status}: ${errText}`);
        }

        const result = await response.json();

        // Handle result
        if (result.status === 'COMPLETED') {
            return new Response(JSON.stringify(result.output), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({
                error: 'RunPod Job not completed',
                details: result
            }), { status: 500 });
        }

    } catch (error) {
        console.error('RunPod Serverless Proxy Error:', error);
        return new Response(JSON.stringify({
            error: 'Serverless Generation Failed',
            details: error.message
        }), { status: 500 });
    }
}
