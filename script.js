const peerConfig = {
    config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }, { url: 'stun:stun1.l.google.com:19302' }] }
};

let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;

// --- MULTIPLAYER STABILE ---
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
            document.getElementById('word-display').innerText = "IL MASTER STA SCRIVENDO";
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

// --- GENERATORE DI PAROLE VERO (NO NOMI PROPRI) ---
async function ottieniParolaCasuale() {
    try {
        const url = "https://it.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=10&origin=*";
        const res = await fetch(url);
        const data = await res.json();
        
        for (let item of data.query.random) {
            let p = item.title.toUpperCase().split(' ')[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            // Filtro: solo lettere A-Z, no numeri, lunghezza 5-9, no nomi francesi/strani comuni su Wiki
            const blacklist = ["PHILIPPE", "JEAN", "PIERRE", "LOUIS", "RENE", "HENRI", "MARC"];
            if (p.length > 4 && p.length < 10 && /^[A-Z]+$/.test(p) && !blacklist.includes(p)) {
                return p;
            }
        }
    } catch(e) { console.log("Wiki Error, uso backup"); }
    
    const backup = ["PIZZA", "CALCIO", "DOMANI", "ESTATE", "LAVORO", "MUSICA", "STRADA", "VIAGGIO", "CUCINA", "ALBERO"];
    return backup[Math.floor(Math.random()*backup.length)];
}

document.getElementById('bot-btn').onclick = async () => {
    document.getElementById('status-msg').innerText = "🤖 IL BOT STA PENSANDO...";
    secretWord = await ottieniParolaCasuale();
    isBot = true; amIMaster = false;
    startPlay("BOT CHALLENGE");
};

// --- LOGICA DI GIOCO ---
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
    if(role === "MASTER") {
        document.getElementById('keyboard').classList.add('hidden');
        document.getElementById('word-display').innerText = "L'AMICO STA INDOVINANDO";
    } else {
        document.getElementById('keyboard').classList.remove('hidden');
        render();
    }
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
    if(!secretWord || (amIMaster && mistakes < 6)) {
        // Il Master vede i progressi dell'amico
        if(amIMaster) {
            const progresso = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join('\u00A0');
            document.getElementById('word-display').innerHTML = progresso;
        }
        if(!amIMaster) {
            const resHTML = secretWord.split('').map(l => guessedLetters.includes(l) ? `<span>${l}</span>` : "_").join('\u00A0');
            document.getElementById('word-display').innerHTML = resHTML;
        }
    }
    
    const check = secretWord.split('').every(l => guessedLetters.includes(l));
    if(check && secretWord) end(true);
    else if(mistakes >= 6) end(false);
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
kb.innerHTML = ""; // Pulisce per evitare doppioni
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
