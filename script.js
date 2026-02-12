// --- CONFIGURAZIONE DIZIONARIO BOT ---
const dizionarioBase = ["PIZZA", "CALCIO", "DOMANI", "VESUVIO", "TASTIERA", "BOTTIGLIA", "STADIO", "COMPUTER", "GIURASSICO", "ASTEROIDE", "COLOSSEO", "GELATO", "SPAGHETTI", "MELODIA", "QUADERNO", "PANDORO", "VENEZIA", "UNIVERSO"];
let paroleDisponibili = [...dizionarioBase].sort(() => Math.random() - 0.5);

// --- LOGICA IDENTITÀ ---
function generaCodice() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 5; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
}

const myId = generaCodice();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;

peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    document.getElementById('status-msg').innerText = "🌐 Sistema Online";
});

// --- GESTIONE BOT ---
document.getElementById('bot-btn').onclick = () => {
    isBot = true;
    amIMaster = false;
    if (paroleDisponibili.length === 0) paroleDisponibili = [...dizionarioBase].sort(() => Math.random() - 0.5);
    secretWord = paroleDisponibili.pop().toUpperCase();
    startPlay("SOLO VS BOT");
};

// --- GESTIONE MULTIPLAYER ---
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
        document.getElementById('status-msg').innerText = "✅ Collegato!";
        amIMaster = myId < conn.peer;
        
        setTimeout(() => {
            document.getElementById('setup-screen').classList.add('hidden');
            if(amIMaster) {
                document.getElementById('host-screen').classList.remove('hidden');
            } else {
                // Sfidante entra in arena ma aspetta la parola
                document.getElementById('play-screen').classList.remove('hidden');
                document.getElementById('role-badge').innerText = "SFIDANTE";
                document.getElementById('word-display').innerText = "IL MASTER STA SCRIVENDO...";
                document.getElementById('keyboard').classList.add('hidden');
            }
        }, 800);
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

// --- AZIONI MASTER ---
document.getElementById('start-btn').onclick = () => {
    const w = document.getElementById('secret-word').value.trim().toUpperCase();
    if(w.length < 3) return alert("Parola troppo corta!");
    secretWord = w;
    conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

// --- LOGICA DI GIOCO CORE ---
function startPlay(role) {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role;
    
    // Reset variabili
    guessedLetters = [];
    mistakes = 0;
    document.getElementById('wrong-letters').innerText = "";
    
    // Reset UI
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);

    if(amIMaster) {
        document.getElementById('keyboard').classList.add('hidden');
    } else {
        document.getElementById('keyboard').classList.remove('hidden');
        document.querySelectorAll('.key').forEach(k => k.classList.remove('used'));
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
    if(!secretWord) return;
    
    // Genera la stringa dei trattini o delle lettere indovinate
    const displayStr = secretWord.split('').map(l => guessedLetters.includes(l) ? l : "_").join(' ');
    document.getElementById('word-display').innerText = displayStr;
    
    // Controllo fine gioco
    if(!displayStr.includes('_') && secretWord !== "") {
        end(true);
    } else if(mistakes >= 6) {
        end(false);
    }
}

// --- TASTIERA ---
const kb = document.getElementById('keyboard');
kb.innerHTML = ""; 
"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div');
    b.className = 'key'; b.innerText = l;
    b.onclick = () => {
        if(amIMaster) return;
        if(b.classList.contains('used')) return;
        b.classList.add('used');
        if(!isBot && conn && conn.open) conn.send({ type: 'GUESS', letter: l });
        processMove(l);
    };
    kb.appendChild(b);
});

// --- EMOJI E GRAFICA ---
function sendEmoji(e) {
    if(!isBot && conn && conn.open) conn.send({ type: 'EMOJI', emoji: e });
    showEmoji(e);
}

function showEmoji(e) {
    const el = document.createElement('div');
    el.className = 'floating-emoji'; el.innerText = e;
    document.getElementById('emoji-area').appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

function draw(s) {
    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath();
    if(s === 1) ctx.arc(100, 40, 20, 0, Math.PI*2);
    if(s === 2) { ctx.moveTo(100, 60); ctx.lineTo(100, 120); }
    if(s === 3) { ctx.moveTo(100, 80); ctx.lineTo(70, 100); }
    if(s === 4) { ctx.moveTo(100, 80); ctx.lineTo(130, 100); }
    if(s === 5) { ctx.moveTo(100, 120); ctx.lineTo(70, 160); }
    if(s === 6) { ctx.moveTo(100, 120); ctx.lineTo(130, 160); }
    ctx.stroke();
}

function end(win) {
    setTimeout(() => {
        document.getElementById('overlay').classList.remove('hidden');
        document.getElementById('result-title').innerText = win ? "DOMINIO" : "SCONFITTA";
        document.getElementById('result-title').style.color = win ? "var(--neon-blue)" : "var(--neon-pink)";
        document.getElementById('result-desc').innerText = "La parola era: " + secretWord;
    }, 500);
}

document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(myId);
    document.getElementById('copy-btn').innerText = "COPIATO!";
    setTimeout(() => document.getElementById('copy-btn').innerText = "COPIA CODICE", 2000);
};
