// Configurazione per forzare la connessione tra iPad
const config = {
    config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] }
};

let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, config);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;

peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    document.getElementById('status-msg').innerText = "🌐 Online";
});

// --- RICEZIONE DATI ---
peer.on('connection', c => {
    conn = c;
    setupLogic();
});

document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase();
    if(target) {
        conn = peer.connect(target);
        setupLogic();
    }
};

function setupLogic() {
    conn.on('open', () => {
        amIMaster = myId < conn.peer;
        document.getElementById('setup-screen').classList.add('hidden');
        if(amIMaster) {
            document.getElementById('host-screen').classList.remove('hidden');
        } else {
            document.getElementById('play-screen').classList.remove('hidden');
            document.getElementById('role-badge').innerText = "SFIDANTE";
            document.getElementById('word-display').innerText = "IL MASTER STA SCRIVENDO...";
            document.getElementById('keyboard').classList.add('hidden');
        }
    });

    conn.on('data', data => {
        if(data.type === 'START') {
            // AZIONE CRUCIALE: Reset dello stato e della parola
            secretWord = data.word;
            isBot = false;
            guessedLetters = [];
            mistakes = 0;
            
            // Forza la pulizia del testo "IL MASTER STA SCRIVENDO"
            document.getElementById('word-display').innerText = ""; 
            startPlay("SFIDANTE");
        } else if(data.type === 'GUESS') {
            processMove(data.letter);
        } else if(data.type === 'EMOJI') {
            showEmoji(data.emoji);
        }
    });
}

// --- LOGICA BOT (PAROLE INFINITE) ---
async function ottieniParolaCasuale() {
    try {
        const response = await fetch('https://it.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1&origin=*');
        const data = await response.json();
        let p = data.query.random[0].title.toUpperCase().split(' ')[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return (p.length > 3 && p.length < 10 && /^[A-Z]+$/.test(p)) ? p : "GALASSIA";
    } catch(e) { return "UNIVERSO"; }
}

document.getElementById('bot-btn').onclick = async () => {
    isBot = true; amIMaster = false;
    document.getElementById('status-msg').innerText = "🤖 Il Bot pensa...";
    secretWord = await ottieniParolaCasuale();
    startPlay("SOLO VS BOT");
};

// --- CORE GIOCO ---
document.getElementById('start-btn').onclick = () => {
    const w = document.getElementById('secret-word').value.trim().toUpperCase();
    if(w.length < 3) return alert("Minimo 3 lettere!");
    secretWord = w;
    if(conn) conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    
    document.getElementById('wrong-letters').innerText = "";
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);

    if(role === "MASTER") {
        document.getElementById('keyboard').classList.add('hidden');
    } else {
        document.getElementById('keyboard').classList.remove('hidden');
        document.querySelectorAll('.key').forEach(k => k.classList.remove('used'));
    }
    render(); // Forza i trattini
}

function processMove(l) {
    if(!guessedLetters.includes(l)) {
        guessedLetters.push(l);
        if(!secretWord.includes(l)) { 
            mistakes++; 
            draw(mistakes); 
            document.getElementById('wrong-letters').innerText += l + " ";
        }
        render();
    }
}

function render() {
    if(!secretWord) return;
    
    // Mostra la parola con i trattini
    const display = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join(' ');
    document.getElementById('word-display').innerText = display;
    
    if(!display.includes('_') && secretWord !== "") end(true);
    else if(mistakes >= 6) end(false);
}

// TASTIERA
const kb = document.getElementById('keyboard');
"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div');
    b.className = 'key'; b.innerText = l;
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
    ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath();
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
