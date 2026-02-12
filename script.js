const peerConfig = {
    config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }, { url: 'stun:stun1.l.google.com:19302' }] }
};

let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;

// --- ANTI-BLOCCO ---
function startHeartbeat() {
    setInterval(() => { if (conn && conn.open) conn.send({ type: 'KEEP_ALIVE' }); }, 5000);
}

peer.on('open', id => { document.getElementById('my-id').innerText = id; });

peer.on('connection', c => { conn = c; setupLogic(); });

document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase();
    if(target) { conn = peer.connect(target, { reliable: true }); setupLogic(); }
};

function setupLogic() {
    conn.on('open', () => {
        amIMaster = myId < conn.peer;
        startHeartbeat();
        document.getElementById('setup-screen').classList.add('hidden');
        if(amIMaster) {
            document.getElementById('host-screen').classList.remove('hidden');
        } else {
            document.getElementById('play-screen').classList.remove('hidden');
            document.getElementById('word-display').innerText = "IL MASTER SCRIVE...";
            document.getElementById('keyboard').classList.add('hidden');
        }
    });

    conn.on('data', data => {
        if (data.type === 'KEEP_ALIVE') return;
        if (data.type === 'START') { secretWord = data.word; isBot = false; startPlay("SFIDANTE"); }
        else if (data.type === 'GUESS') processMove(data.letter);
        else if (data.type === 'EMOJI') showEmoji(data.emoji);
    });
    conn.on('close', () => location.reload());
}

// --- LOGICA BOT ---
document.getElementById('bot-btn').onclick = () => {
    const parole = ["GELATO", "PIZZA", "SOLE", "MARE", "LIBRO", "CASA", "SCUOLA", "GALAXY", "UNIVERSO"];
    secretWord = parole[Math.floor(Math.random()*parole.length)];
    isBot = true; amIMaster = false;
    startPlay("BOT CHALLENGE");
};

// --- GIOCO ---
document.getElementById('start-btn').onclick = () => {
    secretWord = document.getElementById('secret-word').value.trim().toUpperCase();
    if(secretWord.length < 3) return;
    if(conn) conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    if(role === "MASTER") document.getElementById('keyboard').classList.add('hidden');
    else document.getElementById('keyboard').classList.remove('hidden');
    render();
}

function processMove(l) {
    if(!guessedLetters.includes(l)) {
        guessedLetters.push(l);
        if(!secretWord.includes(l)) { mistakes++; draw(mistakes); document.getElementById('wrong-letters').innerText += l + " "; }
        render();
    }
}

function render() {
    if(!secretWord || document.getElementById('word-display').innerText.includes("SCRIVE")) return;
    const resHTML = secretWord.split('').map(l => 
        guessedLetters.includes(l) ? `<span>${l}</span>` : "_"
    ).join('\u00A0');
    document.getElementById('word-display').innerHTML = resHTML;
    
    const textOnly = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join('');
    if(textOnly === secretWord) end(true);
    else if(mistakes >= 6) end(false);
}

// --- LOGICA FINALE (VITTORIA/SCONFITTA) ---
function end(wordGuessed) {
    document.getElementById('overlay').classList.remove('hidden');
    let title = document.getElementById('result-title');
    
    if (amIMaster) {
        title.innerText = wordGuessed ? "HAI PERSO!" : "HAI VINTO!";
    } else {
        title.innerText = wordGuessed ? "HAI VINTO!" : "HAI PERSO!";
    }
    document.getElementById('result-desc').innerText = "La parola era: " + secretWord;
    title.style.color = title.innerText.includes("VINTO") ? "var(--neon-blue)" : "var(--neon-pink)";
}

// --- TASTIERA ---
const kb = document.getElementById('keyboard');
"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => {
        if(amIMaster || b.classList.contains('used')) return;
        b.classList.add('used');
        if(!isBot && conn) conn.send({ type: 'GUESS', letter: l });
        processMove(l);
    };
    kb.appendChild(b);
});

// --- DISEGNO ---
function draw(s) {
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 4; ctx.beginPath();
    if(s==1) ctx.arc(100, 40, 20, 0, Math.PI*2);
    if(s==2) { ctx.moveTo(100, 60); ctx.lineTo(100, 120); }
    if(s==3) { ctx.moveTo(100, 80); ctx.lineTo(70, 100); }
    if(s==4) { ctx.moveTo(100, 80); ctx.lineTo(130, 100); }
    if(s==5) { ctx.moveTo(100, 120); ctx.lineTo(70, 160); }
    if(s==6) { ctx.moveTo(100, 120); ctx.lineTo(130, 160); }
    ctx.stroke();
}

// --- EMOJI E UTILITY ---
function sendEmoji(e) { if(conn && conn.open) conn.send({ type: 'EMOJI', emoji: e }); showEmoji(e); }
function showEmoji(e) {
    const el = document.createElement('div'); el.className = 'floating-emoji'; el.innerText = e;
    document.getElementById('emoji-area').appendChild(el);
    setTimeout(() => el.remove(), 2000);
}
document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(myId);
    document.getElementById('copy-btn').innerText = "COPIATO!";
    setTimeout(() => document.getElementById('copy-btn').innerText = "COPIA CODICE", 2000);
};
document.getElementById('retry-btn').onclick = () => location.reload();
