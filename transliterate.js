const https = require('https');

export default function handler(req, res) {
    const { text } = req.query;

    if (!text) {
        return res.status(400).json({ error: 'Text required' });
    }

    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=te-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;

    https.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                // Google returns result mostly in this structure: 
                // ["SUCCESS",[["orig","transliteration",...]]]
                const json = JSON.parse(data);
                if (json[0] === 'SUCCESS' && json[1] && json[1][0] && json[1][0][1]) {
                    const result = json[1][0][1][0]; // First suggestion
                    res.status(200).json({ result });
                } else {
                    res.status(200).json({ result: text }); // Fallback to original
                }
            } catch (e) {
                res.status(500).json({ error: 'Parse Error' });
            }
        });

    }).on('error', (err) => {
        res.status(500).json({ error: 'Network Error' });
    });
}
