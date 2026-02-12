// Configurazione per stabilità massima su iPad
const peerConfig = {
    config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }, { url: 'stun:stun1.l.google.com:19302' }] },
    debug: 1
};

let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;

// Sistema Anti-Blocco: invia un segnale ogni 5 secondi per tenere attiva la connessione
function startHeartbeat() {
    setInterval(() => { if (conn && conn.open) conn.send({ type: 'KEEP_ALIVE' }); }, 5000);
}

peer.on('open', id => { document.getElementById('my-id').innerText = id; });

// Gestione connessione in entrata
peer.on('connection', c => {
    conn = c;
    setupLogic();
});

// Gestione connessione in uscita
document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase();
    if(target) {
        conn = peer.connect(target, { reliable: true });
        setupLogic();
    }
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
        if(data.type === 'START') {
            secretWord = data.word;
            isBot = false;
            startPlay("SFIDANTE");
        } else if(data.type === 'GUESS') {
            processMove(data.letter);
        } else if(data.type === 'EMOJI') {
            showEmoji(data.emoji);
        }
    });
    
    conn.on('close', () => { location.reload(); });
}

// --- LOGICA BOT (Solo parole comuni italiane) ---
async function ottieniParolaCasuale() {
    try {
        const resp = await fetch('https://it.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=10&origin=*');
        const data = await resp.json();
        const blacklist = ["PHILIPPE", "JEAN", "PIERRE", "LOUIS", "RENE", "HENRI"];
        
        for (let item of data.query.random) {
            let p = item.title.toUpperCase().split(' ')[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (p.length > 4 && p.length < 9 && /^[A-Z]+$/.test(p) && !blacklist.includes(p)) {
                return p;
            }
        }
        return "GALAXY";
    } catch(e) { return "UNIVERSO"; }
}

document.getElementById('bot-btn').onclick = async () => {
    isBot = true; amIMaster = false;
    document.getElementById('status-msg').innerText = "🤖 Scelta parola...";
    secretWord = await ottieniParolaCasuale();
    startPlay("SOLO VS BOT");
};

document.getElementById('start-btn').onclick = () => {
    const w = document.getElementById('secret-word').value.trim().toUpperCase();
    if(w.length < 3) return;
    secretWord = w;
    if(conn) conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    guessedLetters = []; mistakes = 0;
    document.getElementById('wrong-letters').innerText = "";
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);
    
    if(role === "MASTER") document.getElementById('keyboard').classList.add('hidden');
    else {
        document.getElementById('keyboard').classList.remove('hidden');
        document.querySelectorAll('.key').forEach(k => k.classList.remove('used'));
    }
    render();
}

function processMove(l) {
    if(!guessedLetters.includes(l)) {
        guessedLetters.push(l);
        if(!secretWord.includes(l)) { 
            mistakes++; draw(mistakes); 
            document.getElementById('wrong-letters').innerText += l + " ";
        }
        render();
    }
}

function render() {
    if(!secretWord || document.getElementById('word-display').innerText.includes("SCRIVE")) return;
    // Uso \u00A0 (spazio unificatore) per evitare che i trattini vadano a capo
    const res = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join('\u00A0');
    document.getElementById('word-display').innerText = res;
    if(!res.includes('_') && secretWord) end(true);
    else if(mistakes >= 6) end(false);
}

// TASTIERA
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

function end(win) {
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('result-title').innerText = win ? "VITTORIA" : "SCONFITTA";
    document.getElementById('result-desc').innerText = "La parola era: " + secretWord;
}

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
