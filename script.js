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
    const apiEndpoint = selectedVoice === 'male' ? '/api/male' : '/api/tts';

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
    showStatus(`🔄 Generating ${selectedVoice} voice... This may take a few seconds`, 'loading');

    try {
        // Call the API
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.details
                ? `${data.error}: ${data.details}`
                : (data.error || 'Failed to generate speech');
            throw new Error(errorMessage);
        }

        // Check if we got audio data
        if (!data.audio_base64) {
            throw new Error('No audio data received');
        }

        // Convert base64 to blob
        // Create Blob from base64
        let base64String = data.audio_base64;

        // Fix: Clean the base64 string
        if (base64String.includes(',')) {
            base64String = base64String.split(',')[1];
        }
        base64String = base64String.replace(/\s/g, '');

        try {
            const audioData = atob(base64String);
            const audioArray = new Uint8Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
                audioArray[i] = audioData.charCodeAt(i);
            }
            currentAudioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        } catch (e) {
            console.error('Base64 error:', e);
            throw new Error('Failed to decode audio data from server.');
        }


        // Create URL and play
        const audioUrl = URL.createObjectURL(currentAudioBlob);
        audio.src = audioUrl;

        // Show success
        showStatus('✅ ' + (data.message || 'Audio generated successfully!'), 'success');
        audioPlayer.style.display = 'block';

        // Auto-play the audio
        setTimeout(() => {
            audio.play().catch(err => {
                console.log('Auto-play prevented:', err);
            });
        }, 300);

    } catch (error) {
        console.error('Error:', error);
        showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
        // Reset button state
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
let recognition = null;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'te-IN'; // Telugu India
    recognition.continuous = true; // Continuous listening
    recognition.interimResults = true; // Show results in real-time

    let initialText = '';

    recognition.onstart = () => {
        isRecording = true;
        initialText = teluguText.value;
        if (initialText.length > 0 && !initialText.endsWith(' ')) initialText += ' ';

        dictateBtn.classList.add('recording');
        dictateBtn.querySelector('span').textContent = 'Listening (Click to Stop)...';
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

        // Trigger input event to update char count
        teluguText.dispatchEvent(new Event('input'));
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
            showStatus('❌ Microphone access denied. Please allow permission.', 'error');
        } else {
            // Ignore no-speech errors in continuous mode
            if (event.error !== 'no-speech') {
                showStatus('❌ Error hearing speech. Try again.', 'error');
            }
        }
    };

    recognition.onend = () => {
        // Mobile device fix: If we are still "recording" (user didn't click stop),
        // restart the recognition engine.
        if (isRecording) {
            console.log('Recognition ended but isRecording is true. Restarting...');
            try {
                recognition.start();
            } catch (e) {
                console.log('Restart failed:', e);
                stopRecording(); // detailed error or hard stop
            }
        } else {
            stopRecording();
            if (!statusMessage.textContent.includes('Error')) {
                setTimeout(hideStatus, 2000);
            }
        }
    };
} else {
    dictateBtn.style.display = 'none'; // Hide if not supported
    console.log('Web Speech API not supported in this browser.');
}

function stopRecording() {
    // Only stop if we are actually recording
    if (isRecording) {
        isRecording = false;
        if (recognition) recognition.stop();
        dictateBtn.classList.remove('recording');
        dictateBtn.querySelector('span').textContent = 'Dictate (Speak in Telugu)';
        showStatus('✅ Dictation stopped.', 'success');
        setTimeout(hideStatus, 2000);
    }
}

dictateBtn.addEventListener('click', () => {
    if (!recognition) {
        showStatus('❌ Your browser does not support Speech Recognition. Try Chrome.', 'error');
        return;
    }

    if (isRecording) {
        stopRecording();
    } else {
        recognition.start();
    }
});

// Keyboard shortcut: Ctrl+Enter to generate
teluguText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generateBtn.click();
    }
});
