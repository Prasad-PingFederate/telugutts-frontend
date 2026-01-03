// OpenAI Text-to-Speech API for Telugu
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        let { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'No text provided' });
        }

        // Preprocess text for better naturalness
        text = improveTextNaturalness(text);

        // Configuration
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        if (!OPENAI_API_KEY) {
            return res.status(500).json({
                error: 'Configuration Error',
                details: 'OPENAI_API_KEY is missing. Please add it in Vercel Settings.'
            });
        }

        // Validate Key Format (Prevent using masked keys)
        if (OPENAI_API_KEY.includes('...') || OPENAI_API_KEY.length < 30) {
            return res.status(500).json({
                error: 'Invalid API Key Format',
                details: 'It looks like you copied the "masked" key (e.g., sk-...VbQA) from the dashboard. OpenAI only shows the full key once. Please click "+ Create new secret key", copy the FULL key immediately, and use that.'
            });
        }

        console.log('Calling OpenAI TTS API for Telugu...');

        // Call OpenAI TTS API
        // OpenAI TTS supports multilingual text including Telugu
        const response = await fetch(
            'https://api.openai.com/v1/audio/speech',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "tts-1-hd", // High quality model (tts-1 for faster/cheaper)
                    input: text,
                    voice: "nova", // Female voice (options: alloy, echo, fable, onyx, nova, shimmer)
                    // Nova and Shimmer are female, Alloy/Echo/Onyx are male-ish
                    response_format: "mp3",
                    speed: 1.0 // Normal speed
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API Error:', errorText);
            return res.status(response.status).json({
                error: 'OpenAI API error',
                details: errorText.substring(0, 200)
            });
        }

        // Get audio data as buffer
        const audioBuffer = await response.arrayBuffer();

        // Convert to base64
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        console.log('✅ OpenAI TTS audio generated successfully');

        return res.status(200).json({
            audio_base64: base64Audio,
            message: 'OpenAI Nova voice generated successfully'
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Server Error',
            details: error.message
        });
    }
}

// Helper: Improve text naturalness for better TTS output
function improveTextNaturalness(text) {
    // Ensure proper spacing after punctuation marks
    text = text.replace(/([.!?।])([^\s])/g, '$1 $2');

    // Ensure spacing after commas
    text = text.replace(/,([^\s])/g, ', $1');

    // Add space after Telugu danda if missing
    text = text.replace(/।([^\s])/g, '। $1');

    // Normalize multiple spaces to single space
    text = text.replace(/\s+/g, ' ');

    // Ensure sentences end with proper punctuation
    if (!/[.!?।]$/.test(text.trim())) {
        text = text.trim() + '.';
    }

    return text.trim();
}
