document.addEventListener('DOMContentLoaded', () => {
    const teInput = document.getElementById('te-input');
    const knOutput = document.getElementById('kn-output');
    const translateBtn = document.getElementById('translate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const copyBtn = document.getElementById('copy-btn');
    const speakBtn = document.getElementById('speak-btn');
    const teCharCount = document.getElementById('te-char-count');
    const loader = document.getElementById('loader');

    // Character Count Update
    teInput.addEventListener('input', () => {
        const length = teInput.value.length;
        teCharCount.textContent = `${length} / 5000`;
        if (length > 5000) {
            teCharCount.style.color = '#ff4d00';
        } else {
            teCharCount.style.color = '#999';
        }
    });

    // Translate Function
    async function translateText() {
        const text = teInput.value.trim();
        if (!text) {
            alert('Please enter some Telugu text to translate.');
            return;
        }

        translateBtn.disabled = true;
        loader.classList.remove('hide');
        knOutput.placeholder = 'Translating...';

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    source: 'te',
                    target: 'kn'
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                knOutput.value = data.translatedText;
            } else {
                throw new Error(data.error || 'Translation failed');
            }
        } catch (error) {
            console.error('Translation Error:', error);
            alert('Translation failed. Please try again later.');
        } finally {
            translateBtn.disabled = false;
            loader.classList.add('hide');
            knOutput.placeholder = 'Kannada translation will appear here...';
        }
    }

    translateBtn.addEventListener('click', translateText);

    // Clear Text
    clearBtn.addEventListener('click', () => {
        teInput.value = '';
        knOutput.value = '';
        teCharCount.textContent = '0 / 5000';
    });

    // Paste Text
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            teInput.value = text;
            teInput.dispatchEvent(new Event('input'));
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    });

    // Copy Result
    copyBtn.addEventListener('click', () => {
        if (!knOutput.value) return;
        navigator.clipboard.writeText(knOutput.value);

        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    });

    // Speak Result (Simple Web Speech API for now, or could use Edge-TTS via same API pattern)
    speakBtn.addEventListener('click', () => {
        const text = knOutput.value;
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'kn-IN';
        window.speechSynthesis.speak(utterance);
    });
});
