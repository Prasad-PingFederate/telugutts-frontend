const fs = require('fs');

async function generate() {
    console.log("Reading story.txt...");
    const text = fs.readFileSync('story.txt', 'utf8');

    console.log("Requesting OpenAI Audio from Vercel for Telugu Story...");
    const url = 'https://telugutts-frontend-llc8gewyg-prasad-dammais-projects.vercel.app/api/openai-tts';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Mimic browser
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({ text: text })
        });

        console.log(`Status Code: ${response.status}`);
        const contentType = response.headers.get("content-type");
        console.log(`Content-Type: ${contentType}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error Response Body:", errorText.substring(0, 500)); // Print first 500 chars
            return;
        }

        const data = await response.json();
        if (data.audio_base64) {
            const buffer = Buffer.from(data.audio_base64, 'base64');
            const filename = 'story_pig.mp3';
            fs.writeFileSync(filename, buffer);
            console.log(`Done: ${filename}`);
            console.log(`File size: ${buffer.length} bytes`);
        } else {
            console.error("No audio data returned in JSON:", JSON.stringify(data).substring(0, 200));
        }

    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

generate();
