const peer = new Peer();
let conn;
let secretWord = "";
let guessedLetters = [];
let mistakes = 0;
let isHost = false; // Chi mette la parola è l'Host

// Visualizza e Copia ID
peer.on('open', id => { document.getElementById('my-id').innerText = id; });
document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(document.getElementById('my-id').innerText);
    alert("Codice copiato!");
};

// Connessione
document.getElementById('connect-btn').onclick = () => {
    const remoteId = document.getElementById('peer-id-input').value;
    conn = peer.connect(remoteId);
    setupConnection();
};

peer.on('connection', c => {
    conn = c;
    setupConnection();
});

function setupConnection() {
    conn.on('open', () => {
        document.getElementById('setup-screen').classList.add('hidden');
        // Il primo che si connette/riceve decide se mostrare la scelta parola
        document.getElementById('word-input-screen').classList.remove('hidden');
    });

    conn.on('data', data => {
        if (data.type === 'START') {
            secretWord = data.word.toUpperCase();
            isHost = false; // Io indovino
            startUI("DEVI INDOVINARE");
        } else if (data.type === 'GUESS') {
            handleMove(data.letter);
        }
    });
}

// Inizio Gioco
document.getElementById('start-game-btn').onclick = () => {
    const word = document.getElementById('secret-word').value.trim();
    if (word) {
        secretWord = word.toUpperCase();
        isHost = true; // Io ho messo la parola
        conn.send({ type: 'START', word: secretWord });
        startUI("STAI OSSERVANDO...");
        document.getElementById('word-input-screen').classList.add('hidden');
    }
};

function startUI(roleText) {
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-indicator').innerText = roleText;
    if (isHost) document.getElementById('keyboard').classList.add('hidden');
    renderWord();
}

function renderWord() {
    const display = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join(' ');
    document.getElementById('word-display').innerText = display;
    if (!display.includes("_") && secretWord) {
        document.getElementById('message').innerText = "PARTITA FINITA!";
    }
}

function renderKeyboard() {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = '';
    "QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
        const btn = document.createElement('div');
        btn.className = 'key';
        btn.innerText = l;
        btn.onclick = () => {
            btn.classList.add('used');
            conn.send({ type: 'GUESS', letter: l });
            handleMove(l);
        };
        kb.appendChild(btn);
    });
}
renderKeyboard();

function handleMove(letter) {
    if (!guessedLetters.includes(letter)) {
        guessedLetters.push(letter);
        if (!secretWord.includes(letter)) {
            mistakes++;
            drawHangman(mistakes);
        }
        renderWord();
    }
}

function drawHangman(step) {
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 3;
    if (step === 1) ctx.strokeRect(90, 20, 20, 20); // Testa
    if (step === 2) { ctx.moveTo(100, 40); ctx.lineTo(100, 100); } // Corpo
    if (step === 3) { ctx.moveTo(100, 50); ctx.lineTo(70, 80); } // Braccio L
    if (step === 4) { ctx.moveTo(100, 50); ctx.lineTo(130, 80); } // Braccio R
    if (step === 5) { ctx.moveTo(100, 100); ctx.lineTo(70, 140); } // Gamba L
    if (step === 6) { ctx.moveTo(100, 100); ctx.lineTo(130, 140); } // Gamba R
    ctx.stroke();
}
