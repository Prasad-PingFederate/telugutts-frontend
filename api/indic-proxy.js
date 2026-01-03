
export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { text } = await request.json();

        if (!text) {
            return new Response(JSON.stringify({ error: 'No text provided' }), { status: 400 });
        }

        const HF_API_KEY = process.env.HF_API_KEY;

        // Return mock response if no key (for testing/safety)
        if (!HF_API_KEY) {
            console.warn('HF_API_KEY not found. Using mock translation.');
            // Simple mock to show UI works
            return new Response(JSON.stringify({
                translated_text: text + " (Translated by IndicTrans2 Mock)"
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const response = await fetch(
            "https://api-inference.huggingface.co/models/ai4bharat/indictrans2-en-indic-1B",
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: text }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HF API Error: ${error}`);
        }

        const result = await response.json();
        // HF Inference API usually returns [{ generated_text: "..." }]
        const translatedText = result[0]?.generated_text || result[0]?.translation_text || "Translation failed";

        return new Response(JSON.stringify({ translated_text: translatedText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Translation error:', error);
        return new Response(JSON.stringify({
            error: 'Translation failed',
            details: error.message
        }), { status: 500 });
    }
}
