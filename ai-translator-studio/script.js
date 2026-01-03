document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sourceSelect = document.getElementById('source-lang-select');
    const targetSelect = document.getElementById('target-lang-select');
    const sourceInput = document.getElementById('source-input');
    const targetOutput = document.getElementById('target-output');
    const translateBtn = document.getElementById('translate-btn');
    const swapBtn = document.getElementById('swap-langs');
    const charCount = document.getElementById('char-count');
    const mainLoader = document.getElementById('main-loader');
    const btnText = translateBtn.querySelector('.btn-text');

    const clearBtn = document.getElementById('clear-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const copyBtn = document.getElementById('copy-btn');

    const ttsSection = document.getElementById('tts-controls');
    const voiceContainer = document.getElementById('voice-options-container');
    const speakBtn = document.getElementById('speak-btn');
    const ttsHint = document.getElementById('tts-hint');
    const ttsLoadingMsg = document.getElementById('tts-loading-msg');
    const audioZone = document.getElementById('audio-player-zone');
    const audioPlayer = document.getElementById('audio-player');
    const downloadLink = document.getElementById('download-link');

    // Language-Voice Mapping
    const voices = {
        'te': [
            { id: 'te-IN-MohanNeural', name: 'Mohan (M)', icon: '👨', endpoint: '/api/voice' },
            { id: 'te-IN-ShrutiNeural', name: 'Shruti (F)', icon: '👩', endpoint: '/api/voice' }
        ],
        'kn': [
            { id: 'kn-IN-GaganNeural', name: 'Gagan (M)', icon: '👨', endpoint: '/api/voice' },
            { id: 'kn-IN-SapnaNeural', name: 'Sapna (F)', icon: '👩', endpoint: '/api/voice' }
        ],
        'hi': [
            { id: 'hi-IN-MadhurNeural', name: 'Madhur (M)', icon: '👨', endpoint: '/api/voice' },
            { id: 'hi-IN-SwaraNeural', name: 'Swara (F)', icon: '👩', endpoint: '/api/voice' }
        ],
        'ta': [
            { id: 'ta-IN-ValluvarNeural', name: 'Valluvar (M)', icon: '👨', endpoint: '/api/voice' },
            { id: 'ta-IN-PallaviNeural', name: 'Pallavi (F)', icon: '👩', endpoint: '/api/voice' }
        ],
        'ml': [
            { id: 'ml-IN-MidhunNeural', name: 'Midhun (M)', icon: '👨', endpoint: '/api/voice' },
            { id: 'ml-IN-SobhanaNeural', name: 'Sobhana (F)', icon: '👩', endpoint: '/api/voice' }
        ],
        'en': [
            { id: 'en-US-AndrewMultilingualNeural', name: 'Andrew (Premium M)', icon: '👨', endpoint: '/api/voice' },
            { id: 'en-US-AriaNeural', name: 'Aria (Premium F)', icon: '👩', endpoint: '/api/voice' },
            { id: 'en-US-EmmaMultilingualNeural', name: 'Emma (Warm F)', icon: '👩', endpoint: '/api/voice' }
        ]
    };

    let selectedVoice = null;

    // Character Count Update
    sourceInput.addEventListener('input', () => {
        const len = sourceInput.value.length;
        charCount.textContent = `${len} / 5000`;
        charCount.style.color = len > 5000 ? '#ef4444' : '#94a3b8';
    });

    // Language Swap
    swapBtn.addEventListener('click', () => {
        const s = sourceSelect.value;
        const t = targetSelect.value;
        if (s === 'auto') return;
        sourceSelect.value = t;
        targetSelect.value = s;

        const si = sourceInput.value;
        const to = targetOutput.value;
        sourceInput.value = to;
        targetOutput.value = si;

        updateTTSControls();
    });

    targetSelect.addEventListener('change', updateTTSControls);

    // Update TTS Controls
    function updateTTSControls() {
        const lang = targetSelect.value;
        voiceContainer.innerHTML = '';

        if (voices[lang]) {
            ttsSection.classList.remove('hide');

            voices[lang].forEach((v, idx) => {
                const pill = document.createElement('div');
                pill.className = `v-pill ${idx === 0 ? 'active' : ''}`;
                pill.innerHTML = `${v.icon} ${v.name}`;
                if (idx === 0) selectedVoice = v;

                pill.onclick = () => {
                    document.querySelectorAll('.v-pill').forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    selectedVoice = v;
                    console.log('[Voice] Selected:', v.name, v.id);
                };
                voiceContainer.appendChild(pill);
            });

            if (ttsHint) {
                if (targetOutput.value.trim().length > 0) {
                    ttsHint.classList.remove('hide');
                } else {
                    ttsHint.classList.add('hide');
                }
            }
        } else {
            ttsSection.classList.add('hide');
        }
    }

    // Initial TTS setup
    updateTTSControls();

    // Translation Function
    async function translate() {
        const text = sourceInput.value.trim();
        if (!text) return alert('Please enter some text to translate.');

        translateBtn.disabled = true;
        btnText.classList.add('hide');
        mainLoader.classList.remove('hide');

        console.log('[Translation] Starting:', {
            source: sourceSelect.value,
            target: targetSelect.value,
            textLength: text.length
        });

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    source: sourceSelect.value,
                    target: targetSelect.value
                })
            });

            const data = await response.json();
            console.log('[Translation] Response:', data.status);

            if (data.status === 'success') {
                targetOutput.value = data.translatedText;
                updateTTSControls();
                targetOutput.style.borderColor = 'var(--primary)';
                setTimeout(() => targetOutput.style.borderColor = 'var(--glass-border)', 1000);
                console.log('[Translation] ✅ Success');
            } else {
                console.error('[Translation] ❌ Error:', data.error);
                alert('Translation Error: ' + data.error);
            }
        } catch (err) {
            console.error('[Translation] ❌ Network Error:', err);
            alert('Server Communication Error.');
        } finally {
            translateBtn.disabled = false;
            btnText.classList.remove('hide');
            mainLoader.classList.add('hide');
        }
    }

    translateBtn.addEventListener('click', translate);

    // TTS Function with Advanced Controls
    async function speak() {
        const text = targetOutput.value.trim();
        if (!text || !selectedVoice) {
            console.warn('[TTS] Cannot speak - missing text or voice');
            return;
        }

        speakBtn.disabled = true;
        const originalIcon = speakBtn.innerHTML;
        speakBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        if (ttsHint) ttsHint.classList.add('hide');
        if (ttsLoadingMsg) ttsLoadingMsg.classList.remove('hide');

        // Get control values
        const speedEl = document.getElementById('voice-speed');
        const pitchEl = document.getElementById('voice-pitch');
        const styleEl = document.getElementById('voice-style');

        const speed = speedEl ? speedEl.value : '1.0';
        const pitch = pitchEl ? pitchEl.value : '0';
        const style = styleEl ? styleEl.value : 'general';

        const payload = {
            text: text,
            voice: selectedVoice.id,
            speed: speed,
            pitch: pitch,
            style: style
        };

        console.log('[TTS] Generating:', {
            voice: selectedVoice.name,
            speed: speed + 'x',
            pitch: pitch + 'Hz',
            style: style,
            endpoint: selectedVoice.endpoint
        });

        try {
            const response = await fetch(selectedVoice.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('[TTS] Response status:', response.status);

            // Parse response body first to capture errors
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('[TTS] Failed to parse JSON:', e);
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('[TTS] Response data:', data);

            if (!response.ok) {
                throw new Error((data && data.error) || data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            if (data && data.audio_base64) {
                const blob = b64toBlob(data.audio_base64, 'audio/mp3');
                const url = URL.createObjectURL(blob);
                audioPlayer.src = url;
                audioZone.classList.remove('hide');
                downloadLink.href = url;
                downloadLink.download = `${selectedVoice.name}_${Date.now()}.mp3`;
                audioPlayer.play();
                console.log('[TTS] ✅ Success - Audio playing');
            } else {
                console.error('[TTS] ❌ No audio_base64 in response:', data);
                alert('Voice generation failed: ' + (data.error || data.message || 'No audio returned'));
            }
        } catch (err) {
            console.error('[TTS] ❌ Error:', err);
            alert('Voice Service Error: ' + err.message);
        } finally {
            speakBtn.disabled = false;
            speakBtn.innerHTML = originalIcon;
            if (ttsLoadingMsg) ttsLoadingMsg.classList.add('hide');
        }
    }

    speakBtn.addEventListener('click', speak);

    // Speed Slider Real-time Update
    const speedSlider = document.getElementById('voice-speed');
    const speedValue = document.getElementById('speed-value');
    if (speedSlider && speedValue) {
        speedSlider.addEventListener('input', (e) => {
            speedValue.textContent = `${e.target.value}x`;
        });
    }

    // Utility: Base64 to Blob
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

    // UI Listeners
    clearBtn.onclick = () => {
        sourceInput.value = '';
        targetOutput.value = '';
        charCount.textContent = '0 / 5000';
        ttsSection.classList.add('hide');
        audioZone.classList.add('hide');
        console.log('[UI] Cleared all inputs');
    };

    pasteBtn.onclick = async () => {
        try {
            sourceInput.value = await navigator.clipboard.readText();
            console.log('[UI] Pasted from clipboard');
        } catch (err) {
            console.error('[UI] Paste failed:', err);
        }
    };

    copyBtn.onclick = () => {
        navigator.clipboard.writeText(targetOutput.value);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy', 2000);
        console.log('[UI] Copied to clipboard');
    };

    // Voice Preview Functionality
    const previewCards = document.querySelectorAll('.preview-card');
    let currentPreviewAudio = null;

    previewCards.forEach(card => {
        const btn = card.querySelector('.preview-btn');
        if (!btn) return;

        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const voiceId = card.dataset.voice;
            const sampleText = card.dataset.text;

            if (currentPreviewAudio && !currentPreviewAudio.paused) {
                currentPreviewAudio.pause();
                document.querySelectorAll('.preview-btn').forEach(b => b.classList.remove('playing'));
            }

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            btn.disabled = true;

            console.log('[Preview] Playing:', voiceId);

            try {
                const response = await fetch('/api/voice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: sampleText,
                        voice: voiceId,
                        speed: '1.0',
                        pitch: '0',
                        style: 'general'
                    })
                });

                const data = await response.json();
                if (data.audio_base64) {
                    const blob = b64toBlob(data.audio_base64, 'audio/mp3');
                    const url = URL.createObjectURL(blob);
                    currentPreviewAudio = new Audio(url);

                    btn.innerHTML = '<i class="fas fa-pause"></i> Playing...';
                    btn.classList.add('playing');

                    currentPreviewAudio.play();
                    currentPreviewAudio.onended = () => {
                        btn.innerHTML = '<i class="fas fa-play"></i> Preview';
                        btn.classList.remove('playing');
                        btn.disabled = false;
                    };
                    console.log('[Preview] ✅ Playing');
                } else {
                    throw new Error('No audio in preview response');
                }
            } catch (error) {
                console.error('[Preview] ❌ Error:', error);
                btn.innerHTML = '<i class="fas fa-play"></i> Preview';
                alert('Preview failed. Please try again.');
            } finally {
                if (!btn.classList.contains('playing')) {
                    btn.disabled = false;
                }
            }
        });
    });

    console.log('[App] Universal AI Translation Studio initialized ✨');
});
