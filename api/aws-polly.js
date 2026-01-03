import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { text, voiceId } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'No text provided' });
    }

    // AWS Credentials Check
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
        return res.status(500).json({
            error: 'Configuration Error',
            details: 'AWS Credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION) are missing in Vercel Settings.'
        });
    }

    try {
        // Preprocess text
        text = improveTextNaturalness(text);

        const client = new PollyClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
        });

        // Use Aditi (Hindi/English) as default. 
        // Note: AWS Polly does not natively support Telugu (te-IN). 
        // Aditi is the best fallback for Indian context in AWS.
        const outputVoice = voiceId || 'Aditi';

        // Helper to run Polly with a specific engine
        const generateAudio = async (engineType) => {
            const command = new SynthesizeSpeechCommand({
                Text: text,
                OutputFormat: "mp3",
                VoiceId: outputVoice,
                Engine: engineType,
            });
            return await client.send(command);
        };

        let response;
        let usedEngine = 'neural';

        try {
            // First try Neural engine (High Quality)
            response = await generateAudio('neural');
        } catch (neuralError) {
            console.warn(`AWS Polly Neural engine failed for voice ${outputVoice}. Retrying with Standard engine.`, neuralError);

            // Fallback to Standard engine (Reliable)
            try {
                usedEngine = 'standard';
                response = await generateAudio('standard');
            } catch (standardError) {
                // If standard also fails, throw the original neural error or the new one
                throw new Error(`Polly Failed: ${neuralError.message} | Standard Fallback: ${standardError.message}`);
            }
        }

        // Convert stream to base64
        const audioStream = response.AudioStream;
        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const base64Audio = buffer.toString('base64');

        return res.status(200).json({
            audio_base64: base64Audio,
            message: `Generated with AWS Polly (${outputVoice} - ${usedEngine})`
        });

    } catch (error) {
        console.error('AWS Polly Error:', error);
        return res.status(500).json({
            error: 'AWS Polly Generation Failed',
            details: error.message
        });
    }
}

// Helper: Improve text naturalness
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
