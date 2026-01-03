
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voiceId } = req.body; // voiceId: 'mohan' or 'shruti'

    if (!text) {
        return res.status(400).json({ error: 'No text provided' });
    }

    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
        return res.status(500).json({
            error: 'Configuration Error',
            details: 'AZURE_SPEECH_KEY or AZURE_SPEECH_REGION is missing in Vercel Settings.'
        });
    }

    try {
        // Map short IDs to full Azure Neural Voice names
        const voiceMap = {
            'mohan': 'te-IN-MohanNeural',
            'shruti': 'te-IN-ShrutiNeural'
        };

        const azureVoiceName = voiceMap[voiceId] || 'te-IN-MohanNeural';

        // 1. Get Access Token
        // Note: Using fetch (built-in in Node 18+)
        const tokenResponse = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': key
            }
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            throw new Error(`Failed to get Azure token: ${tokenResponse.status} ${errText}`);
        }

        const accessToken = await tokenResponse.text();

        // 2. Generate Speech using REST API
        const ssml = `
<speak version='1.0' xml:lang='te-IN'>
    <voice xml:lang='te-IN' xml:gender='${azureVoiceName.includes('Mohan') ? 'Male' : 'Female'}' name='${azureVoiceName}'>
        ${text}
    </voice>
</speak>`;

        const ttsResponse = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                'User-Agent': 'TeluguTTS'
            },
            body: ssml
        });

        if (!ttsResponse.ok) {
            const errText = await ttsResponse.text();
            throw new Error(`Azure TTS API Error: ${ttsResponse.status} ${errText}`);
        }

        const audioBuffer = await ttsResponse.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        return res.status(200).json({
            audio_base64: base64Audio,
            message: `Generated with Azure ${azureVoiceName}`
        });

    } catch (error) {
        console.error('Azure Handler Error:', error);
        return res.status(500).json({
            error: 'Azure Generation Failed',
            details: error.message
        });
    }
}
