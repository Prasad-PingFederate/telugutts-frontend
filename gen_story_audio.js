const fs = require('fs');

async function generate() {
    console.log("Reading story.txt...");
    const text = fs.readFileSync('story.txt', 'utf8');

    console.log("Requesting OpenAI Audio from Vercel for Telugu Story...");

    // Using the user's deployed app URL found in gen_openai_sample.js
    const response = await fetch('https://telugutts-frontend-llc8gewyg-prasad-dammais-projects.vercel.app/api/openai-tts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({ text: text })
    });

    if (!response.ok) {
        console.error("Error:", await response.text());
        return;
    }

    const data = await response.json();
    if (data.audio_base64) {
        const buffer = Buffer.from(data.audio_base64, 'base64');
        const filename = 'story_pig.mp3';
        fs.writeFileSync(filename, buffer);
        console.log(`Done: ${filename}`);
    } else {
        console.error("No audio data returned");
    }
}

generate();
