// --- CONFIGURAZIONE CORE ---
let myId = Math.random().toString(36).substring(2, 7).toUpperCase();
const peer = new Peer(myId);
let conn, secretWord = "", guessedLetters = [], mistakes = 0, amIMaster = false, isBot = false;
let timerInterval, timeLeft = 60, isOverclock = false, isGhost = false;

// CARICAMENTO DATI [AUTO_SAVE]
let myScore = JSON.parse(localStorage.getItem('mv_elite_stats'))?.score || 0;
let myHackerTag = localStorage.getItem('mv_hacker_tag') || "GUEST_USER";

const fallback = ["ALBERO","CASA","CANE","GATTO","LIBRO","PENNA","TAVOLO","SEDIA","FINESTRA","PORTA","STRADA","PIAZZA","SCUOLA","MARE","MONTE","FIUME","LAGO","NUVOLA","PIOGGIA","VENTO","FUOCO","TERRA","ARIA","LUCE","OMBRA","SOGNO","TEMPO","SPAZIO","ANIMA","CUORE","MENTE","CORPO","AMORE","ODIO","PACE","GUERRA","FORZA","ENERGIA","MAGIA","STELLA","PIANETA","GALASSIA","UNIVERSO","COMETA","ASTEROIDE","SATELLITE","ORBITA","GRAVITA","MELA","PERA","BANANA","LIMONE","FRAGOLA","CILIEGIA","PESCA","ARANCIA","UVA","PANE","PASTA","PIZZA","LATTE","UOVO","CARNE","PESCE","FORMAGGIO","VINO","BIRRA","ACQUA","SALE","PEPE","OLIO","ACETO","DOLCE","AMARO","SALATO","ACIDO","CALDO","FREDDO","ROSSO","VERDE","BLU","GIALLO","NERO","BIANCO","GRIGIO","AZZURRO","VIOLA","ROSA","MARRONE"];

// --- TASTIERA FISICA ---
document.addEventListener('keydown', (e) => {
    if (document.getElementById('play-screen').classList.contains('hidden')) return;
    if (amIMaster || document.getElementById('overlay').style.display === 'flex') return;
    const l = e.key.toUpperCase();
    if (l >= 'A' && l <= 'Z' && l.length === 1) {
        const btn = Array.from(document.querySelectorAll('.key')).find(b => b.innerText === l && !b.disabled);
        if (btn) { btn.classList.add('used'); btn.disabled = true; handleMove(l); }
    }
});

// --- UI & LED ---
function updateRankUI() {
    const progress = Math.min((myScore / 100) * 100, 100);
    let r = "NOVICE", c = "#888";
    if(myScore >= 10) { r = "SCRIPT_KIDDIE"; c = "#00d4ff"; }
    if(myScore >= 50) { r = "ELITE_HACKER"; c = "#39ff14"; }
    if(myScore >= 90) { r = "VOID_ARCHITECT"; c = "#ff003c"; }

    document.getElementById('status-text').innerText = `[${myHackerTag}] SYSTEM_READY`;
    document.getElementById('score-me').innerText = myScore; // Aggiorna contatore visivo
    
    const mainLed = document.getElementById('connection-led');
    if(mainLed) { 
        mainLed.className = "led led-on";
        mainLed.onclick = toggleManual; 
    }

    const update = (s) => {
        const f = document.getElementById('rank-bar-fill-' + s);
        const l = document.getElementById('rank-label-' + s);
        if(f) { f.style.width = progress + "%"; f.style.background = c; }
        if(l) { l.innerText = `${r} (${myScore}/100)`; l.style.color = c; }
    };
    update('setup'); update('final');
}

function drawHangman() {
    const canvas = document.getElementById('hangmanCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

    ctx.beginPath();
    if (mistakes > 0) { ctx.arc(80, 20, 10, 0, Math.PI * 2); } 
    if (mistakes > 1) { ctx.moveTo(80, 30); ctx.lineTo(80, 60); } 
    if (mistakes > 2) { ctx.moveTo(80, 40); ctx.lineTo(60, 50); } 
    if (mistakes > 3) { ctx.moveTo(80, 40); ctx.lineTo(100, 50); } 
    if (mistakes > 4) { ctx.moveTo(80, 60); ctx.lineTo(65, 80); } 
    if (mistakes > 5) { ctx.moveTo(80, 60); ctx.lineTo(95, 80); } 
    ctx.stroke();
}

// --- MULTIPLAYER ---
function connectToPeer() {
    const tid = document.getElementById('peer-id-input').value.toUpperCase();
    if (!tid) return;
    document.getElementById('status-text').innerText = "LINKING...";
    conn = peer.connect(tid);
    amIMaster = false; 
    setupConn();
}

peer.on('connection', (c) => { 
    conn = c; 
    amIMaster = true; 
    setupConn(); 
});

function setupConn() {
    conn.on('open', () => {
        document.getElementById('status-text').innerText = "CONNECTED";
        if (amIMaster) {
            let w = prompt("CHOOSE WORD:").toUpperCase();
            secretWord = w.replace(/[^A-Z]/g, '') || "HACK";
            conn.send({ type: 'start', word: secretWord });
            initGame();
        }
    });
    conn.on('data', (d) => {
        if (d.type === 'start') { secretWord = d.word; amIMaster = false; initGame(); }
        else if (d.type === 'move') { handleMove(d.letter); }
    });
}

// --- LOGICA GIOCO ---
function startBotGame() { 
    isBot = true; 
    amIMaster = false; 
    secretWord = fallback[Math.floor(Math.random()*fallback.length)]; 
    initGame(); 
}

function initGame() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('play-screen').classList.remove('hidden');
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('manual-overlay').style.display = 'none';
    
    guessedLetters = []; mistakes = 0; timeLeft = 60;
    isGhost = false; isOverclock = false;
    
    document.querySelectorAll('.btn-pwr').forEach(b => {
        b.disabled = true; b.style.opacity = "0.2"; b.removeAttribute('data-used');
    });

    createKeyboard(); 
    renderWord(); 
    drawHangman();
    
    if (!amIMaster) startTimer();
    else document.getElementById('timer-display').innerText = "LOCK";
}

