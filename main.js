const SEAHORSE_EMOJI = '\u{1F9AC}'; // Seahorse (U+1F9AC)
let audioContext;
let yesBuffer = null;

// Initialize AudioContext on user interaction
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Try to resume if suspended (common in mobile browsers)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
}

async function loadAudio(url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error("Error loading audio:", error);
        return null;
    }
}

function playSound(buffer) {
    initializeAudioContext();
    if (!buffer) return;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}

const answerArea = document.getElementById('answer-area');

async function initialize() {
    // Initialize audio context early, but load buffer.
    // Audio will only play if user interaction has occurred, but we handle the promise of loading.
    initializeAudioContext();

    yesBuffer = await loadAudio('yes.mp3');

    // Display answer
    answerArea.innerHTML = `
        <p class="affirmation">Yes, there is!</p>
        <span class="emoji">${SEAHORSE_EMOJI}</span>
        <p>This emoji (U+1F9AC) was approved as part of Emoji 13.0 in 2020.</p>
    `;

    // Attempt to play confirmation sound after display
    // We wrap this in a click/touch handler attempt to bypass Autoplay policies if necessary,
    // though immediate loading is usually fine if triggered by a user action implicitly.
    // Since we don't have an explicit button, we rely on the browser's policies.
    const attemptPlaySound = () => {
        if (yesBuffer) {
            playSound(yesBuffer);
            // Remove handlers once played successfully to prevent repeat playback on continuous clicks
            document.removeEventListener('click', attemptPlaySound);
            document.removeEventListener('touchstart', attemptPlaySound);
        }
    };

    // Use a slight delay before attempting playback
    setTimeout(() => {
        if (audioContext.state !== 'running') {
            // If audio context is not running, wait for user interaction
            document.addEventListener('click', attemptPlaySound, { once: true });
            document.addEventListener('touchstart', attemptPlaySound, { once: true });
            console.log("Audio waiting for user interaction.");
        } else {
            // Context is already running, play immediately
            attemptPlaySound();
        }
    }, 500);
}

initialize();

