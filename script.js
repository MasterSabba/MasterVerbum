const peer = new Peer(Math.random().toString(36).substring(2, 7).toUpperCase());
let conn, secretWord = "", guessedLetters = [], mistakes = 0, isBot = false, amIMaster = false;

peer.on('open', id => document.getElementById('my-id').innerText = id);

// Connessione
peer.on('connection', c => { conn = c; setupLogic(); });
document.getElementById('connect-btn').onclick = () => {
    conn = peer.connect(document.getElementById('peer-id-input').value.toUpperCase());
    setupLogic();
};

function setupLogic() {
    conn.on('open', () => {
        amIMaster = peer.id < conn.peer;
        document.getElementById('setup-screen').classList.add('hidden');
        if(amIMaster) document.getElementById('host-screen').classList.remove('hidden');
        else {
            document.getElementById('play-screen').classList.remove('hidden');
            document.getElementById('word-display').innerText = "IN ATTESA...";
        }
    });
    conn.on('data', data => {
        if(data.type === 'START') { secretWord = data.word; startPlay("SFIDANTE"); }
        if(data.type === 'GUESS') processMove(data.letter);
    });
}

// Bot
document.getElementById('bot-btn').onclick = async () => {
    const parole = ["GELATO", "PIZZA", "SOLE", "MARE", "LIBRO", "CASA", "SCUOLA", "CALCIO"];
    secretWord = parole[Math.floor(Math.random()*parole.length)];
    isBot = true;
    startPlay("BOT CHALLENGE");
};

// Start
document.getElementById('start-btn').onclick = () => {
    secretWord = document.getElementById('secret-word').value.toUpperCase();
    if(conn) conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    render();
}

function processMove(l) {
    if(!guessedLetters.includes(l)) {
        guessedLetters.push(l);
        if(!secretWord.includes(l)) { mistakes++; draw(); }
        render();
    }
}

function render() {
    if(!secretWord) return;
    // Spazio speciale per non andare a capo
    const res = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join('\u00A0');
    document.getElementById('word-display').innerText = res;
    if(!res.includes('_')) end("VITTORIA");
    else if(mistakes >= 6) end("SCONFITTA");
}

// Tastiera
const kb = document.getElementById('keyboard');
"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => {
        if(document.getElementById('role-badge').innerText === "MASTER") return;
        b.classList.add('used');
        if(conn) conn.send({ type: 'GUESS', letter: l });
        processMove(l);
    };
    kb.appendChild(b);
});

function draw() {
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 3;
    ctx.beginPath();
    if(mistakes==1) ctx.arc(100, 40, 20, 0, Math.PI*2);
    if(mistakes==2) { ctx.moveTo(100, 60); ctx.lineTo(100, 110); }
    if(mistakes==3) { ctx.moveTo(100, 75); ctx.lineTo(70, 90); }
    if(mistakes==4) { ctx.moveTo(100, 75); ctx.lineTo(130, 90); }
    if(mistakes==5) { ctx.moveTo(100, 110); ctx.lineTo(75, 140); }
    if(mistakes==6) { ctx.moveTo(100, 110); ctx.lineTo(125, 140); }
    ctx.stroke();
}

function end(msg) {
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('result-title').innerText = msg;
    document.getElementById('result-desc').innerText = "La parola era: " + secretWord;
}
