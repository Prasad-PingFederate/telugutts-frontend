// Get DOM elements
const teluguText = document.getElementById('teluguText');
const charCount = document.getElementById('charCount');
const generateBtn = document.getElementById('generateBtn');
const statusMessage = document.getElementById('statusMessage');
const audioPlayer = document.getElementById('audioPlayer');
const audio = document.getElementById('audio');
const downloadBtn = document.getElementById('downloadBtn');
const transliterateToggle = document.getElementById('transliterateToggle');

let currentAudioBlob = null;

// Update character count
teluguText.addEventListener('input', () => {
    const count = teluguText.value.length;
    charCount.textContent = `${count} / 5000`;
});

// Transliteration Logic
teluguText.addEventListener('keydown', async (e) => {
    // Check if Toggle is checked (Native logic)
    if (!transliterateToggle || !transliterateToggle.checked) return;

    // Trigger on Space or Enter
    if (e.key === ' ' || e.key === 'Enter') {
        const text = teluguText.value;
        const cursorPosition = teluguText.selectionStart;

        // Find the word being typed (looking backwards from cursor)
        const textBeforeCursor = text.slice(0, cursorPosition);
        const lastWordMatch = textBeforeCursor.match(/([a-zA-Z]+)$/);

        if (lastWordMatch) {
            const wordToTransliterate = lastWordMatch[1];

            // Only transliterate if it looks like an English word
            if (wordToTransliterate) {
                try {
                    // Prevent default temporarily to handle insertion manually
                    e.preventDefault();

                    const response = await fetch(`/api/transliterate?text=${encodeURIComponent(wordToTransliterate)}`);
                    const data = await response.json();

                    if (data.result) {
                        const transliteratedWord = data.result;

                        // Construct new text
                        const textBeforeWord = textBeforeCursor.slice(0, -wordToTransliterate.length);
                        const textAfterCursor = text.slice(cursorPosition);

                        const separator = e.key === 'Enter' ? '\n' : ' ';

                        teluguText.value = textBeforeWord + transliteratedWord + separator + textAfterCursor;

                        // Move cursor to end of inserted word + separator
                        const newCursorPos = textBeforeWord.length + transliteratedWord.length + 1;
                        teluguText.setSelectionRange(newCursorPos, newCursorPos);

                        // Update char count
                        teluguText.dispatchEvent(new Event('input'));
                    }
                } catch (err) {
                    console.error('Transliteration failed:', err);
                    // If it fails, we should probably just let the default action happen, 
                    // but since we prevented default, we must manually insert the key.
                    const separator = e.key === 'Enter' ? '\n' : ' ';
                    const textBefore = text.slice(0, cursorPosition);
                    const textAfter = text.slice(cursorPosition);
                    teluguText.value = textBefore + separator + textAfter;
                    teluguText.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
                }
            }
        }
    }
});

// Show status message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message show ${type}`;
}

// Hide status message
function hideStatus() {
    statusMessage.className = 'status-message';
}

// Handle Voice Selection UI
function updateVoiceSelection(radio) {
    // Remove selected from all
    document.querySelectorAll('.voice-pill').forEach(opt => opt.classList.remove('selected'));
    // Add to current
    radio.closest('.voice-pill').classList.add('selected');
}