function handleMove(l) {
    if(guessedLetters.includes(l)) return;
    guessedLetters.push(l);
    
    if (conn && !amIMaster) conn.send({ type: 'move', letter: l });

    if(!secretWord.includes(l)) { 
        if(isGhost) isGhost = false; 
        else mistakes++; 
        drawHangman(); 
    }
    renderWord();
}

function renderWord() {
    const d = document.getElementById('word-display');
    d.innerHTML = secretWord.split("").map(l => `<div class="letter-slot">${guessedLetters.includes(l) ? l : ""}</div>`).join("");
    
    if(secretWord.split("").every(l => guessedLetters.includes(l))) triggerEnd(true);
    else if(mistakes >= 6) triggerEnd(false);
}

function createKeyboard() {
    const k = document.getElementById('keyboard'); 
    k.innerHTML = "";
    "QWERTYUIOPASDFGHJKLZXCVBNM".split("").forEach(l => {
        const b = document.createElement('button'); 
        b.className = "key"; 
        b.innerText = l;
        if(amIMaster) b.disabled = true;
        b.onclick = () => { 
            if(!amIMaster) {
                b.classList.add('used'); 
                b.disabled = true; 
                handleMove(l); 
            }
        };
        k.appendChild(b);
    });
}

// --- POTERI ---
function unlockPower(id) {
    const b = document.getElementById(id);
    if(b && !b.hasAttribute('data-used') && !amIMaster) {
        b.disabled = false;
        b.style.opacity = "1";
        b.style.color = "#00f2ff";
    }
}

function useOverclock() { 
    isOverclock = true; 
    document.getElementById('p-overclock').setAttribute('data-used', 'true');
    resetPowerStyle('p-overclock');
    setTimeout(() => isOverclock = false, 5000); 
}

function useRescan() { 
    if(timeLeft <= 10) return;
    timeLeft -= 10;
    document.getElementById('p-rescan').setAttribute('data-used', 'true');
    resetPowerStyle('p-rescan');
    let missing = secretWord.split("").filter(l => !guessedLetters.includes(l));
    if(missing.length > 0) handleMove(missing[0]);
}

function useGhost() { 
    isGhost = true; 
    document.getElementById('p-ghost').setAttribute('data-used', 'true');
    resetPowerStyle('p-ghost');
}

function resetPowerStyle(id) {
    const b = document.getElementById(id);
    b.disabled = true; b.style.opacity = "0.1";
}

// --- UTILITY ---
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(!isOverclock) timeLeft--;
        if(timeLeft <= 45) unlockPower('p-overclock');
        if(timeLeft <= 30) unlockPower('p-rescan');
        if(timeLeft <= 15) unlockPower('p-ghost');
        
        if(timeLeft <= 0) triggerEnd(false);
        document.getElementById('timer-display').innerText = formatTime(timeLeft);
    }, 1000);
}

function triggerEnd(win) {
    clearInterval(timerInterval);
    if (!amIMaster) {
        if (win) {
            myScore++;
            if (myHackerTag === "GUEST_USER") {
                let n = prompt("NEW TAG:"); if(n) { myHackerTag = n; localStorage.setItem('mv_hacker_tag', n); }
            }
        } else { 
            myScore = Math.max(0, myScore - 1); 
        }
        localStorage.setItem('mv_elite_stats', JSON.stringify({score: myScore}));
        updateRankUI();
    }

    const ov = document.getElementById('overlay');
    ov.style.display = 'flex';
    document.getElementById('result-title').innerText = win ? "ACCESS_GRANTED" : "CONNECTION_TERMINATED";
    document.getElementById('result-title').className = win ? "win-glow" : "lose-glow";
    document.getElementById('result-desc').innerHTML = `KEY: <span style="color:#fff;">${secretWord}</span>`;
}

function toggleManual() {
    const m = document.getElementById('manual-overlay');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function copyId() { navigator.clipboard.writeText(myId); document.getElementById('copy-btn').innerText = "COPIED!"; setTimeout(() => document.getElementById('copy-btn').innerText = "Copy Code", 2000); }
function resetAccount() { if(confirm("WIPE DATA?")) { localStorage.clear(); location.reload(); } }
function formatTime(s) { const m = Math.floor(s/60); const sec = s%60; return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`; }
function retry() { if(isBot) startBotGame(); else location.reload(); }

peer.on('open', (id) => { 
    myId = id;
    document.getElementById('my-id').innerText = id; 
    updateRankUI(); 
});
