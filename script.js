const peerConfig = {
    config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }, { url: 'stun:stun1.l.google.com:19302' }] }
};

let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;

// --- MEGA DIZIONARIO DI SICUREZZA ---
const superDizionario = ["ABITUDINE", "ACQUARIO", "ALLENATORE", "ASTRONAVE", "AVVENTURA", "BICICLETTA", "BOTTIGLIA", "BUSSOLA", "CALCIATORE", "CHITARRA", "DIZIONARIO", "ELEFANTE", "EMOZIONE", "ESPERIENZA", "FAMIGLIA", "FANTASIA", "GENTILEZZA", "GIARDINO", "IDROGENO", "LABIRINTO", "MONTAGNA", "ORIZZONTE", "PANTALONI", "QUADERNO", "RISTORANTE", "SETTIMANA", "TELEFONO", "UNIVERSO", "VELOCITA", "ZAFFERANO", "ZUCCHERO"];

// --- GENERATORE CASUALE SILLABICO (Logica Italiana) ---
function generaParolaCasuale() {
    const voc = "AEIOU";
    const cons = "BCDFGLMNPQRSTV";
    const sillabe = ["STR", "BR", "CR", "PR", "TR", "GL", "CH", "SC", "GN"];
    let parola = "";
    const len = Math.floor(Math.random() * 3) + 6; // Lunghezza 6-8

    for(let i=0; i<len; i++) {
        if(i % 2 === 0) {
            parola += (Math.random() > 0.8) ? sillabe[Math.floor(Math.random()*sillabe.length)] : cons[Math.floor(Math.random()*cons.length)];
        } else {
            parola += voc[Math.floor(Math.random()*voc.length)];
        }
    }
    // Assicura che finisca con una vocale
    if(!voc.includes(parola.slice(-1))) parola += voc[Math.floor(Math.random()*voc.length)];
    return parola.toUpperCase();
}

// --- ANTI-BLOCCO ---
function startHeartbeat() {
    setInterval(() => { if (conn && conn.open) conn.send({ type: 'KEEP_ALIVE' }); }, 3000);
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
            document.getElementById('role-badge').innerText = "SFIDANTE";
            document.getElementById('word-display').innerText = "IL MASTER SCEGLIE...";
            document.getElementById('keyboard').classList.add('hidden');
        }
    });

    conn.on('data', data => {
        if (data.type === 'KEEP_ALIVE') return;
        if (data.type === 'START') { secretWord = data.word; isBot = false; startPlay("SFIDANTE"); }
        else if (data.type === 'GUESS') processMove(data.letter);
        else if (data.type === 'EMOJI') showEmoji(data.emoji);
    });
}

// --- BOT IBRIDO (Casuale + Dizionario) ---
document.getElementById('bot-btn').onclick = () => {
    const display = document.getElementById('word-display');
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    
    let loader = setInterval(() => {
        display.innerText = Math.random().toString(36).substring(2, 9).toUpperCase();
    }, 50);

    setTimeout(() => {
        clearInterval(loader);
        
        // LOGICA IBRIDA: 70% parola reale dal dizionario, 30% parola generata dai suoni
        if(Math.random() > 0.3) {
            secretWord = superDizionario[Math.floor(Math.random() * superDizionario.length)];
        } else {
            secretWord = generaParolaCasuale();
        }
        
        isBot = true; amIMaster = false;
        startPlay("BOT CHALLENGE");
    }, 800);
};

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
    guessedLetters = []; mistakes = 0;
    document.getElementById('wrong-letters').innerText = "";
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);
    if(role !== "MASTER") document.getElementById('keyboard').classList.remove('hidden');
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
    if(!secretWord || document.getElementById('word-display').innerText.includes("SCEGLIE")) return;
    let content = secretWord.split('').map(l => 
        guessedLetters.includes(l) ? `<span>${l}</span>` : "_"
    ).join('\u00A0');
    document.getElementById('word-display').innerHTML = content;
    const win = secretWord.split('').every(l => guessedLetters.includes(l));
    if(win) end(true); else if(mistakes >= 6) end(false);
}

function end(wordGuessed) {
    document.getElementById('overlay').classList.remove('hidden');
    let title = document.getElementById('result-title');
    if (amIMaster) title.innerText = wordGuessed ? "HAI PERSO!" : "HAI VINTO!";
    else title.innerText = wordGuessed ? "HAI VINTO!" : "HAI PERSO!";
    document.getElementById('result-desc').innerText = "La parola era: " + secretWord;
}

// --- TASTIERA ---
const kb = document.getElementById('keyboard');
kb.innerHTML = "";
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
    if(s>=1) ctx.arc(100, 40, 20, 0, Math.PI*2);
    if(s>=2) { ctx.moveTo(100, 60); ctx.lineTo(100, 110); }
    if(s>=3) { ctx.moveTo(100, 75); ctx.lineTo(75, 95); }
    if(s>=4) { ctx.moveTo(100, 75); ctx.lineTo(125, 95); }
    if(s>=5) { ctx.moveTo(100, 110); ctx.lineTo(75, 150); }
    if(s>=6) { ctx.moveTo(100, 110); ctx.lineTo(125, 150); }
    ctx.stroke();
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
    setTimeout(() => document.getElementById('copy-btn').innerText = "COPIA", 2000);
};
document.getElementById('retry-btn').onclick = () => location.reload();
