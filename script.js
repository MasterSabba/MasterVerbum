const peerConfig = { config: { 'iceServers': [{ url: 'stun:stun.l.google.com:19302' }] } };
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId, peerConfig);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, myScore = 0, oppScore = 0, isMuted = false;
let gameMode = "CLASSIC"; // "CLASSIC" o "HACKER"
let powerUsed = false; // Un solo potere a round

const RANGHI = [
    { min: 0, name: "SCRIPT KIDDIE" },
    { min: 5, name: "NETWORK INFILTRATOR" },
    { min: 15, name: "SYSTEM ARCHITECT" },
    { min: 30, name: "CYBER GHOST" },
    { min: 50, name: "GOD MODE" }
];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- LOGICA RANGHI ---
function updateRank() {
    const rank = RANGHI.slice().reverse().find(r => myScore >= r.min);
    const existing = document.getElementById('rank-badge');
    if (existing) existing.innerText = rank.name;
    else {
        const rb = document.createElement('div');
        rb.id = 'rank-badge'; rb.className = 'rank-display';
        rb.innerText = rank.name;
        document.querySelector('.neon-title').after(rb);
    }
}

// --- POTERI ---
function usePower(type) {
    if (powerUsed) return;
    powerUsed = true;
    document.querySelectorAll('.power-btn').forEach(b => b.disabled = true);

    if (type === 'DECRYPTER') { // Rivela una lettera random
        const available = secretWord.split('').filter(l => !guessedLetters.includes(l));
        if (available.length > 0) {
            const pick = available[Math.floor(Math.random() * available.length)];
            processMove(pick);
            if (conn) conn.send({ type: 'GUESS', letter: pick });
        }
    }
    if (type === 'FIREWALL') { // Aggiunge 15 secondi al timer per il Master (svantaggio per lo sfidante)
         if (conn) conn.send({ type: 'POWER', action: 'ADD_TIME' });
    }
}

// --- SETUP MULTIPLAYER ---
peer.on('open', id => {
    document.getElementById('my-id').innerText = id;
    updateRank();
});

peer.on('connection', c => { conn = c; setupLogic(); });

document.getElementById('connect-btn').onclick = () => {
    const target = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(target) { 
        conn = peer.connect(target); 
        conn.on('open', () => setupLogic());
    }
};

function setupLogic() {
    amIMaster = myId < conn.peer;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('score-board').classList.remove('hidden');
    
    // Scelta modalità (Solo il primo round o Master decide)
    if(amIMaster) {
        const mode = confirm("ATTIVARE MODALITÀ HACKER? (Con Poteri Speciali)") ? "HACKER" : "CLASSIC";
        gameMode = mode;
        conn.send({ type: 'SET_MODE', mode: mode });
        document.getElementById('host-screen').classList.remove('hidden');
    } else {
        document.getElementById('play-screen').classList.remove('hidden');
        document.getElementById('word-display').innerText = "SINCRONIZZAZIONE...";
    }

    conn.on('data', data => {
        if (data.type === 'SET_MODE') gameMode = data.mode;
        else if (data.type === 'START') { secretWord = data.word; startPlay("SFIDANTE"); }
        else if (data.type === 'GUESS') processMove(data.letter);
        else if (data.type === 'END') end(data.win, true);
        else if (data.type === 'REMATCH') prepareNextRound();
        else if (data.type === 'POWER' && data.action === 'ADD_TIME') {
            timeLeft = Math.max(0, timeLeft - 15); // Toglie tempo allo sfidante
            vibrate([100, 50, 100]);
        }
    });
}

