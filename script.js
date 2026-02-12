const peer = new Peer();
let conn;
let secretWord = "";
let guessedLetters = [];
let mistakes = 0;

peer.on('open', (id) => {
    document.getElementById('my-id').innerText = id;
});

peer.on('connection', (c) => {
    conn = c;
    setupDataListener();
    document.getElementById('status').innerText = "Nemico connesso! Attendi il Verbum...";
    document.getElementById('setup-screen').classList.add('hidden');
});

document.getElementById('connect-btn').onclick = () => {
    const remoteId = document.getElementById('peer-id-input').value;
    conn = peer.connect(remoteId);
    setupDataListener();
    conn.on('open', () => {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('word-input-screen').classList.remove('hidden');
    });
};

function setupDataListener() {
    conn.on('data', (data) => {
        if (data.type === 'START_GAME') {
            secretWord = data.word.toUpperCase();
            initGameUI();
        } else if (data.type === 'GUESS') {
            handleGuess(data.letter);
        }
    });
}

document.getElementById('start-game-btn').onclick = () => {
    const word = document.getElementById('secret-word').value.trim();
    if (word.length >= 3) {
        conn.send({ type: 'START_GAME', word: word });
        secretWord = word.toUpperCase();
        initGameUI();
        document.getElementById('word-input-screen').classList.add('hidden');
    } else {
        alert("Il Verbum deve avere almeno 3 lettere!");
    }
};

function initGameUI() {
    document.getElementById('play-screen').classList.remove('hidden');
    renderWord();
    renderKeyboard();
}

function renderWord() {
    const display = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join(' ');
    document.getElementById('word-display').innerText = display;
    
    if (!display.includes("_") && secretWord !== "") {
        document.getElementById('message').innerText = "VITTORIA! HAI DOMINATO IL VERBUM 🎉";
        document.getElementById('message').style.color = "var(--primary)";
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
            if (!guessedLetters.includes(l)) {
                guessedLetters.push(l);
                btn.classList.add('used');
                conn.send({ type: 'GUESS', letter: l });
                handleGuess(l);
            }
        };
        kb.appendChild(btn);
    });
}

function handleGuess(letter) {
    if (!secretWord.includes(letter)) {
        mistakes++;
        drawHangman(mistakes);
        if (mistakes >= 6) {
            document.getElementById('message').innerText = `SCONFITTA! IL VERBUM ERA: ${secretWord}`;
            document.getElementById('message').style.color = "var(--accent)";
        }
    }
    renderWord();
}

function drawHangman(step) {
    const canvas = document.getElementById('hangmanCanvas');
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#ff0055";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    switch(step) {
        case 1: ctx.beginPath(); ctx.arc(100, 50, 25, 0, Math.PI*2); ctx.stroke(); break;
        case 2: ctx.moveTo(100, 75); ctx.lineTo(100, 160); ctx.stroke(); break;
        case 3: ctx.moveTo(100, 100); ctx.lineTo(60, 130); ctx.stroke(); break;
        case 4: ctx.moveTo(100, 100); ctx.lineTo(140, 130); ctx.stroke(); break;
        case 5: ctx.moveTo(100, 160); ctx.lineTo(60, 210); ctx.stroke(); break;
        case 6: ctx.moveTo(100, 160); ctx.lineTo(140, 210); ctx.stroke(); break;
    }
}