// Generate speech
generateBtn.addEventListener('click', async () => {
    const text = teluguText.value.trim();
    // Get selected voice
    const selectedVoice = document.querySelector('input[name="voice"]:checked').value;
    let apiEndpoint = '/api/female'; // Default

    // Endpoint Selection
    if (selectedVoice === 'azure_mohan' || selectedVoice === 'male') {
        apiEndpoint = '/api/male';
    } else if (selectedVoice === 'openai') {
        apiEndpoint = '/api/aws-polly';
    } else if (selectedVoice === 'ultimate') {
        apiEndpoint = '/api/ultimate'; // Uses runpod-proxy.js
    } else if (selectedVoice === 'indic_trans') {
        apiEndpoint = '/api/male';
    }

    // Validation
    if (!text) {
        showStatus('⚠️ Please enter some Telugu text', 'error');
        return;
    }

    // Reset UI
    audioPlayer.style.display = 'none';
    hideStatus();

    // Show loading state
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;

    try {
        let textToSpeak = text;
        let audioData = null;

        // --- SPECIAL CASE: AI TRANSLATION ---
        if (selectedVoice === 'indic_trans') {
            showStatus('🧠 AI Neural Translation in progress (IndicTrans2)...', 'loading');
            const transResponse = await fetch('/api/indic-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });
            const transData = await transResponse.json();
            if (transData.translated_text) {
                textToSpeak = transData.translated_text;
                teluguText.value = textToSpeak;
                showStatus('✅ Translation Complete! Generating Audio...', 'loading');
                await new Promise(r => setTimeout(r, 500));
            } else {
                throw new Error('Translation failed: ' + (transData.error || 'Unknown error'));
            }
        }

        // --- SPECIAL CASE: ULTIMATE VOICE (ASYNC POLLING) ---
        if (selectedVoice === 'ultimate') {
            showStatus('🚀 Initializing RunPod Neural Engine (Cold Start may take 60s)...', 'loading');

            // 1. Submit Job
            const submitResponse = await fetch('/api/ultimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSpeak })
            });

            if (!submitResponse.ok) throw new Error('Failed to submit job to Neural Engine');

            const submitData = await submitResponse.json();
            const jobId = submitData.jobId;

            if (!jobId) throw new Error('No Job ID returned from Neural Engine');

            // 2. Poll for Completion
            let attempts = 0;
            const maxAttempts = 60; // 2 minutes max
            let completed = false;

            while (attempts < maxAttempts && !completed) {
                attempts++;
                // Wait 2 seconds between checks
                await new Promise(r => setTimeout(r, 2000));

                const statusResponse = await fetch('/api/ultimate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobId: jobId })
                });

                if (!statusResponse.ok) continue; // Retry on transient network error

                const statusData = await statusResponse.json();

                if (statusData.status === 'COMPLETED') {
                    completed = true;
                    if (statusData.output && statusData.output.audio_base64) {
                        audioData = statusData.output.audio_base64;
                    } else {
                        throw new Error('Job completed but returned no audio data');
                    }
                } else if (statusData.status === 'FAILED') {
                    throw new Error('Neural Generation Failed: ' + JSON.stringify(statusData.error));
                } else {
                    // Still running
                    showStatus(`🚀 Generating... (${attempts * 2}s elapsed) - Please wait`, 'loading');
                }
            }

            if (!completed) throw new Error('Generation timed out. Please try again.');

        } else {
            // --- STANDARD VOICES (SYNC) ---
            showStatus(`🔄 Generating audio...`, 'loading');

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSpeak }),
            });

            // Handle non-JSON responses
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const textContent = await response.text();
                throw new Error(`Server Error (${response.status}): ${textContent.substring(0, 100)}`);
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate speech');
            }

            audioData = data.audio_base64;
        }

        // --- PLAY AUDIO ---
        if (!audioData) throw new Error('No audio data received');

        // Clean base64
        let base64String = audioData;
        if (base64String.includes(',')) base64String = base64String.split(',')[1];
        base64String = base64String.replace(/\s/g, '');

        // Decode and Play
        try {
            const raw = atob(base64String);
            const rawLength = raw.length;
            const array = new Uint8Array(new ArrayBuffer(rawLength));
            for (let i = 0; i < rawLength; i++) array[i] = raw.charCodeAt(i);

            currentAudioBlob = new Blob([array], { type: 'audio/mpeg' });
        } catch (e) {
            throw new Error('Failed to decode audio data.');
        }

        const audioUrl = URL.createObjectURL(currentAudioBlob);
        audio.src = audioUrl;

        showStatus('✅ Audio generated successfully!', 'success');
        audioPlayer.style.display = 'block';

        setTimeout(() => {
            audio.play().catch(e => console.log('Auto-play blocked'));
        }, 300);

    } catch (error) {
        console.error('Error:', error);
        showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
    }
});

// Download audio
downloadBtn.addEventListener('click', () => {
    if (!currentAudioBlob) {
        showStatus('❌ No audio to download', 'error');
        return;
    }

    // Create download link
    const url = URL.createObjectURL(currentAudioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telugu-speech-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus('✅ Audio downloaded successfully!', 'success');
});

// Dictation Logic (Speech to Text)
const dictateBtn = document.getElementById('dictateBtn');
const micLabel = document.getElementById('micLabel');
let recognition = null;
let isRecording = false;

function initSpeech() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Speech API not supported');
        // Do not hide button, but make it alert user on click
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'te-IN'; // Telugu India
    recognition.continuous = true;
    recognition.interimResults = true;

    let initialText = '';

    recognition.onstart = () => {
        isRecording = true;
        initialText = teluguText.value;
        // Smart spacing
        if (initialText.length > 0 && !/\s$/.test(initialText)) {
            initialText += ' ';
        }

        dictateBtn.classList.add('recording');
        if (micLabel) micLabel.textContent = 'Listening... Click to Stop';
        showStatus('🎙️ Listening... Speak freely in Telugu', 'loading');
    };

    recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
            } else {
                interim += event.results[i][0].transcript;
            }
        }

        if (final) {
            initialText += final + ' ';
        }

        teluguText.value = initialText + interim;
        teluguText.dispatchEvent(new Event('input'));
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
            showStatus('❌ Microphone access denied.', 'error');
            stopRecording();
        } else if (event.error === 'no-speech') {
            // checking silence is fine, don't error out
        } else {
            showStatus('❌ Error: ' + event.error, 'error');
            stopRecording();
        }
    };

    recognition.onend = () => {
        if (isRecording) {
            // Attempt restart if supposedly still recording
            try {
                recognition.start();
            } catch (e) {
                stopRecording();
            }
        } else {
            stopRecording();
        }
    };
}

function stopRecording() {
    isRecording = false;
    if (recognition) {
        try { recognition.stop(); } catch (e) { }
    }
    dictateBtn.classList.remove('recording');
    if (micLabel) micLabel.textContent = 'Use Mic';
    if (statusMessage.className.includes('loading')) {
        showStatus('✅ Dictation stopped.', 'success');
        setTimeout(hideStatus, 2000);
    }
}

// Initialize
initSpeech();

dictateBtn.addEventListener('click', () => {
    if (!recognition) {
        alert('Your browser does not support Speech Recognition. Please use Google Chrome or Edge.');
        return;
    }

    if (isRecording) {
        stopRecording();
    } else {
        try {
            recognition.start();
        } catch (e) {
            console.error('Start error:', e);
            if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                showStatus('❌ Mic access denied. Check settings.', 'error');
            } else {
                // Try hard reset
                isRecording = false;
                stopRecording();
            }
        }
    }
});

// Keyboard shortcut: Ctrl+Enter to generate
teluguText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generateBtn.click();
    }
});
