const dictionary = ["GALAXY", "PYTHON", "MATRIX", "ROBOT", "IPAD", "CODING", "MASTER", "ZENITH", "VIRTUAL", "PHANTOM"];

function generateShortId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 5; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
}

const myId = generateShortId();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;

peer.on('open', id => document.getElementById('my-id').innerText = id);

// BOT MODE
document.getElementById('bot-btn').onclick = () => {
    isBot = true;
    secretWord = dictionary[Math.floor(Math.random() * dictionary.length)];
    startPlay("MODALITÀ BOT");
};

// MULTIPLAYER
document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase();
    if(target) {
        conn = peer.connect(target);
        setupLogic();
    }
};

peer.on('connection', c => {
    conn = c;
    setupLogic();
});

function setupLogic() {
    conn.on('open', () => {
        amIMaster = myId < conn.peer; // Chi ha l'ID "minore" inizia come Master
        document.getElementById('setup-screen').classList.add('hidden');
        if(amIMaster) document.getElementById('host-screen').classList.remove('hidden');
        else document.getElementById('status-msg').innerText = "L'avversario sta scegliendo...";
    });

    conn.on('data', data => {
        if(data.type === 'START') { secretWord = data.word; startPlay("SFIDANTE"); }
        else if(data.type === 'GUESS') { processMove(data.letter); }
    });
}

document.getElementById('start-btn').onclick = () => {
    const w = document.getElementById('secret-word').value.trim().toUpperCase();
    if(w.length < 3) return alert("Troppo corta!");
    secretWord = w;
    conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    if(amIMaster) document.getElementById('keyboard').classList.add('hidden');
    render();
}

const kb = document.getElementById('keyboard');
"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div');
    b.className = 'key'; b.innerText = l;
    b.onclick = () => {
        if(amIMaster) return;
        b.classList.add('used');
        if(!isBot) conn.send({ type: 'GUESS', letter: l });
        processMove(l);
    };
    kb.appendChild(b);
});

function processMove(l) {
    if(!guessedLetters.includes(l)) {
        guessedLetters.push(l);
        if(!secretWord.includes(l)) { mistakes++; draw(mistakes); }
        render();
    }
}

function render() {
    const res = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join(' ');
    document.getElementById('word-display').innerText = res;
    if(!res.includes('_') && secretWord) end(true);
    else if(mistakes >= 6) end(false);
}

function end(win) {
    const o = document.getElementById('overlay');
    o.classList.remove('hidden');
    document.getElementById('result-title').innerText = win ? "VITTORIA" : "SCONFITTA";
    document.getElementById('result-desc').innerText = win ? "Hai dominato il Verbum!" : "La parola era: " + secretWord;
}

function draw(s) {
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath();
    if(s==1) ctx.arc(100, 40, 20, 0, Math.PI*2);
    if(s==2) { ctx.moveTo(100, 60); ctx.lineTo(100, 120); }
    if(s==3) { ctx.moveTo(100, 70); ctx.lineTo(70, 90); }
    if(s==4) { ctx.moveTo(100, 70); ctx.lineTo(130, 90); }
    if(s==5) { ctx.moveTo(100, 120); ctx.lineTo(70, 160); }
    if(s==6) { ctx.moveTo(100, 120); ctx.lineTo(130, 160); }
    ctx.stroke();
}

document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(myId);
    alert("Codice Copiato!");
};
