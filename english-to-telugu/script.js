document.addEventListener('DOMContentLoaded', () => {
    const enInput = document.getElementById('en-input');
    const teOutput = document.getElementById('te-output');
    const translateBtn = document.getElementById('translate-btn');
    const generateVoiceBtn = document.getElementById('generate-voice-btn');
    const clearBtn = document.getElementById('clear-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const copyBtn = document.getElementById('copy-btn');
    const enCharCount = document.getElementById('en-char-count');
    const loader = document.getElementById('loader');
    const voiceSettings = document.getElementById('voice-settings');
    const audioContainer = document.getElementById('audio-player-container');
    const audioPlayer = document.getElementById('audio-player');
    const downloadLink = document.getElementById('download-link');

    // Stats
    enInput.addEventListener('input', () => {
        const len = enInput.value.length;
        enCharCount.textContent = `${len} / 5000`;
        enCharCount.style.color = len > 5000 ? '#ff4d00' : '#999';
    });

    // Translate Logic
    async function translate() {
        const text = enInput.value.trim();
        if (!text) return alert('Please enter English text.');

        translateBtn.disabled = true;
        loader.classList.remove('hide');
        teOutput.value = '';

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, source: 'en', target: 'te' })
            });
            const data = await response.json();
            if (data.status === 'success') {
                teOutput.value = data.translatedText;
                voiceSettings.classList.remove('hide');
                teOutput.classList.add('glow-border');
                setTimeout(() => teOutput.classList.remove('glow-border'), 2000);
            } else {
                alert('Translation failed: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error communicating with translation server.');
        } finally {
            translateBtn.disabled = false;
            loader.classList.add('hide');
        }
    }

    // Voice Generation Logic
    async function generateVoice() {
        const text = teOutput.value.trim();
        if (!text) return alert('Please translate text first.');

        const voiceType = document.querySelector('input[name="te-voice"]:checked').value;
        const endpoint = voiceType === 'azure_mohan' ? '/api/male' : '/api/female';

        generateVoiceBtn.disabled = true;
        generateVoiceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();

            if (data.audio_base64) {
                const audioBlob = b64toBlob(data.audio_base64, 'audio/mp3');
                const audioUrl = URL.createObjectURL(audioBlob);

                audioPlayer.src = audioUrl;
                audioContainer.classList.remove('hide');

                downloadLink.href = audioUrl;
                downloadLink.download = `telugu_voice_${Date.now()}.mp3`;

                audioPlayer.play();
            } else {
                alert('Voice generation failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Error generating voice.');
        } finally {
            generateVoiceBtn.disabled = false;
            generateVoiceBtn.innerHTML = '<i class="fas fa-microphone-alt"></i> Speak in Telugu';
        }
    }

    // Utils
    function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: contentType });
    }

    // Listeners
    translateBtn.addEventListener('click', translate);
    generateVoiceBtn.addEventListener('click', generateVoice);
    clearBtn.addEventListener('click', () => { enInput.value = ''; teOutput.value = ''; enCharCount.textContent = '0 / 5000'; });
    pasteBtn.addEventListener('click', async () => enInput.value = await navigator.clipboard.readText());
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(teOutput.value);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy', 2000);
    });
});
