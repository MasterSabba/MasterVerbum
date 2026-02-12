// --- MOTORE DI GENERAZIONE PAROLE INFINITE ---
async function ottieniParolaCasuale() {
    try {
        // Interroga Wikipedia per una voce casuale
        const response = await fetch('https://it.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1&origin=*');
        const data = await response.json();
        let parola = data.query.random[0].title.toUpperCase();
        
        // Pulizia: prendiamo solo la prima parola, rimuoviamo accenti e simboli
        parola = parola.split(' ')[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Validazione: deve essere tra 4 e 10 lettere, solo A-Z
        if (parola.length < 4 || parola.length > 10 || /[^A-Z]/.test(parola)) {
            return generaParolaSillabica(); // Se non va bene, usa il generatore interno
        }
        return parola;
    } catch (e) {
        return generaParolaSillabica(); // Backup offline
    }
}

// Generatore procedurale di parole "sensate" basato su sillabe italiane
function generaParolaSillabica() {
    const sillabe = ["MA", "RE", "PA", "NE", "LI", "BRO", "CA", "SA", "SO", "LE", "GA", "TO", "VI", "TA", "MON", "TE", "FIO", "RE", "BI", "CO", "LU", "NA", "STE", "LA", "FE", "DE"];
    let p = "";
    const lunghezza = Math.floor(Math.random() * 2) + 2; // 2 o 3 sillabe
    for(let i=0; i<lunghezza; i++) p += sillabe[Math.floor(Math.random() * sillabe.length)];
    return p;
}

// --- STATO DEL GIOCO ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;

peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    document.getElementById('status-msg').innerText = "🌐 Sistema Online";
});

// --- LOGICA BOT ---
document.getElementById('bot-btn').onclick = async () => {
    document.getElementById('status-msg').innerText = "🤖 Il Bot sta pensando...";
    isBot = true;
    amIMaster = false;
    secretWord = await ottieniParolaCasuale();
    startPlay("SOLO VS BOT");
};

// --- LOGICA MULTIPLAYER ---
document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase();
    if(target) {
        document.getElementById('status-msg').innerText = "📡 Ricerca avversario...";
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
        amIMaster = myId < conn.peer;
        document.getElementById('setup-screen').classList.add('hidden');
        if(amIMaster) {
            document.getElementById('host-screen').classList.remove('hidden');
        } else {
            document.getElementById('play-screen').classList.remove('hidden');
            document.getElementById('word-display').innerText = "IL MASTER STA SCRIVENDO...";
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
}

// --- AZIONI GIOCO ---
document.getElementById('start-btn').onclick = () => {
    const w = document.getElementById('secret-word').value.trim().toUpperCase();
    if(w.length < 3) return alert("Parola troppo corta!");
    secretWord = w;
    if(conn) conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    
    guessedLetters = [];
    mistakes = 0;
    document.getElementById('wrong-letters').innerText = "";
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);

    if(!amIMaster) {
        document.getElementById('keyboard').classList.remove('hidden');
        document.querySelectorAll('.key').forEach(k => k.classList.remove('used'));
    } else {
        document.getElementById('keyboard').classList.add('hidden');
    }
    render();
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
    if(!secretWord || document.getElementById('word-display').innerText.includes("SCRIVENDO")) return;
    const res = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join(' ');
    document.getElementById('word-display').innerText = res;
    if(!res.includes('_') && secretWord !== "") end(true);
    else if(mistakes >= 6) end(false);
}

// TASTIERA
const kb = document.getElementById('keyboard');
kb.innerHTML = "";
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
    document.getElementById('result-desc').innerText = "Il Verbum era: " + secretWord;
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
