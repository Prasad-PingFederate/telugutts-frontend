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

// --- DEBUG TERMINAL HELPER ---
function logDebug(message, type = 'info') {
    const debugLog = document.getElementById('debugLog');
    if (!debugLog) return;

    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
    const div = document.createElement('div');
    div.className = 'log-line';

    let colorClass = 'log-info';
    if (type === 'success') colorClass = 'log-success';
    if (type === 'error') colorClass = 'log-error';
    if (type === 'cmd') colorClass = 'log-cmd';

    div.innerHTML = `<span class="log-time">[${time}]</span> <span class="${colorClass}">${message}</span>`;

    debugLog.appendChild(div);
    debugLog.scrollTop = debugLog.scrollHeight; // Auto scroll
}

// --- FILE UPLOAD HANDLING ---
const refAudioInput = document.getElementById('refAudioInput');
const fileNameLabel = document.getElementById('fileName');
let refAudioBase64 = null;

if (refAudioInput) {
    refAudioInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) {
            fileNameLabel.textContent = "Upload 5-10s Audio (WAV/MP3)";
            refAudioBase64 = null;
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert("File is too large! Please upload under 5MB.");
            this.value = "";
            return;
        }

        fileNameLabel.textContent = "✅ " + file.name;

        // Convert to Base64
        const reader = new FileReader();
        reader.onload = function (e) {
            // Remove data:audio/xyz;base64, prefix
            const result = e.target.result;
            if (result.includes(',')) {
                refAudioBase64 = result.split(',')[1];
            } else {
                refAudioBase64 = result;
            }
            logDebug(`Loaded reference audio: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`, 'success');
        };
        reader.readAsDataURL(file);
    });
}

// --- UI TOGGLING ---
function updateVoiceSelection(radio) {
    const voice = radio.value;

    // Update visuals
    document.querySelectorAll('.voice-pill').forEach(l => l.classList.remove('selected'));
    radio.parentElement.classList.add('selected');

    // Toggle Cloning Studio
    const studio = document.getElementById('cloningStudio');
    if (!studio) return;

    if (voice === 'ultimate') {
        studio.style.display = 'block';
        setTimeout(() => studio.classList.add('visible'), 10);
        logDebug('Ultimate Engine selected. Ready for cloning.', 'cmd');
    } else {
        studio.style.display = 'none';
        studio.classList.remove('visible');
    }
}

// Bind Listeners Explicitly (Fixes HTML onchange issues)
document.addEventListener('DOMContentLoaded', () => {
    const radios = document.querySelectorAll('input[name="voice"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => updateVoiceSelection(e.target));
        // Check initial state
        if (radio.checked) updateVoiceSelection(radio);
    });
});

// --- GENERATION LOGIC ---
generateBtn.addEventListener('click', async () => {
    const text = teluguText.value.trim();
    const voiceInput = document.querySelector('input[name="voice"]:checked');
    const selectedVoice = voiceInput ? voiceInput.value : 'female';
    const refText = document.getElementById('refTextInput')?.value || "";

    // Validation
    if (!text) {
        showStatus('⚠️ Please enter some Telugu text', 'error');
        return;
    }

    // Reset UI
    audioPlayer.style.display = 'none';
    hideStatus();
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;

    if (selectedVoice === 'ultimate') {
        const debugLog = document.getElementById('debugLog');
        if (debugLog) debugLog.innerHTML = '';
    }

    try {
        let textToSpeak = text;
        let audioData = null;

        // --- TRANSLATION ---
        if (selectedVoice === 'indic_trans') {
            showStatus('🧠 Translating...', 'loading');
            const transRes = await fetch('/api/indic-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });
            const transData = await transRes.json();
            if (transData.translated_text) {
                textToSpeak = transData.translated_text;
                teluguText.value = textToSpeak;
            } else {
                throw new Error('Translation failed');
            }
        }

        // --- ULTIMATE VOICE (CLONING - ASYNC) ---
        if (selectedVoice === 'ultimate') {
            logDebug(`Starting Job for: "${textToSpeak.substring(0, 20)}..."`, 'cmd');

            const payload = {
                text: textToSpeak,
                reference_text: refText
            };

            if (refAudioBase64) {
                payload.reference_audio = refAudioBase64;
                logDebug('Attaching custom reference audio...', 'info');
            } else {
                logDebug('Using default reference voice (female_shruti)', 'info');
            }

            // 1. Submit
            logDebug('Submitting to RunPod GPU Cloud...', 'info');
            const submitRes = await fetch('/api/ultimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!submitRes.ok) {
                const err = await submitRes.text();
                throw new Error('Submission Failed: ' + err);
            }

            const submitData = await submitRes.json();
            const jobId = submitData.jobId;
            logDebug(`Job Submitted! ID: ${jobId}`, 'success');

            // 2. Poll
            let attempts = 0;
            const maxAttempts = 120; // 4 mins
            let completed = false;

            showStatus(`🚀 Processing Job: ${jobId}`, 'loading');

            while (attempts < maxAttempts && !completed) {
                attempts++;
                await new Promise(r => setTimeout(r, 2000)); // 2s wait

                const statusRes = await fetch('/api/ultimate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobId: jobId })
                });

                if (!statusRes.ok) {
                    logDebug(`Network glitch checking status... retrying`, 'warning');
                    continue;
                }

                const statusData = await statusRes.json();

                if (statusData.status === 'COMPLETED') {
                    completed = true;
                    logDebug('Job Completed! Downloading Audio...', 'success');
                    audioData = statusData.output.audio_base64;
                } else if (statusData.status === 'FAILED') {
                    logDebug(`Job FAILED: ${JSON.stringify(statusData.error)}`, 'error');
                    throw new Error('RunPod Job Failed');
                } else {
                    const queueMsg = statusData.status === 'IN_QUEUE' ? ' (In Queue)' : '';
                    if (attempts % 2 === 0) logDebug(`Status: ${statusData.status}${queueMsg} [${attempts * 2}s]`, 'info');
                }
            }

            if (!completed) throw new Error('Timeout waiting for GPU');

        } else {
            // --- STANDARD VOICES (SYNC) ---
            let endpoint = '/api/female';
            if (selectedVoice === 'male') endpoint = '/api/male';
            if (selectedVoice === 'openai') endpoint = '/api/aws-polly'; // Label says Polly

            showStatus(`🔄 Generating audio...`, 'loading');

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSpeak })
            });

            // Check for JSON
            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(`Server Error (${res.status}): ${text.substring(0, 50)}`);
            }

            if (!res.ok) throw new Error(data.error || 'Generation Failed');
            audioData = data.audio_base64;
        }

        // --- PLAYBACK ---
        if (!audioData) throw new Error('No audio returned');

        // Clean Base64
        let base64String = audioData;
        if (base64String.includes(',')) base64String = base64String.split(',')[1];
        base64String = base64String.replace(/\s/g, '');

        // Decode Base64
        const binaryString = window.atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        currentAudioBlob = new Blob([bytes], { type: 'audio/mpeg' }); // IndicF5 returns wav/mp3 often

        const url = URL.createObjectURL(currentAudioBlob);
        audio.src = url;
        audioPlayer.style.display = 'block';
        showStatus('✅ Speech Generated Successfully', 'success');

        if (selectedVoice === 'ultimate') {
            logDebug('Audio ready for playback.', 'success');
        }

        setTimeout(() => audio.play().catch(e => console.log(e)), 500);

    } catch (e) {
        if (selectedVoice === 'ultimate') logDebug(`Critical Error: ${e.message}`, 'error');
        showStatus(`❌ Error: ${e.message}`, 'error');
        console.error(e);
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