// --- GAME CORE ---
function startPlay(role) {
    document.getElementById('host-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('role-badge').innerText = role + " (" + gameMode + ")";
    
    guessedLetters = []; mistakes = 0; powerUsed = false;
    document.getElementById('word-display').classList.remove('glitch-error');
    
    // UI Poteri
    const pContainer = document.getElementById('emoji-bar');
    pContainer.querySelectorAll('.power-btn').forEach(b => b.remove());
    
    if (gameMode === "HACKER") {
        const btn = document.createElement('button');
        btn.className = 'power-btn';
        if (role === "SFIDANTE") {
            btn.innerText = "USE DECRYPTER";
            btn.onclick = () => usePower('DECRYPTER');
        } else {
            btn.innerText = "USE FIREWALL (-15s)";
            btn.onclick = () => usePower('FIREWALL');
        }
        pContainer.prepend(btn);
    }

    const ctx = document.getElementById('hangmanCanvas').getContext('2d');
    ctx.clearRect(0,0,200,200);
    
    if(role !== "MASTER") { 
        document.getElementById('keyboard').classList.remove('hidden'); 
        startTimer(); render(); 
    } else { 
        document.getElementById('word-display').innerText = "INFILTRAZIONE IN CORSO..."; 
        clearInterval(timerInterval);
    }
}

function processMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    if(!secretWord.includes(l)) { 
        mistakes++; draw(mistakes); 
        document.getElementById('word-display').classList.add('glitch-error');
        setTimeout(() => document.getElementById('word-display').classList.remove('glitch-error'), 300);
        playSound('error'); vibrate(100);
    } else { playSound('click'); }
    render();
}

function render() {
    const container = document.getElementById('word-display');
    if(!secretWord || container.innerText.includes("INFILTRAZIONE")) return;
    container.innerHTML = secretWord.split('').map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join('');
    
    if(secretWord.split('').every(l => guessedLetters.includes(l))) end(true);
    else if(mistakes >= 6) end(false);
}

function end(win, fromRemote = false) {
    clearInterval(timerInterval);
    if(!fromRemote && !isBot && conn) conn.send({ type: 'END', win: win });

    const ov = document.getElementById('overlay');
    ov.classList.remove('hidden');
    
    let ioHoVinto = amIMaster ? !win : win;
    document.getElementById('result-title').innerText = ioHoVinto ? "MISSIONE COMPIUTA" : "SISTEMA COMPROMESSO";
    document.getElementById('result-title').className = ioHoVinto ? "win-glow" : "lose-glow";

    if(!fromRemote) {
        if(ioHoVinto) { myScore++; spawnParticles(); } else { oppScore++; }
        document.getElementById('my-score').innerText = myScore;
        document.getElementById('opp-score').innerText = oppScore;
        updateRank();
    }
    document.getElementById('result-desc').innerText = "KEYWORD: " + secretWord;
}

// ... (Mantieni le funzioni startTimer, draw, spawnParticles, sendEmoji del codice precedente) ...

function startTimer() {
    clearInterval(timerInterval); 
    timeLeft = 60;
    timerInterval = setInterval(() => {
        timeLeft--; 
        document.getElementById('timer-display').innerText = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
        if(timeLeft <= 0) end(false);
    }, 1000);
}

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

function spawnParticles() {
    for(let i=0; i<30; i++) {
        const p = document.createElement('div'); p.className = 'particle';
        p.style.left = Math.random()*100+"vw"; p.style.top = "-10px";
        document.getElementById('particles-container').appendChild(p);
        setTimeout(()=>p.remove(), 3000);
    }
}

document.getElementById('start-btn').onclick = () => {
    secretWord = document.getElementById('secret-word').value.trim().toUpperCase();
    if(secretWord.length < 3) return;
    if(conn) conn.send({ type: 'START', word: secretWord });
    startPlay("MASTER");
};

document.getElementById('retry-btn').onclick = () => {
    document.getElementById('overlay').classList.add('hidden');
    if(conn) { conn.send({ type: 'REMATCH' }); prepareNextRound(); }
};

function prepareNextRound() {
    amIMaster = !amIMaster;
    document.getElementById('play-screen').classList.add('hidden');
    if(amIMaster) {
        document.getElementById('host-screen').classList.remove('hidden');
    } else {
        document.getElementById('play-screen').classList.remove('hidden');
        document.getElementById('word-display').innerText = "IN ATTESA...";
    }
}

"QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(l => {
    const b = document.createElement('div'); b.className = 'key'; b.innerText = l;
    b.onclick = () => { if(!amIMaster && !b.classList.contains('used')) { b.classList.add('used'); if(conn) conn.send({type:'GUESS', letter:l}); processMove(l); } };
    document.getElementById('keyboard').appendChild(b);
});

document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(myId);
    document.getElementById('copy-btn').innerText = "COPIATO!";
    setTimeout(() => document.getElementById('copy-btn').innerText = "COPIA CODICE", 2000);
};

document.getElementById('exit-btn').onclick = () => location.reload();
document.getElementById('secret-word').addEventListener('input', function(e) {
    this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '');
});
